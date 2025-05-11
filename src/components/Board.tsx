import { Button, IconButton, Paper, Stack, Typography } from "@mui/material";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Tooltip from "./Tooltip";
import Card from "./Card";
import { theme } from "../utils/theme";
import { useAtom } from "jotai";
import { templateAtom } from "../state";
import { useCallback } from "react";
import { insertNewBoard, insertNewCard, MAX_BOARDS } from "../utils/template";
import dayjs from "dayjs";

interface BoardProps {
  day: number;
}

const Board = (props: BoardProps) => {
  const { day } = props;

  const [template, setTemplate] = useAtom(templateAtom); // 템플릿 상태

  // 보드 추가 버튼 클릭
  const handleAddBoardButtonClick = useCallback(() => {
    // 보드 개수가 최대 개수보다 많으면 중단
    if (template.boards.length >= MAX_BOARDS) {
      return;
    }

    // 새 보드 객체
    const newBoard = { cards: [] };

    // 새 템플릿 객체
    const newTemplate = insertNewBoard(template, newBoard, day);

    setTemplate(newTemplate);
  }, [day, setTemplate, template]);

  // 보드 복제 버튼 클릭
  const handleCopyBoardButtonClick = useCallback(() => {
    // 보드 개수가 최대 개수보다 많으면 중단
    if (template.boards.length >= MAX_BOARDS) {
      return;
    }

    // 새 보드 객체
    const newBoard = {
      cards: template.boards[day - 1].cards,
    };

    // 새 템플릿 객체
    const newTemplate = insertNewBoard(template, newBoard, day);

    setTemplate(newTemplate);
  }, [day, setTemplate, template]);

  // 보드 삭제 버튼 클릭
  const handleDeleteBoardButtonClick = useCallback(() => {
    // 보드 개수가 최소 개수보다 적으면
    if (template.boards.length <= 1) {
      // 카드가 있다면 보드 초기화
      if (template.boards[0].cards.length > 0) {
        const newTemplate = {
          ...template,
          boards: [{ cards: [] }],
        };

        setTemplate(newTemplate);
      }
      return; // 작업 중단
    }

    // 새 템플릿 객체
    const newTemplate = {
      ...template,
      boards: [
        ...template.boards.slice(0, day - 1),
        ...template.boards.slice(day),
      ],
    };

    setTemplate(newTemplate);
  }, [day, setTemplate, template]);

  // 계획 추가 버튼 클릭
  const handleAddCardButtonClick = useCallback(() => {
    // 새 카드 객체
    const newCard = {
      uuid: "1",
      type: 0,
      startTime: dayjs(),
      endTime: dayjs(),
      content: "새 카드",
    };

    // 새 템플릿 객체
    const newTemplate = insertNewCard(template, day, newCard);

    setTemplate(newTemplate);
  }, [day, setTemplate, template]);

  return (
    <Stack height="100%">
      <Paper
        elevation={3}
        sx={{
          maxHeight: "100%",
          background: theme.palette.secondary.main,
        }}
      >
        <Stack padding={1} width="300px" maxHeight="inherit" gap={1}>
          {/* 헤더 메뉴바 */}
          <Stack direction="row" justifyContent="space-between">
            {/* 좌측 컨테이너 */}
            <Stack direction="row" alignItems="center" gap={1}>
              {/* 보드 날짜 */}
              <Typography variant="h6">Day{day}</Typography>

              {/* 정렬하기 버튼 */}
              <Tooltip title="정렬하기" placement="top">
                <IconButton size="small">
                  <SortRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* 우측 컨테이너 */}
            <Stack direction="row" alignItems="center">
              {/* 보드 추가하기 버튼 */}
              <Tooltip title="보드 추가하기" placement="top">
                <IconButton size="small" onClick={handleAddBoardButtonClick}>
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* 보드 복제하기 버튼 */}
              <Tooltip title="보드 복제하기" placement="top">
                <IconButton size="small" onClick={handleCopyBoardButtonClick}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* 보드 삭제하기 버튼 */}
              <Tooltip title="보드 삭제하기" placement="top">
                <IconButton size="small" onClick={handleDeleteBoardButtonClick}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* 카드 컨테이너 */}
          <Stack
            flex={1}
            gap={2}
            paddingBottom={0.5}
            sx={{
              overflowY: "scroll",
            }}
          >
            {template.boards[day - 1]?.cards?.map((_, index) => (
              <Card key={`card-${day}-${index + 1}`} />
            ))}
          </Stack>

          <Button
            fullWidth
            startIcon={
              <AddRoundedIcon
                sx={{
                  color: "inherit",
                }}
              />
            }
            onClick={handleAddCardButtonClick}
          >
            <Typography variant="subtitle1">계획 추가하기</Typography>
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default Board;
