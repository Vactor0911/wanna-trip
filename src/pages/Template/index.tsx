import {
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  AvatarGroup,
  useTheme,
} from "@mui/material";
import Tooltip from "../../components/Tooltip";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TextSnippetRoundedIcon from "@mui/icons-material/TextSnippetRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { checkTemplateTimeOverlaps, MAX_BOARDS } from "../../utils/template";
import { useNavigate, useParams } from "react-router";
import axiosInstance, { getCsrfToken } from "../../utils/axiosInstance";
import CardEditDialog from "../../components/CardEditDialog";
import dayjs from "dayjs";
import {
  reorderBoardCardsAtom,
  templateAtom,
  templateInfoAtom,
  templateModeAtom,
  TemplateModes,
} from "../../state/template";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useMoveBoard, useMoveCard } from "../../hooks/template";
import { produce } from "immer";
import { useQueryClient } from "@tanstack/react-query";
import SortMenu from "../../components/SortMenu";
import MapIcon from "@mui/icons-material/Map";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import TemplateMapDialog from "./TemplateMapDialog";
import { downloadExcel } from "../../utils/excelExport";
import { downloadPdf } from "../../utils/pdfExport";
import { downloadText } from "../../utils/textExport";
import { useSnackbar } from "notistack";
import Board from "../../components/template/Board";
import TemplateShareDialog from "./TemplateShareDialog";
import CopyToMyTemplateDialog from "../../components/CopyToMyTemplateDialog";
import { useTemplateSocket } from "../../hooks/socket";
import { getUserProfileImageUrl } from "../../utils";
import { ActiveUser, isAuthInitializedAtom, wannaTripLoginStateAtom } from "../../state";

// 템플릿 모드별 아이콘
const modes = [
  { name: "편집 모드", icon: <EditRoundedIcon /> },
  { name: "열람 모드", icon: <ImportContactsRoundedIcon /> },
];

// 백엔드 템플릿 인터페이스
interface BackendTemplate {
  uuid: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  boards: BackendBoard[] | null;
}

// 백엔드 보드 인터페이스
interface BackendBoard {
  uuid: string;
  dayNumber: number;
  cards: BackendCard[] | null;
}

// 백엔드 카드 인터페이스
interface BackendCard {
  uuid: string;
  content: string;
  startTime: string;
  endTime: string;
  orderIndex: number;
  locked: boolean;
  location: BackendLocation | null;
}

// 백엔드 위치 정보 인터페이스
interface BackendLocation {
  title: string;
  address: string;
  latitude: string;
  longitude: string;
  category: string;
  thumbnailUrl: string;
}

interface TemplateProps {
  uuid?: string; // 템플릿 UUID
  height?: string; // 템플릿 높이
  paddgingX?:
    | string
    | {
        xs?: string;
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
      }; // 좌우 패딩
}

