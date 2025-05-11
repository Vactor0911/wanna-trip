import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Tooltip from "../components/Tooltip";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import { useCallback } from "react";
import Board from "../components/Board";
import { theme } from "../utils/theme";
import { useAtom } from "jotai";
import { templateAtom, templateModeAtom } from "../state";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { insertNewBoard, MAX_BOARDS, TemplateModes } from "../utils/template";

// 템플릿 모드별 아이콘
const modes = [
  { name: "편집 모드", icon: <EditRoundedIcon /> },
  { name: "열람 모드", icon: <ImportContactsRoundedIcon /> },
];

const Template = () => {
  const [mode, setMode] = useAtom(templateModeAtom); // 열람 모드 여부
  const [template, setTemplate] = useAtom(templateAtom); // 템플릿 상태

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

  return (
    <Stack height="calc(100vh - 82px)">
      {/* 상단 컨테이너 */}
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5,
        }}
      >
        <Stack
          direction="row"
          height="40px"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* 좌측 컨테이너 */}
          <Stack direction="row" alignItems="inherit" gap={1}>
            {/* 템플릿 제목 */}
            <Typography variant="h4">MyBoard</Typography>

            {/* 정렬하기 버튼 */}
            <Tooltip title="정렬하기">
              <IconButton size="small">
                <FilterListRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* 우측 컨테이너 */}
          <Stack direction="row" alignContent="inherit" gap={1}>
            {/* 모드 선택 버튼 */}
            <Tooltip title={mode === modes[0].name ? "열람 모드" : "편집 모드"}>
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
  );
};

export default Template;
