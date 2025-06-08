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
} from "@mui/material";
import Tooltip from "../components/Tooltip";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import { useCallback, useEffect, useState } from "react";
import Board from "../components/Board";
import { theme } from "../utils/theme";
import { useAtom } from "jotai";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { insertNewBoard, MAX_BOARDS } from "../utils/template";
import { useNavigate, useParams } from "react-router";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import CardEditDialog from "../components/CardEditDialog";
import { templateAtom, templateModeAtom, TemplateModes } from "../state/template";

// 템플릿 모드별 아이콘
const modes = [
  { name: "편집 모드", icon: <EditRoundedIcon /> },
  { name: "열람 모드", icon: <ImportContactsRoundedIcon /> },
];

// 백엔드 템플릿 인터페이스
interface BackendTemplate {
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
  card_id: number;
  card_uuid: string;
  title: string;
  content: string;
  start_time: string;
  end_time: string;
  order_index: number;
}

const Template = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useAtom(templateModeAtom); // 열람 모드 여부
  const [template, setTemplate] = useAtom(templateAtom); // 템플릿 상태
  const [templateTitle, setTemplateTitle] = useState(template.title); // 템플릿 이름 상태
  const { uuid } = useParams(); // URL에서 uuid 파라미터 가져오기
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태
  const [isTemplateTitleEditing, setIsTemplateTitleEditing] = useState(false); // 템플릿 제목 편집 여부

  // 템플릿 데이터 가져오기
  const fetchTemplateData = useCallback(async () => {
    if (!uuid) return; // uuid가 없으면 종료

    try {
      setIsLoading(true);
      setError(null);
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 템플릿 데이터 가져오기
      const response = await axiosInstance.get(`/template/uuid/${uuid}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      console.log("템플릿 데이터:", response.data);

      if (response.data.success) {
        const backendTemplate = response.data.template as BackendTemplate;

        // 보드만 있는 간단한 형태로 변환
        setTemplate({
          uuid: backendTemplate.template_uuid,
          title: backendTemplate.title,
          boards: backendTemplate.boards.map(() => ({
            cards: [], // 현재는 카드 없이 빈 보드로 설정
          })),
        });
        setTemplateTitle(backendTemplate.title);
      } else {
        setError("템플릿 데이터를 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("템플릿 데이터 로딩 오류:", err);
      setError("템플릿을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [setTemplate, uuid]);

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

  // 보드 추가 버튼 클릭
  const handleAddBoardButtonClick = useCallback(() => {
    // 보드 개수가 최대 개수보다 많으면 중단
    if (template.boards.length >= MAX_BOARDS) {
      return;
    }

    // 새 보드 객체
    const newBoard = {
      cards: [],
    };

    // 새 템플릿 객체
    const newTemplate = insertNewBoard(template, newBoard);

    setTemplate(newTemplate);
  }, [setTemplate, template]);

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
  const handleTemplateTitleClickAway = useCallback(() => {
    const newTemplate = { ...template };
    newTemplate.title = templateTitle;

    setTemplate(newTemplate);
    setIsTemplateTitleEditing(false);
  }, [setTemplate, template, templateTitle]);

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Stack
        height="calc(100vh - 82px)"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Stack>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <Stack
        height="calc(100vh - 82px)"
        alignItems="center"
        justifyContent="center"
      >
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
        height="calc(100vh - 82px)"
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
              gap={1}
              sx={{ minWidth: 0, overflow: "hidden" }}
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
              )}

              <Tooltip title="정렬하기">
                <IconButton size="small">
                  <FilterListRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* 우측 컨테이너 */}
            <Stack direction="row" alignContent="inherit" gap={1}>
              {/* 모드 선택 버튼 */}
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

        {/* 보드 컨테이너 */}
        <Stack
          direction="row"
          height="100%"
          gap={5}
          paddingX={{
            xs: "16px",
            sm: "24px",
            xl: `calc(24px + (100vw - ${theme.breakpoints.values.xl}px) / 2)`,
          }}
          paddingY={5}
          sx={{
            overflowX: "auto",
          }}
        >
          {template.boards.map((_, index) => (
            <Board key={`board-${index + 1}`} day={index + 1} />
          ))}

          {/* 보드 추가 버튼 */}
          {template.boards.length < MAX_BOARDS && (
            <Box>
              <Tooltip title="보드 추가하기" placement="top">
                <Button
                  onClick={handleAddBoardButtonClick}
                  sx={{
                    padding: 0,
                  }}
                >
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
      </Stack>

      {/* 카드 편집 대화상자 */}
      <CardEditDialog />
    </>
  );
};

export default Template;