const Template = (props: TemplateProps) => {
  const theme = useTheme();
  const {
    height = "calc(100vh - 82px)",
    paddgingX = {
      xs: "16px",
      sm: "24px",
      xl: `calc(24px + (100vw - ${theme.breakpoints.values.xl}px) / 2)`,
    },
  } = props;

  const { templateUuid } = useParams();

  // 소켓 관련 훅
  const {
    isConnected,
    activeUsers,
    emitFetch,
    emitCardEditingStart,
    emitCardEditingEnd,
  } = useTemplateSocket({
    templateUuid: templateUuid!,
    enabled: !!templateUuid,
    fetchTemplate: () => fetchTemplateData(),
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient(); // 쿼리 클라이언트
  const moveCard = useMoveCard(); // 카드 이동 훅
  const moveBoard = useMoveBoard(); // 보드 이동 훅
  const { enqueueSnackbar } = useSnackbar();

  const [mode, setMode] = useAtom(templateModeAtom); // 열람 모드 여부
  const [template, setTemplate] = useAtom(templateAtom); // 템플릿 상태
  const templateInfo = useAtomValue(templateInfoAtom); // 템플릿 정보 상태
  const loginState = useAtomValue(wannaTripLoginStateAtom); // 로그인 상태
  const isAuthInitialized = useAtomValue(isAuthInitializedAtom); // 인증 초기화 완료 상태
  const [templateTitle, setTemplateTitle] = useState(templateInfo.title); // 템플릿 이름 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태
  const [isTemplateTitleEditing, setIsTemplateTitleEditing] = useState(false); // 템플릿 제목 편집 여부
  const [, reorderBoardCards] = useAtom(reorderBoardCardsAtom); // 카드 순서 변경 함수
  const [isOwner, setIsOwner] = useState(false); // 소유자 여부
  const [hasPermission, setHasPermission] = useState(true); // 편집 권한 여부
  const isEditMode = hasPermission && mode === TemplateModes.EDIT; // 편집 모드 여부
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  ); // 더보기 메뉴 앵커
  const [mapDialogOpen, setMapDialogOpen] = useState(false); // 지도 다이얼로그 열림 상태

  // 템플릿 내 보드 시간 중복 체크 (useMemo로 최적화)
  const { boardOverlaps, hasTemplateOverlap } = useMemo(() => {
    const result = checkTemplateTimeOverlaps(template);
    return {
      boardOverlaps: result.boardOverlaps,
      hasTemplateOverlap: result.boardOverlaps.some((board) => board.hasOverlap),
    };
  }, [template]);

  // 공유하기 다이얼로그 상태
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // 복사 다이얼로그 상태
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  // 템플릿 제목 변경 시 동기화
  useEffect(() => {
    setTemplateTitle(templateInfo.title);
  }, [templateInfo.title]);

  // 템플릿 데이터를 불러온 후 소유자 확인하여 모드 설정
  const fetchTemplateData = useCallback(async () => {
    // uuid가 없으면 종료
    if (!templateUuid) {
      return;
    }

    try {
      // setIsLoading(true);
      setError(null);
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 템플릿 데이터 가져오기
      const response = await axiosInstance.get(`/template/${templateUuid}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        const backendTemplate = response.data.template as BackendTemplate;

        // 백엔드에서 제공한 소유자 여부 정보 직접 사용
        const isCurrentUserHasPermission = response.data.hasPermission;

        // 권한 상태 업데이트
        setIsOwner(response.data.isOwner);
        setHasPermission(isCurrentUserHasPermission);

        // 소유자 정보를 localStorage에 저장 (다른 컴포넌트에서 사용)
        localStorage.setItem(
          "template_isOwner",
          String(isCurrentUserHasPermission)
        );

        // 권한이 있으면 편집 모드로, 없으면 열람 모드로 설정
        if (isCurrentUserHasPermission) {
          setMode(TemplateModes.EDIT);
        } else {
          setMode(TemplateModes.VIEW);
        }

        // 보드와 카드 정보를 포함한 템플릿 데이터로 변환
        const transformedTemplate = {
          uuid: backendTemplate.uuid,
          title: backendTemplate.title,
          boards: (backendTemplate.boards || []).map((board, index) => ({
            uuid: board.uuid,
            dayNumber: board.dayNumber,
            title: `Day ${index + 1}`,
            cards: (board.cards || []).map((card) => {
              // 좌표 파싱 및 유효성 검증
              const parsedLat = parseFloat(card.location?.latitude || "");
              const parsedLng = parseFloat(card.location?.longitude || "");
              
              // 유효한 좌표인지 확인 (NaN, 0, 한국 영역 외 제외)
              const isValidCoordinate = 
                !isNaN(parsedLat) && !isNaN(parsedLng) &&
                !(parsedLat === 0 && parsedLng === 0) &&
                parsedLat >= 33 && parsedLat <= 43 &&
                parsedLng >= 124 && parsedLng <= 132;

              return {
                uuid: card.uuid,
                content: card.content || "",
                // 시간만 있는 경우 임시 기본 날짜를 추가하여 파싱
                startTime: card.startTime
                  ? dayjs(`2001-01-01T${card.startTime}`)
                  : dayjs(),
                endTime: card.endTime
                  ? dayjs(`2001-01-01T${card.endTime}`)
                  : dayjs(),
                orderIndex: card.orderIndex,
                locked: card.locked, // 기본값 - 잠금 해제 상태
                location: card.location
                  ? {
                      title: card.location.title,
                      address: card.location.address,
                      // 유효한 좌표만 설정, 그렇지 않으면 undefined
                      latitude: isValidCoordinate ? parsedLat : undefined,
                      longitude: isValidCoordinate ? parsedLng : undefined,
                      category: card.location.category,
                      thumbnailUrl: card.location.thumbnailUrl,
                    }
                  : undefined,
              };
            }),
          })),
        };

        setTemplate(transformedTemplate);
        setTemplateTitle(backendTemplate.title);

        // 카드 순서 정렬
        reorderBoardCards();
      } else {
        setError("템플릿 데이터를 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("템플릿 데이터 로딩 오류:", err);
      setError("템플릿을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [reorderBoardCards, setMode, setTemplate, templateUuid]);

  // UUID가 있으면 백엔드에서 템플릿 데이터 가져오기
  useEffect(() => {
    // 인증 초기화가 완료된 후에만 템플릿 데이터 가져오기
    if (isAuthInitialized) {
      fetchTemplateData();
    }
  }, [fetchTemplateData, isAuthInitialized]);

  // 모드 변경
  const handleModeChange = useCallback(() => {
    setMode((prevMode) =>
      prevMode === TemplateModes.EDIT ? TemplateModes.VIEW : TemplateModes.EDIT
    );
  }, [setMode]);

  // 맨 뒤에 보드 추가 함수
  const handleAddBoardToEnd = useCallback(async () => {
    // 보드 개수가 최대 개수보다 많으면 중단
    if (template.boards.length >= MAX_BOARDS) {
      return;
    }

    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 백엔드 API 호출하여 맨 뒤에 새 보드 생성
      const response = await axiosInstance.post(
        `/board`,
        {
          templateUuid: template.uuid,
          dayNumber: template.boards.length + 1,
        },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 템플릿 데이터 패치
        await fetchTemplateData();
        emitFetch();
      }
    } catch (error) {
      console.error("보드 추가 오류:", error);
    }
  }, [template.boards.length, template.uuid, fetchTemplateData, emitFetch]);

  // 템플릿 제목 클릭
  const handleTemplateTitleClick = useCallback(() => {
    setIsTemplateTitleEditing((prev) => !prev);
  }, []);

  // 템플릿 제목 변경
  const handleTemplateTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTemplateTitle(event.target.value);
    },
    []
  );

  // 템플릿 제목 편집 완료
  const handleTemplateTitleClickAway = useCallback(async () => {
    try {
      const newTemplate = { ...template };
      newTemplate.title = templateTitle;
      setTemplate(newTemplate);

      // uuid로 템플릿 데이터를 가져왔으므로, 해당 uuid를 사용하여 API 요청
      if (template.uuid) {
        const csrfToken = await getCsrfToken();

        await axiosInstance.put(
          `/template/${template.uuid}`,
          { title: newTemplate.title },
          { headers: { "X-CSRF-Token": csrfToken } }
        );

        // 템플릿 수정 알림 브로드캐스트
        emitFetch();
      } else {
        console.error("템플릿 UUID가 유효하지 않습니다.");
      }
    } catch (error) {
      console.error("템플릿 제목 변경 중 오류 발생:", error);
    } finally {
      setIsTemplateTitleEditing(false);
    }
  }, [emitFetch, setTemplate, template, templateTitle]);

  // 드래그 & 드롭 핸들러
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, type } = result;

      // destination이 없으면 중단
      if (!destination) return;

      // 변경점이 없는 경우 종료
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      // 이전 상태의 템플릿 저장
      const prevTemplate = template;
      let newTemplate; // 변경된 템플릿을 저장할 변수

      // type = 드래그된 요소의 타입 (보드: board, 카드: card)
      if (type === "card") {
        // 카드 드래그 & 드롭 처리
        // 변경된 템플릿 생성
        newTemplate = produce(prevTemplate, (draft) => {
          // 원본, 대상 보드 찾기
          const sourceBoard = draft.boards.find(
            (b) => b.uuid === source.droppableId
          );
          const destinationBoard = draft.boards.find(
            (b) => b.uuid === destination.droppableId
          );

          // 보드가 존재하지 않으면 중단
          if (!sourceBoard || !destinationBoard) return;

          // 원본 보드에서 카드 추출
          const [movedCard] = sourceBoard.cards.splice(source.index, 1);
          if (!movedCard) return;

          // 대상 보드에 카드 추가
          destinationBoard.cards.splice(destination.index, 0, movedCard);

          // 두 보드의 orderIndex 재계산
          [sourceBoard, destinationBoard].forEach((board) =>
            board.cards.forEach((c, idx) => (c.orderIndex = idx))
          );
        });

        // 카드 이동 API 호출
        moveCard.mutate({
          cardUuid: result.draggableId,
          boardUuid: destination.droppableId,
          orderIndex: destination.index + 1,
          prevTemplate: prevTemplate,
          emitFetch,
        });
      } else {
        // 보드 드래그 & 드롭 처리
        newTemplate = produce(prevTemplate, (draft) => {
          // 원본 보드 추출
          const sourceBoard = draft.boards.splice(source.index, 1);

          // 대상 위치에 보드 삽입
          draft.boards.splice(destination.index, 0, sourceBoard[0]);

          // 보드의 dayNumber 업데이트
          draft.boards.forEach((board, index) => {
            board.dayNumber = index + 1; // dayNumber는 1부터 시작
          });
        });

        // 보드 이동 API 호출
        moveBoard.mutate({
          templateUuid: template.uuid || "",
          boardUuid: result.draggableId,
          dayNumber: destination.index + 1,
          prevTemplate: prevTemplate,
          emitFetch,
        });
      }

      // 캐시와 jotai atom 동시 반영
      queryClient.setQueryData(["template"], newTemplate);
      setTemplate(newTemplate);
    },
    [emitFetch, moveBoard, moveCard, queryClient, setTemplate, template]
  );

  // 템플릿 내 모든 카드 정렬 함수 (시작 시간 순)
  const handleSortButtonClick = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 백엔드 API 호출
      const response = await axiosInstance.put(
        `/template/sort/${template.uuid}`,
        {},
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 정렬 후 템플릿 데이터 다시 가져오기
        await fetchTemplateData();
        emitFetch();
        enqueueSnackbar("카드가 시작 시간 순으로 정렬되었습니다.", {
          variant: "success",
        });
      }
    } catch (error) {
      console.error("카드 정렬 오류:", error);
      enqueueSnackbar("카드 정렬 중 오류가 발생했습니다.", {
        variant: "error",
      });
    }
  }, [template.uuid, fetchTemplateData, emitFetch, enqueueSnackbar]);

  // 시간 중복이 있는 첫 번째 보드로 스크롤하는 함수
  const scrollToFirstOverlappingBoard = useCallback(() => {
    // 충돌이 있는 첫 번째 보드 찾기
    const firstOverlappingBoard = boardOverlaps.find(
      (board) => board.hasOverlap
    );

    if (firstOverlappingBoard) {
      // 해당 보드 요소 찾기
      const boardElement = document.getElementById(
        `board-${firstOverlappingBoard.boardUuid}`
      );
      if (boardElement) {
        // 부드러운 스크롤로 해당 보드로 이동
        boardElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // 사용자에게 피드백 제공
        enqueueSnackbar("시간이 중복된 보드로 이동했습니다.", {
          variant: "info",
        });

        // 시각적 효과로 보드 강조 (선택 사항)
        boardElement.classList.add("highlight-board");
        setTimeout(() => {
          boardElement.classList.remove("highlight-board");
        }, 2000);
      }
    }
  }, [boardOverlaps, enqueueSnackbar]);

  // 더보기 메뉴 열기
  const handleMoreMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setMoreMenuAnchor(event.currentTarget);
    },
    []
  );

  // 더보기 메뉴 닫기
  const handleMoreMenuClose = useCallback(() => {
    setMoreMenuAnchor(null);
  }, []);

  // 지도 클릭 핸들러
  const handleMapClick = useCallback(() => {
    setMapDialogOpen(true);
  }, []);

  // 지도 다이얼로그 닫기
  const handleMapDialogClose = useCallback(() => {
    setMapDialogOpen(false);
  }, []);

  // Excel 다운로드 실행 (미리보기 없이 바로 다운로드)
  const handleExcelDownload = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await downloadExcel(template as any);
      enqueueSnackbar(result.message, {
        variant: result.success ? "success" : "error",
      });
    } catch (error) {
      console.error("Excel 다운로드 오류:", error);
      enqueueSnackbar("Excel 다운로드 중 오류가 발생했습니다.", {
        variant: "error",
      });
    }
    handleMoreMenuClose();
  }, [enqueueSnackbar, template, handleMoreMenuClose]);

  const handleTextDownload = useCallback(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = downloadText(template as any);
      enqueueSnackbar(result.message, {
        variant: result.success ? "success" : "error",
      });
    } catch (error) {
      console.error("텍스트 다운로드 오류:", error);
      enqueueSnackbar("텍스트 다운로드 중 오류가 발생했습니다.", {
        variant: "error",
      });
    }
    handleMoreMenuClose();
  }, [enqueueSnackbar, template, handleMoreMenuClose]);

  // 복사 다이얼로그 열기
  const handleCopyDialogOpen = useCallback(() => {
    // 로그인 상태 확인
    if (!loginState.isLoggedIn) {
      enqueueSnackbar("로그인이 필요한 기능입니다.", {
        variant: "warning",
      });
      return;
    }
    setCopyDialogOpen(true);
  }, [loginState.isLoggedIn, enqueueSnackbar]);

  // 복사 다이얼로그 닫기
  const handleCopyDialogClose = useCallback(() => {
    setCopyDialogOpen(false);
  }, []);

  // 복사 성공 핸들러
  const handleCopySuccess = useCallback(() => {
    enqueueSnackbar("템플릿이 성공적으로 복사되었습니다.", {
      variant: "success",
    });
    // 현재 템플릿 데이터 다시 불러오기 (실시간 업데이트)
    fetchTemplateData();
    emitFetch();
  }, [enqueueSnackbar, fetchTemplateData, emitFetch]);

  // 공유하기 버튼 클릭
  const handleShareButtonClick = useCallback(() => {
    // 소유자가 아니면 링크 복사
    if (!isOwner) {
      navigator.clipboard.writeText(window.location.href);
      enqueueSnackbar("템플릿 주소가 클립보드에 복사되었습니다.", {
        variant: "success",
      });
      return;
    }

    // 소유자면 공유하기 대화상자 열기
    setShareDialogOpen(true);
  }, [enqueueSnackbar, isOwner]);

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Stack height={height} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <Stack height={height} alignItems="center" justifyContent="center">
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/template")}
          sx={{ mt: 2 }}
        >
          뒤로 가기
        </Button>
      </Stack>
    );
  }

  return (
    <>
      {/* 템플릿 페이지 */}
      <Stack
        height={height}
        sx={{
          "& .MuiIconButton-root > svg": {
            color: theme.palette.black.main,
          },
        }}
      >
        {/* 상단 컨테이너 */}
        <Container
          maxWidth="xl"
          sx={{
            marginTop: 5,
          }}
        >
          <Stack
            direction="row"
            width="100%"
            height="40px"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* 좌측 컨테이너 */}
            <Stack
              direction="row"
              alignItems="center"
              gap={0.5}
              sx={{
                minWidth: 0,
                overflow: "hidden",
                maxWidth: { xs: "60%", sm: "70%", md: "80%" }, // 화면 크기에 따라 최대 너비 제한
              }}
            >
              {isTemplateTitleEditing ? (
                <ClickAwayListener onClickAway={handleTemplateTitleClickAway}>
                  <TextField
                    value={templateTitle}
                    onChange={handleTemplateTitleChange}
                    autoFocus
                    sx={{
                      minWidth: 0,
                      "& input": {
                        padding: 1,
                        fontWeight: "bold",
                        fontSize: theme.typography.h4.fontSize,
                      },
                    }}
                  />
                </ClickAwayListener>
              ) : (
                // 제목 표시와 경고 아이콘을 묶어서 표시하기 위한 컨테이너
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ flexGrow: 1, minWidth: 0 }}
                >
                  {/* 소유자에 따라 Button 또는 Typography 표시 */}
                  {isEditMode ? (
                    // 소유자인 경우 - 클릭 가능한 버튼
                    <Button
                      onClick={handleTemplateTitleClick}
                      sx={{
                        minWidth: 0,
                        maxWidth: "100%",
                        overflow: "hidden",
                        padding: 0,
                        textTransform: "none",
                        flexShrink: 1,
                        flexGrow: 1,
                        justifyContent: "flex-start",
                      }}
                    >
                      <Typography
                        variant="h4"
                        color="black"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: "bold",
                        }}
                      >
                        {template.title}
                      </Typography>
                    </Button>
                  ) : (
                    // 소유자가 아닌 경우 - 클릭 불가능한 Typography
                    <Typography
                      variant="h4"
                      color="black"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: "bold",
                        flexShrink: 1,
                        flexGrow: 1,
                      }}
                    >
                      {template.title}
                    </Typography>
                  )}
                </Stack>
              )}

              {/* 권한에 따른 정렬하기 보이기 여부 */}
              <Stack direction="row" alignItems="center" gap={0.5}>
                {isEditMode && (
                  <SortMenu
                    onSortStart={handleSortButtonClick}
                    tooltipTitle="템플릿 전체 정렬하기"
                  />
                )}
                <Tooltip title="지도 보기">
                  <IconButton size="small" onClick={handleMapClick}>
                    <MapIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* 시간 중복 경고 아이콘 - 중복이 있을 때만 표시 */}
              {hasTemplateOverlap && (
                <Tooltip
                  title={
                    <div>
                      <Typography variant="body2">
                        템플릿 내 동일한 시간대가 존재합니다.
                      </Typography>
                      <Typography variant="body2">
                        시간이 겹치는 일정을 확인하세요.
                      </Typography>
                    </div>
                  }
                >
                  <IconButton
                    size="small"
                    onClick={scrollToFirstOverlappingBoard}
                    sx={{
                      padding: { xs: 0.2, sm: 0.5 }, // 모바일에서 패딩 줄임
                    }}
                  >
                    <ReportProblemRoundedIcon
                      sx={{
                        color: `${theme.palette.error.main} !important`,
                        fontSize: "1.5rem",
                        flexShrink: 0,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}

              {/* 연결 상태 표시 */}
              <Chip
                label={isConnected ? "실시간 연결됨" : "연결 끊김"}
                color={isConnected ? "success" : "error"}
                size="small"
              />

              {/* 활성 사용자 아바타 */}
              {activeUsers.length > 0 && (
                <AvatarGroup max={4}>
                  {activeUsers.map((user: ActiveUser) => (
                    <Tooltip key={user.userUuid} title={user.userName}>
                      <Avatar
                        src={getUserProfileImageUrl(user.profileImage)}
                        alt={user.userName}
                        sx={{
                          border: `3px solid ${user.color} !important`,
                          boxSizing: "border-box",
                        }}
                      />
                    </Tooltip>
                  ))}
                </AvatarGroup>
              )}

              <Typography variant="body2" color="text.secondary">
                {activeUsers.length}명 작업 중
              </Typography>
            </Stack>

            {/* 우측 컨테이너 */}
            <Stack direction="row" alignContent="inherit" gap={0.5}>
              {/* 모드 선택 버튼 - 편집 권한이 있어야 볼 수 있음 */}
              {hasPermission && (
                <Tooltip
                  title={mode === modes[0].name ? "편집 모드" : "열람 모드"}
                >
                  <IconButton size="small" onClick={handleModeChange}>
                    {mode === modes[0].name ? (
                      <EditRoundedIcon />
                    ) : (
                      <ImportContactsRoundedIcon />
                    )}
                  </IconButton>
                </Tooltip>
              )}

              {/* 편집 권한이 없으면 안내 표시 - 모바일에서는 숨김 */}
              {!hasPermission && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: { xs: "none", sm: "flex" }, // 모바일에서 숨김
                    alignItems: "center",
                    mr: 1,
                  }}
                >
                  <ImportContactsRoundedIcon
                    fontSize="small"
                    sx={{ mr: 0.5 }}
                  />
                  열람 모드 (편집 불가)
                </Typography>
              )}

              {/* 열람 모드일 때 복사 버튼 표시 */}
              {!isEditMode && (
                <Tooltip title="내 템플릿으로 복사">
                  <IconButton size="small" onClick={handleCopyDialogOpen}>
                    <ContentCopyRoundedIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* 공유하기 버튼 */}
              <Tooltip title="공유하기">
                <IconButton size="small" onClick={handleShareButtonClick}>
                  <ShareRoundedIcon />
                </IconButton>
              </Tooltip>

              {/* 더보기 버튼 */}
              <Tooltip title="더보기">
                <IconButton size="small" onClick={handleMoreMenuOpen}>
                  <MoreVertRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Container>

        {/* 드래그 & 드롭 wrapper */}
        <DragDropContext onDragEnd={isEditMode ? onDragEnd : () => {}}>
          {/* 보드 컨테이너 */}
          <Stack
            direction="row"
            height="100%"
            gap={5}
            paddingX={paddgingX}
            paddingY={5}
            sx={{
              overflowX: "auto",
            }}
          >
            <Droppable
              droppableId="board"
              direction="horizontal"
              type="board"
              isDropDisabled={!isEditMode} // 소유자가 아니면 드롭 불가능
            >
              {(provided) => (
                <Stack
                  direction="row"
                  height="100%"
                  gap={5}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {template.boards.map((board, index) => (
                    <Draggable
                      key={`board-${board.uuid || index}`}
                      draggableId={`${board.uuid || index}`}
                      index={index}
                      isDragDisabled={!isEditMode} // 소유자가 아니면 드래그 불가능
                    >
                      {(provided) => (
                        <Board
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          key={`board-${board.uuid || index}`}
                          day={index + 1}
                          boardData={board} // 보드 데이터 직접 전달
                          fetchTemplateData={fetchTemplateData} // 함수 전달
                          isOwner={isEditMode} // 소유자 여부 전달
                          id={`board-${board.uuid}`} // ID 속성 추가
                          emitFetch={emitFetch}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Stack>
              )}
            </Droppable>

            {/* 보드 추가 버튼 - 편집 권한이 있어야 볼 수 있음 */}
            {isEditMode && template.boards.length < MAX_BOARDS && (
              <Box>
                <Tooltip title="보드 추가하기" placement="top">
                  <Button
                    onClick={handleAddBoardToEnd}
                    sx={{
                      padding: 0,
                    }}
                  >
                    {/* 기존 코드 유지 */}
                    <Paper
                      elevation={3}
                      sx={{
                        width: "300px",
                        height: "80px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: theme.palette.secondary.main,
                        borderRadius: "inherit",
                        overflow: "hidden",
                      }}
                    >
                      <Paper
                        elevation={3}
                        sx={{
                          display: "flex",
                          padding: 0.5,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "50%",
                        }}
                      >
                        <AddRoundedIcon
                          sx={{
                            color: theme.palette.primary.main,
                            fontSize: "2.5rem",
                          }}
                        />
                      </Paper>
                    </Paper>
                  </Button>
                </Tooltip>
              </Box>
            )}
          </Stack>
        </DragDropContext>
      </Stack>

      {/* 카드 편집 대화상자 */}
      <CardEditDialog
        fetchTemplateData={fetchTemplateData}
        emitFetch={emitFetch}
        emitCardEditingStart={emitCardEditingStart}
        emitCardEditingEnd={emitCardEditingEnd}
      />

      {/* 더보기 메뉴 */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={handleMoreMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={async () => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const result = await downloadPdf(template as any);
              enqueueSnackbar(result.message, {
                variant: result.success ? "success" : "error",
              });
            } catch (error) {
              console.error("PDF 다운로드 오류:", error);

              enqueueSnackbar("PDF 다운로드 중 오류가 발생했습니다.", {
                variant: "error",
              });
            }
            handleMoreMenuClose();
          }}
        >
          <ListItemIcon>
            <PictureAsPdfRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF 다운로드</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExcelDownload}>
          <ListItemIcon>
            <TableChartRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excel 다운로드</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleTextDownload}>
          <ListItemIcon>
            <TextSnippetRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>텍스트 다운로드</ListItemText>
        </MenuItem>
      </Menu>

      {/* 지도 대화상자 */}
      {template && (
        <TemplateMapDialog
          open={mapDialogOpen}
          onClose={handleMapDialogClose}
          template={template}
        />
      )}

      {/* 공유하기 대화상자 */}
      <TemplateShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      />

      {/* 복사 대화상자 */}
      {templateUuid && (
        <CopyToMyTemplateDialog
          open={copyDialogOpen}
          onClose={handleCopyDialogClose}
          onSuccess={handleCopySuccess}
          copyType="template"
          sourceUuid={templateUuid}
          sourceTitle={template.title}
        />
      )}
    </>
  );
};

export default Template;
