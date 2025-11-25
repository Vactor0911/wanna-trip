import {
  Box,
  Paper,
  Stack,
  StackProps,
  Typography,
  useTheme,
} from "@mui/material";
import Card from "./Card";
import { BoardInterface } from "../../state/template";

interface BoardProps extends StackProps {
  day: number;
  boardData: BoardInterface; // 보드 데이터 직접 전달
  id?: string; // ID 속성 추가 (선택적 속성으로 설정)
}

const Board = (props: BoardProps) => {
  const {
    day,
    boardData,
    id, // ID 속성 추가 (선택적 속성으로 설정)
    ...others
  } = props;

  const theme = useTheme();

  return (
    <Stack height="100%" id={id} {...others}>
      <Paper
        elevation={3}
        sx={{
          maxHeight: "100%",
          background: theme.palette.secondary.main,
          borderRadius: "8px",
        }}
      >
        <Stack py={1} px={1.5} width="300px" maxHeight="inherit" gap={1}>
          {/* 헤더 메뉴바 */}
          <Stack direction="row" justifyContent="space-between">
            {/* 좌측 컨테이너 */}
            <Stack direction="row" alignItems="center" gap={0.5}>
              {/* 보드 날짜 */}
              <Typography variant="h6">Day {day}</Typography>
            </Stack>
          </Stack>

          <Stack
            flex={1}
            gap={2}
            paddingBottom={0.5}
            sx={{
              overflowY: "auto",
            }}
          >
            {/* 카드 목록 렌더링 */}
            {(boardData?.cards || []).map((card) => (
              <Box
                key={`box-card-${card.uuid}`}
                id={`card-${card.uuid}`} // ID 속성 추가
                sx={{
                  borderRadius: "8px",
                }}
              >
                <Card
                  key={`card-${card.uuid}`}
                  content={card.content || ""}
                  startTime={card.startTime}
                  endTime={card.endTime}
                  isLocked={card.locked}
                  location={card.location || undefined}
                />
              </Box>
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default Board;
