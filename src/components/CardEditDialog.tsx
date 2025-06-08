import {
  Box,
  Button,
  ClickAwayListener,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { theme } from "../utils/theme";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import Tooltip from "./Tooltip";
import CardTextEditor from "./text_editor/CardTextEditor";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimeField } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import DOMPurify from "dompurify";
import {
  cardEditDialogOpenAtom,
  selectedCardAtom,
  templateAtom,
} from "../state/template";

const CardEditDialog = () => {
  const [cardEditDialogOpen, setCardEditDialogOpen] = useAtom(
    cardEditDialogOpenAtom
  );
  const [template, setTemplate] = useAtom(templateAtom);
  const selectedCard = useAtomValue(selectedCardAtom);

  const [isCardLocked, setIsCardLocked] = useState(false); // 카드 잠금 상태
  const [content, setContent] = useState(""); // 카드 내용
  const [startTime, setStartTime] = useState(dayjs("2001-01-01T01:00")); // 시작 시간
  const [endTime, setEndTime] = useState(dayjs("2001-01-01T02:00")); // 종료 시간
  const [isStartTimeEditing, setIsStartTimeEditing] = useState(false); // 시작 시간 편집 상태
  const [isEndTimeEditing, setIsEndTimeEditing] = useState(false); // 종료 시간 편집 상태

  // 대화상자 열 때 시간 초기화
  useEffect(() => {
    if (cardEditDialogOpen && selectedCard) {
      const boardIndex = selectedCard.board;
      const cardIndex = selectedCard.card;
      const card = template.boards[boardIndex]?.cards[cardIndex];

      setStartTime(card.startTime || dayjs("2001-01-01T01:00"));
      setEndTime(card.endTime || dayjs("2001-01-01T02:00"));
      setContent(card.content || "");
      setIsCardLocked(card.isLocked || false);
    }
  }, [cardEditDialogOpen, selectedCard, template.boards]);

  // 카드 편집 대화상자 닫기
  const handleCardEditDialogClose = useCallback(() => {
    setCardEditDialogOpen(false);
  }, [setCardEditDialogOpen]);

  // 카드 잠금 토글
  const handleCardLockToggle = useCallback(() => {
    setIsCardLocked((prev) => !prev);
  }, [setIsCardLocked]);

  // 시작 시간 클릭
  const handleStartTimeClick = useCallback(() => {
    setIsStartTimeEditing((prev) => !prev);
  }, []);

  // 시작 시간 변경
  const handleStartTimeChange = useCallback(
    (newTime: dayjs.Dayjs | null) => {
      if (newTime && newTime.isBefore(endTime)) {
        setStartTime(newTime);
      }
    },
    [endTime]
  );

  // 시작 시간 변경 완료
  const handleStartTimeClickAway = useCallback(() => {
    setIsStartTimeEditing(false);
  }, []);

  // 종료 시간 클릭
  const handleEndTimeClick = useCallback(() => {
    setIsEndTimeEditing((prev) => !prev);
  }, []);

  // 종료 시간 변경
  const handleEndTimeChange = useCallback(
    (newTime: dayjs.Dayjs | null) => {
      if (newTime && newTime.isAfter(startTime)) {
        setEndTime(newTime);
      }
    },
    [startTime]
  );

  // 종료 시간 변경 완료
  const handleEndTimeClickAway = useCallback(() => {
    setIsEndTimeEditing(false);
  }, []);

  // 저장 버튼 클릭
  const handleSaveButtonClick = useCallback(() => {
    if (!selectedCard) {
      return;
    }

    const boardIndex = selectedCard.board;
    const cardIndex = selectedCard.card;
    const card = template.boards[boardIndex]?.cards[cardIndex];

    // HTML 내용 정제
    const cleanHtml = DOMPurify.sanitize(content);

    // 카드 데이터 업데이트
    const newCard = {
      ...card,
      startTime: startTime,
      endTime: endTime,
      content: cleanHtml,
      isLocked: isCardLocked,
    };

    const newTemplate = {
      ...template,
      boards: template.boards.map((board, index) => {
        if (index === boardIndex) {
          return {
            ...board,
            cards: board.cards.map((c, i) => (i === cardIndex ? newCard : c)),
          };
        }
        return board;
      }),
    };
    setTemplate(newTemplate);

    console.log("저장 버튼 클릭", cleanHtml, startTime, endTime);

    // 대화상자 닫기
    setCardEditDialogOpen(false);
  }, [
    content,
    endTime,
    isCardLocked,
    selectedCard,
    setCardEditDialogOpen,
    setTemplate,
    startTime,
    template,
  ]);

  return (
    <Dialog
      fullWidth
      open={cardEditDialogOpen}
      onClose={handleCardEditDialogClose}
      maxWidth="md"
    >
      {/* 제목 */}
      <DialogTitle
        sx={{
          paddingX: {
            xs: 2,
            sm: 5,
          },
        }}
      >
        <Stack gap={1}>
          <Stack direction="row" alignItems="center" gap={1}>
            {/* 카드 잠금 버튼 */}
            <Tooltip
              title={isCardLocked ? "카드 잠금 풀기" : "카드 잠그기"}
              placement="top"
            >
              <IconButton
                color="primary"
                size="small"
                onClick={handleCardLockToggle}
              >
                {isCardLocked ? (
                  <LockOutlineRoundedIcon fontSize="large" />
                ) : (
                  <LockOpenRoundedIcon fontSize="large" />
                )}
              </IconButton>
            </Tooltip>

            {/* 카드 제목 */}
            <Typography variant="h4">카드 편집 대화상자 - Day 1</Typography>
          </Stack>

          {/* 구분선 */}
          <Divider />
        </Stack>
      </DialogTitle>

      {/* 내용 */}
      <Stack
        px={{
          xs: 2,
          sm: 5,
        }}
        pb={3}
        gap={3}
      >
        <Stack
          direction={{
            sm: "column",
            md: "row",
          }}
          justifyContent="space-between"
          gap={{
            xs: 5,
            md: 0,
          }}
        >
          {/* 텍스트 편집기 */}
          <Box
            width={{
              xs: "100%",
              md: "70%",
            }}
            height="400px"
          >
            <CardTextEditor setContent={setContent} />
          </Box>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
              md: "column",
            }}
            gap={1}
          >
            {/* 지도 뷰어 */}
            <Skeleton
              variant="rectangular"
              sx={{
                borderRadius: 2,
                width: {
                  xs: "200px",
                },
                height: {
                  xs: "200px",
                },
              }}
            />

            <Stack>
              {/* 선택된 장소 설명 */}
              <Stack
                direction="row"
                alignItems="center"
                gap={0.5}
                sx={{
                  color: theme.palette.black.main,
                }}
              >
                <PlaceRoundedIcon />
                <Typography
                  variant="h6"
                  sx={{
                    padding: "6px 8px",
                  }}
                >
                  장소
                </Typography>
              </Stack>

              {/* 시간 선택기 */}
              <Stack
                direction="row"
                alignItems="center"
                gap={0.5}
                sx={{
                  color: theme.palette.black.main,
                }}
              >
                <AccessTimeRoundedIcon />

                {/* 시간 선택 */}
                <Stack direction="row" alignItems="center">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {/* 시작 시간 */}
                    {isStartTimeEditing ? (
                      <ClickAwayListener onClickAway={handleStartTimeClickAway}>
                        <Box width="80px">
                          <TimeField
                            label="시작 시간"
                            ampm={false}
                            value={startTime}
                            maxTime={endTime}
                            onChange={handleStartTimeChange}
                          />
                        </Box>
                      </ClickAwayListener>
                    ) : (
                      <Button onClick={handleStartTimeClick}>
                        <Typography variant="h6" color="black">
                          {startTime.format("HH:mm")}
                        </Typography>
                      </Button>
                    )}

                    {/* 구분자 */}
                    <Typography variant="h6" color="black">
                      ~
                    </Typography>

                    {/* 종료 시간 */}
                    {isEndTimeEditing ? (
                      <ClickAwayListener onClickAway={handleEndTimeClickAway}>
                        <Box width="80px">
                          <TimeField
                            label="종료 시간"
                            ampm={false}
                            value={endTime}
                            minTime={startTime}
                            onChange={handleEndTimeChange}
                          />
                        </Box>
                      </ClickAwayListener>
                    ) : (
                      <Button onClick={handleEndTimeClick}>
                        <Typography variant="h6" color="black">
                          {endTime.format("HH:mm")}
                        </Typography>
                      </Button>
                    )}
                  </LocalizationProvider>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        {/* 버튼 컨테이너 */}
        <Stack
          direction="row"
          gap={2}
          alignSelf="flex-end"
          color={theme.palette.black.main}
        >
          {/* 취소 버튼 */}
          <Button
            variant="outlined"
            color="inherit"
            sx={{
              px: 3,
            }}
            onClick={handleCardEditDialogClose}
          >
            <Typography>취소</Typography>
          </Button>

          {/* 저장 버튼 */}
          <Button
            variant="contained"
            sx={{
              px: 3,
            }}
            onClick={handleSaveButtonClick}
          >
            <Typography>저장</Typography>
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default CardEditDialog;
