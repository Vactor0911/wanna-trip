import { Container, IconButton, Stack, Typography } from "@mui/material";
import Tooltip from "../components/Tooltip";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import { useCallback, useState } from "react";
import Board from "../components/Board";
import { theme } from "../utils";

const modes = [
  { name: "편집 모드", icon: <EditRoundedIcon /> },
  { name: "열람 모드", icon: <ImportContactsRoundedIcon /> },
];

const Template = () => {
  const [mode, setMode] = useState(modes[0].name); // 열람 모드 여부

  // 모드 변경
  const handleModeChange = useCallback(() => {
    setMode((prevMode) =>
      prevMode === modes[0].name ? modes[1].name : modes[0].name
    );
  }, []);

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
        <Board day={1} />
        <Board day={2} />
        <Board day={3} />
        <Board day={4} />
        <Board day={5} />
        <Board day={6} />
        <Board day={7} />
        <Board day={8} />
      </Stack>
    </Stack>
  );
};

export default Template;
