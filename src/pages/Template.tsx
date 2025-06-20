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
  Snackbar,
  Alert,
} from "@mui/material";
import Tooltip from "../components/Tooltip";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import { useCallback, useEffect, useState } from "react";
import Board from "../components/Board";
import { theme } from "../utils/theme";
import { useAtom } from "jotai";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { checkTemplateTimeOverlaps, MAX_BOARDS } from "../utils/template";
import { useNavigate, useParams } from "react-router";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import CardEditDialog from "../components/CardEditDialog";
import dayjs from "dayjs";
import {
  reorderBoardCardsAtom,
  templateAtom,
  templateModeAtom,
  TemplateModes,
} from "../state/template";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useMoveBoard, useMoveCard } from "../hooks/template";
import { produce } from "immer";
import { useQueryClient } from "@tanstack/react-query";
import SortMenu from "../components/SortMenu";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";

// 템플릿 모드별 아이콘
const modes = [
  { name: "편집 모드", icon: <EditRoundedIcon /> },
  { name: "열람 모드", icon: <ImportContactsRoundedIcon /> },
];

// 백엔드 템플릿 인터페이스
interface BackendTemplate {
  userUuid?: string; // 템플릿 소유자 UUID
  template_id: number;
  template_uuid: string;
  title: string;
  boards: BackendBoard[];
}

// 백엔드 보드 인터페이스
interface BackendBoard {
  board_id: number;
  board_uuid: string;
  day_number: number;
  title: string;
  cards: BackendCard[];
}

// 백엔드 카드 인터페이스
interface BackendCard {
  card_id: number; // 카드 ID
  content: string; // 카드 내용
  start_time: string; // 카드 시작 시간
  end_time: string; // 카드 종료 시간
  order_index: number; // 카드 순서 인덱스
  locked: boolean; // 카드 잠금 상태 (0, 1으로 표현 됨)
  location: {
    title: string; // 장소명
    address: string; // 장소 주소
    latitude: string; // 위도
    longitude: string; // 경도
    category: string; // 장소 카테고리
    thumbnail_url: string; // 썸네일 URL
  };
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
  let { uuid } = props; // props에서 uuid 가져오기
  const {
    height = "calc(100vh - 82px)",
    paddgingX = {
      xs: "16px",
      sm: "24px",
      xl: `calc(24px + (100vw - ${theme.breakpoints.values.xl}px) / 2)`,
    },
  } = props;

  const params = useParams(); // URL 파라미터
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // 쿼리 클라이언트
  const moveCard = useMoveCard(); // 카드 이동 훅
  const moveBoard = useMoveBoard(); // 보드 이동 훅

  const [mode, setMode] = useAtom(templateModeAtom); // 열람 모드 여부
  const [template, setTemplate] = useAtom(templateAtom); // 템플릿 상태
  const [templateTitle, setTemplateTitle] = useState(template.title); // 템플릿 이름 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태
  const [isTemplateTitleEditing, setIsTemplateTitleEditing] = useState(false); // 템플릿 제목 편집 여부
  const [, reorderBoardCards] = useAtom(reorderBoardCardsAtom); // 카드 순서 변경 함수
  const [isOwner, setIsOwner] = useState(true); // 소유자 여부 상태 추가

  const { boardOverlaps } = checkTemplateTimeOverlaps(template); // 템플릿 내 보드 시간 중복 체크
  const hasTemplateOverlap = boardOverlaps.some((board) => board.hasOverlap); // 템플릿 내 시간 중복 여부

