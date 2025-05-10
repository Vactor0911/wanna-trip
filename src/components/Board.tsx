import {
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Tooltip from "./Tooltip";
import Card from "./Card";
import { theme } from "../utils/theme";

interface BoardProps {
  day: number;
}

const Board = (props: BoardProps) => {
  const { day } = props;

  return (
    <Paper
      sx={{
        height: "100%",
      }}
    >
      <Stack
        padding={1}
        width="300px"
        height="100%"
        gap={1}
        sx={{
          background: theme.palette.secondary.main,
        }}
      >
        {/* 헤더 메뉴바 */}
        <Stack direction="row" justifyContent="space-between">
          {/* 좌측 컨테이너 */}
          <Stack direction="row" alignItems="center" gap={1}>
            {/* 보드 날짜 */}
            <Typography variant="h6">Day{day}</Typography>

            {/* 정렬하기 버튼 */}
            <Tooltip title="정렬하기">
              <IconButton size="small">
                <SortRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* 우측 컨테이너 */}
          <Stack direction="row" alignItems="center">
            {/* 보드 추가하기 버튼 */}
            <Tooltip title="보드 추가하기">
              <IconButton size="small">
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* 보드 복제하기 버튼 */}
            <Tooltip title="보드 복제하기">
              <IconButton size="small">
                <ContentCopyRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* 보드 삭제하기 버튼 */}
            <Tooltip title="보드 삭제하기">
              <IconButton size="small">
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* 카드 컨테이너 */}
        <Stack
          flex={1}
          gap={2}
          sx={{
            overflowY: "scroll",
          }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} />
          ))}
        </Stack>

        <Button
          fullWidth
          startIcon={
            <AddRoundedIcon
              sx={{
                color: theme.palette.primary.main,
              }}
            />
          }
        >
          <Typography variant="subtitle1">계획 추가하기</Typography>
        </Button>
      </Stack>
    </Paper>
  );
};

export default Board;
