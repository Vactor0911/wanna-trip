import {
  Button,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Tooltip from "../Tooltip";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TextSnippetRoundedIcon from "@mui/icons-material/TextSnippetRounded";
import { useCallback, useEffect, useState } from "react";
import { theme } from "../../utils/theme";
import { useAtom } from "jotai";
import { useNavigate, useParams } from "react-router";
import axiosInstance, { getCsrfToken } from "../../utils/axiosInstance";
import dayjs from "dayjs";
import { reorderBoardCardsAtom, TemplateInterface } from "../../state/template";
import MapIcon from "@mui/icons-material/Map";
import { downloadExcel } from "../../utils/excelExport";
import { downloadPdf } from "../../utils/pdfExport";
import { downloadText } from "../../utils/textExport";
import { useSnackbar } from "notistack";
import Board from "./Board";
import TemplateMapDialog from "../../pages/Template/TemplateMapDialog";

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

const TemplateViewer = (props: TemplateProps) => {
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
  const { enqueueSnackbar } = useSnackbar();

  const [template, setTemplate] = useState<TemplateInterface | null>(null); // 템플릿 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태
  const [, reorderBoardCards] = useAtom(reorderBoardCardsAtom); // 카드 순서 변경 함수
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  ); // 더보기 메뉴 앵커
  const [mapDialogOpen, setMapDialogOpen] = useState(false); // 지도 다이얼로그 열림 상태

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
      const response = await axiosInstance.get(`/template/${uuid}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        const backendTemplate = response.data.template as BackendTemplate;

        // 백엔드에서 제공한 소유자 여부 정보 직접 사용
        const isCurrentUserOwner = response.data.isOwner;

        // 소유자 정보를 localStorage에 저장 (다른 컴포넌트에서 사용)
        localStorage.setItem("template_isOwner", String(isCurrentUserOwner));

        // 보드와 카드 정보를 포함한 템플릿 데이터로 변환
        const transformedTemplate = {
          uuid: backendTemplate.uuid,
          title: backendTemplate.title,
          boards: (backendTemplate.boards || []).map((board, index) => ({
            uuid: board.uuid,
            dayNumber: board.dayNumber,
            title: `Day ${index + 1}`,
            cards: (board.cards || []).map((card) => ({
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
                    latitude: parseFloat(card.location.latitude),
                    longitude: parseFloat(card.location.longitude),
                    category: card.location.category,
                    thumbnailUrl: card.location.thumbnailUrl,
                  }
                : undefined,
            })),
          })),
        };

        setTemplate(transformedTemplate);

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
  }, [reorderBoardCards, setTemplate, uuid]);

  // UUID가 있으면 백엔드에서 템플릿 데이터 가져오기
  useEffect(() => {
    fetchTemplateData();
  }, [fetchTemplateData]);

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
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ flexGrow: 1, minWidth: 0 }}
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
                  {template?.title}
                </Typography>
              </Stack>

              {/* 권한에 따른 정렬하기 보이기 여부 */}
              <Stack direction="row" alignItems="center" gap={0.5}>
                <Tooltip title="지도 보기">
                  <IconButton size="small" onClick={handleMapClick}>
                    <MapIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* 우측 컨테이너 */}
            <Stack direction="row" alignContent="inherit" gap={0.5}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: { xs: "none", sm: "flex" }, // 모바일에서 숨김
                  alignItems: "center",
                  mr: 1,
                }}
              >
                <ImportContactsRoundedIcon fontSize="small" sx={{ mr: 0.5 }} />
                열람 모드 (편집 불가)
              </Typography>

              {/* 공유하기 버튼 */}
              <Tooltip title="공유하기">
                <IconButton size="small">
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
          <Stack direction="row" height="100%" gap={5}>
            {template?.boards.map((board, index) => (
              <Board
                key={`board-${board.uuid || index}`}
                day={index + 1}
                boardData={board} // 보드 데이터 직접 전달
                id={`board-${board.uuid}`} // ID 속성 추가
              />
            ))}
          </Stack>
        </Stack>
      </Stack>

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

      {/* 지도 다이얼로그 */}
      {template && (
        <TemplateMapDialog
          open={mapDialogOpen}
          onClose={handleMapDialogClose}
          template={template}
        />
      )}
    </>
  );
};

export default TemplateViewer;