  // 템플릿 컴포넌트 내에 Snackbar 상태 추가
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });

  // Snackbar 닫기 함수
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // 스낵바 메시지 표시 함수 (하위 컴포넌트에서 호출 가능)
  const showSnackbar = useCallback(
    (
      message: string,
      severity: "success" | "error" | "warning" | "info" = "success"
    ) => {
      setSnackbar({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  // URL 파라미터에서 uuid 가져오기
  if (!uuid) {
    uuid = params.uuid;
  }

  // 템플릿 데이터를 불러온 후 소유자 확인하여 모드 설정
  const fetchTemplateData = useCallback(async () => {
    // uuid가 없으면 종료
    if (!uuid) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 템플릿 데이터 가져오기
      const response = await axiosInstance.get(`/template/uuid/${uuid}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        const backendTemplate = response.data.template as BackendTemplate;

        // 백엔드에서 제공한 소유자 여부 정보 직접 사용
        const isCurrentUserOwner = response.data.isOwner;

        // 소유자 여부 상태 업데이트
        setIsOwner(isCurrentUserOwner);

        // 소유자 정보를 localStorage에 저장 (다른 컴포넌트에서 사용)
        localStorage.setItem("template_isOwner", String(isCurrentUserOwner));

        // 소유자가 아니면 강제로 열람 모드로 설정
        if (!isCurrentUserOwner) {
          setMode(TemplateModes.VIEW);
        }

        // 보드와 카드 정보를 포함한 템플릿 데이터로 변환
        const transformedTemplate = {
          uuid: backendTemplate.template_uuid,
          title: backendTemplate.title,
          boards: (backendTemplate.boards || []).map((board) => ({
            id: board.board_id,
            dayNumber: board.day_number,
            title: board.title || `Day ${board.day_number}`,
            cards: (board.cards || []).map((card) => ({
              id: card.card_id,
              content: card.content || "",
              // 시간만 있는 경우 임시 기본 날짜를 추가하여 파싱
              startTime: card.start_time
                ? dayjs(`2001-01-01T${card.start_time}`)
                : dayjs(),
              endTime: card.end_time
                ? dayjs(`2001-01-01T${card.end_time}`)
                : dayjs(),
              orderIndex: card.order_index,
              isLocked: card.locked, // 기본값 - 잠금 해제 상태
              location: card.location
                ? {
                    title: card.location.title,
                    address: card.location.address,
                    latitude: parseFloat(card.location.latitude),
                    longitude: parseFloat(card.location.longitude),
                    category: card.location.category,
                    thumbnailUrl: card.location.thumbnail_url,
                  }
                : undefined,
            })),
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
  }, [reorderBoardCards, setMode, setTemplate, uuid]);

  // UUID가 있으면 백엔드에서 템플릿 데이터 가져오기
  useEffect(() => {
    fetchTemplateData();
  }, [fetchTemplateData]);

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
        `/board/${template.uuid}`,
        {},
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        console.log("보드 추가 성공:", response.data);

        // 템플릿 데이터 새로 불러오기
        await fetchTemplateData();
      }
    } catch (error) {
      console.error("보드 추가 오류:", error);
    }
  }, [template, fetchTemplateData]);

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
          `/template/uuid/${template.uuid}`,
          { title: newTemplate.title },
          { headers: { "X-CSRF-Token": csrfToken } }
        );

        console.log("템플릿 제목이 성공적으로 변경되었습니다.");
      } else {
        console.error("템플릿 UUID가 유효하지 않습니다.");
      }
    } catch (error) {
      console.error("템플릿 제목 변경 중 오류 발생:", error);
    } finally {
      setIsTemplateTitleEditing(false);
    }
  }, [setTemplate, template, templateTitle]);

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
            (b) => b.id === Number(source.droppableId)
          );
          const destinationBoard = draft.boards.find(
            (b) => b.id === Number(destination.droppableId)
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
          source: {
            boardId: Number(source.droppableId),
            orderIndex: source.index,
          },
          destination: {
            boardId: Number(destination.droppableId),
            orderIndex: destination.index,
          },
          prevTemplate: prevTemplate,
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
          sourceDay: source.index + 1, // dayNumber는 1부터 시작하므로 +1
          destinationDay: destination.index + 1, // dayNumber는 1부터 시작하므로 +1
          prevTemplate: prevTemplate,
        });
      }

      // 캐시와 jotai atom 동시 반영
      queryClient.setQueryData(["template"], newTemplate);
      setTemplate(newTemplate);
    },
    [moveBoard, moveCard, queryClient, setTemplate, template]
  );

  // 템플릿 내 모든 카드 정렬 함수 (시작 시간 순)
  const handleSortByStartTime = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 백엔드 API 호출
      const response = await axiosInstance.post(
        `/template/uuid/${template.uuid}/sort`,
        { sortBy: "start_time" },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 정렬 후 템플릿 데이터 다시 가져오기
        await fetchTemplateData();
        setSnackbar({
          open: true,
          message: "카드가 시작 시간 순으로 정렬되었습니다.",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("카드 정렬 오류:", error);
      setSnackbar({
        open: true,
        message: "카드 정렬 중 오류가 발생했습니다.",
        severity: "error",
      });
    }
  }, [template.uuid, fetchTemplateData]);

  // 템플릿 내 모든 카드 정렬 함수 (종료 시간 순)
  const handleSortByEndTime = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 백엔드 API 호출
      const response = await axiosInstance.post(
        `/template/uuid/${template.uuid}/sort`,
        { sortBy: "end_time" },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 정렬 후 템플릿 데이터 다시 가져오기
        await fetchTemplateData();
        setSnackbar({
          open: true,
          message: "카드가 종료 시간 순으로 정렬되었습니다.",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("카드 정렬 오류:", error);
      setSnackbar({
        open: true,
        message: "카드 정렬 중 오류가 발생했습니다.",
        severity: "error",
      });
    }
  }, [template.uuid, fetchTemplateData]);

  // 시간 중복이 있는 첫 번째 보드로 스크롤하는 함수
  const scrollToFirstOverlappingBoard = useCallback(() => {
    // 충돌이 있는 첫 번째 보드 찾기
    const firstOverlappingBoard = boardOverlaps.find(
      (board) => board.hasOverlap
    );

    if (firstOverlappingBoard) {
      // 해당 보드 요소 찾기
      const boardElement = document.getElementById(
        `board-${firstOverlappingBoard.boardId}`
      );
      if (boardElement) {
        // 부드러운 스크롤로 해당 보드로 이동
        boardElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // 사용자에게 피드백 제공
        showSnackbar("시간이 중복된 보드로 이동했습니다.", "info");

        // 시각적 효과로 보드 강조 (선택 사항)
        boardElement.classList.add("highlight-board");
        setTimeout(() => {
          boardElement.classList.remove("highlight-board");
        }, 2000);
      }
    }
  }, [boardOverlaps, showSnackbar]);

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
          onClick={() => navigate("/community")}
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
                  {isOwner ? (
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
              {isOwner && (
                <SortMenu
                  onSortStart={handleSortByStartTime}
                  onSortEnd={handleSortByEndTime}
                  tooltipTitle="템플릿 전체 정렬하기"
                />
              )}

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
            </Stack>

            {/* 우측 컨테이너 */}
            <Stack direction="row" alignContent="inherit" gap={0.5}>
              {/* 모드 선택 버튼 - 소유자만 볼 수 있음 */}
              {isOwner && (
                <Tooltip
                  title={mode === modes[0].name ? "열람 모드" : "편집 모드"}
                >
                  <IconButton size="small" onClick={handleModeChange}>
                    {mode === modes[0].name ? (
                      <ImportContactsRoundedIcon />
                    ) : (
                      <EditRoundedIcon />
                    )}
                  </IconButton>
                </Tooltip>
              )}

              {/* 소유자가 아니면 안내 표시 - 모바일에서는 숨김 */}
              {!isOwner && (
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

              {/* 공유하기 버튼 */}
              <Tooltip title="공유하기">
                <IconButton size="small">
                  <ShareRoundedIcon />
                </IconButton>
              </Tooltip>

              {/* 더보기 버튼 */}
              <Tooltip title="더보기">
                <IconButton size="small">
                  <MoreVertRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Container>

        {/* 드래그 & 드롭 wrapper */}
        <DragDropContext onDragEnd={isOwner ? onDragEnd : () => {}}>
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
              isDropDisabled={!isOwner} // 소유자가 아니면 드롭 불가능
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
                      key={`board-${board.id || index}`}
                      draggableId={`board-${board.id || index}`}
                      index={index}
                      isDragDisabled={!isOwner} // 소유자가 아니면 드래그 불가능
                    >
                      {(provided) => (
                        <Board
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          key={`board-${board.id || index}`}
                          day={board.dayNumber || index + 1}
                          boardData={board} // 보드 데이터 직접 전달
                          fetchTemplateData={fetchTemplateData} // 함수 전달
                          isOwner={isOwner} // 소유자 여부 전달
                          showSnackbar={showSnackbar} // 스낵바 표시 함수 전달
                          id={`board-${board.id}`} // ID 속성 추가
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Stack>
              )}
            </Droppable>

            {/* 보드 추가 버튼 - 소유자만 볼 수 있음 */}
            {isOwner && template.boards.length < MAX_BOARDS && (
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
      <CardEditDialog />

      {/* 알림 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Template;
