import {
  Box,
  Button,
  ClickAwayListener,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import Tooltip from "./Tooltip";
import CardTextEditor from "./text_editor/CardTextEditor";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimeField } from "@mui/x-date-pickers";
import NaverMap from "./NaverMap";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import {
  cardEditDialogOpenAtom,
  currentEditCardAtom,
  templateAtom,
  updateBoardCardAtom,
} from "../state/template";
import dayjs from "dayjs";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const CardEditDialog = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [cardEditDialogOpen, setCardEditDialogOpen] = useAtom(
    cardEditDialogOpenAtom
  );
  const [currentEditCard] = useAtom(currentEditCardAtom);
  const [template] = useAtom(templateAtom); // 템플릿 상태 추가
  // 현재 보드 정보 찾기
  const currentBoard = template.boards.find(
    (board) => board.id === currentEditCard?.boardId
  );

  // 동적 제목 생성
  const dialogTitle = currentBoard
    ? `${currentBoard.dayNumber || "N"}일차`
    : "새 카드 작성";

  const [isCardLocked, setIsCardLocked] = useState(false); // 카드 잠금 상태
  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태
  const [content, setContent] = useState(""); // 카드 내용
  const [startTime, setStartTime] = useState(dayjs("2001-01-01T01:00")); // 시작 시간
  const [endTime, setEndTime] = useState(dayjs("2001-01-01T02:00")); // 종료 시간
  const [isStartTimeEditing, setIsStartTimeEditing] = useState(false); // 시작 시간 편집 상태
  const [isEndTimeEditing, setIsEndTimeEditing] = useState(false); // 종료 시간 편집 상태
  const [, updateBoardCard] = useAtom(updateBoardCardAtom); // 보드 카드 업데이트 함수
  const [errorMessage, setErrorMessage] = useState("");

  // 대화상자 열 때 시간 초기화
  useEffect(() => {
    if (cardEditDialogOpen) {
      // 새 카드인 경우 기본 값으로 시작
      if (!currentEditCard?.cardId) {
        setContent("");
        setIsCardLocked(false); // 기본값 - 잠금 해제
        setStartTime(dayjs("2001-01-01T01:00"));
        setEndTime(dayjs("2001-01-01T02:00"));
      }
      // 기존 카드인 경우 데이터 로드
      else {
        // 현재 보드 찾기
        const currentBoard = template.boards.find(
          (board) => board.id === currentEditCard?.boardId
        );

        // 현재 카드 찾기
        const currentCard = currentBoard?.cards.find(
          (card) => card.id === currentEditCard?.cardId
        );

        if (currentCard) {
          setContent(currentCard.content || "");
          setStartTime(currentCard.startTime || dayjs("2001-01-01T01:00"));
          setEndTime(currentCard.endTime || dayjs("2001-01-01T02:00"));
          setIsCardLocked(currentCard.isLocked || false); // 카드의 잠금 상태 설정
        }
      }
    }
  }, [cardEditDialogOpen, currentEditCard, template.boards]);

  // 카드 편집 대화상자 닫기
  const handleCardEditDialogClose = useCallback(() => {
    setCardEditDialogOpen(false);
    setErrorMessage("");
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

  // 카드 내용 변경 시 서버에 업데이트
  const saveCardToServer = useCallback(async () => {
    try {
      // 저장 중 상태로 변경
      setIsSaving(true);
      setErrorMessage("");

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 새 카드 생성 또는 기존 카드 업데이트
      if (currentEditCard && currentEditCard.boardId) {
        const cardData = {
          content, // 카드 내용
          startTime: startTime.format("YYYY-MM-DD HH:mm:ss"), // 시작 시간
          endTime: endTime.format("YYYY-MM-DD HH:mm:ss"), // 종료 시간
          orderIndex: currentEditCard.orderIndex || 0, // 카드 순서 인덱스
          locked: isCardLocked, // 잠금 상태
        };

        let response;
        const isNewCard = !currentEditCard.cardId;

        // 기존 카드 수정
        if (currentEditCard.cardId) {
          response = await axiosInstance.put(
            `/card/${currentEditCard.cardId}`,
            cardData,
            { headers: { "X-CSRF-Token": csrfToken } }
          );
        }
        // 새 카드 생성
        else {
          response = await axiosInstance.post(
            `/card/${currentEditCard.boardId}`,
            cardData,
            { headers: { "X-CSRF-Token": csrfToken } }
          );
        }

        if (response.data.success) {
          console.log("카드가 성공적으로 저장되었습니다:", response.data);

          // 카드 객체 생성 (새 카드든 수정된 카드든)
          const updatedCard = {
            id: isNewCard ? response.data.cardId : currentEditCard.cardId,
            content,
            startTime,
            endTime,
            isLocked: isCardLocked,
            orderIndex: currentEditCard.orderIndex || 0,
          };

          // 카드 상태 업데이트 - 모든 경우에 항상 업데이트
          updateBoardCard({
            boardId: currentEditCard.boardId,
            card: updatedCard,
            isNew: isNewCard,
          });

          // 성공 후 대화상자 닫기
          setCardEditDialogOpen(false);
        } else {
          setErrorMessage("카드 저장에 실패했습니다.");
        }
      } else {
        setErrorMessage("보드 정보가 없습니다.");
      }
    } catch (error) {
      console.error("카드 저장 중 오류 발생:", error);
      setErrorMessage("카드 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [
    content,
    currentEditCard,
    endTime,
    isCardLocked,
    setCardEditDialogOpen,
    startTime,
    updateBoardCard,
  ]);

  // 저장 버튼 클릭
  const handleSaveButtonClick = useCallback(() => {
    console.log("저장 버튼 클릭", content, startTime, endTime);
    saveCardToServer();
  }, [content, endTime, saveCardToServer, startTime]);

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: { margin: 1 },
        },
      }}
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
            <Typography variant="h4">{dialogTitle}</Typography>

            {/* 닫기 버튼 */}
            <Stack flex={1} alignItems="flex-end">
              <Tooltip title="닫기" placement="top">
                <IconButton onClick={handleCardEditDialogClose} size="small">
                  <CloseRoundedIcon
                    fontSize="large"
                    sx={{ color: theme.palette.black.main }}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
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
          <Stack
            direction={{
              xs: "column",
              sm: "row",
              md: "column",
            }}
            gap={1}
          >
            {/* 지도 뷰어 */}
            <NaverMap width={200} height={200} />

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

          {/* 텍스트 편집기 */}
          <Box
            width={{
              xs: "100%",
              md: "70%",
            }}
            height="400px"
          >
            <CardTextEditor
              setContent={setContent}
              initialContent={content} // 현재 카드 내용을 초기값으로 전달
            />
          </Box>
        </Stack>

        {/* 오류 메시지 표시 부분 - 지워도 됨 */}
        {errorMessage && (
          <Typography color="error" align="center">
            {errorMessage}
          </Typography>
        )}

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
            disabled={isSaving}
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
            disabled={isSaving}
          >
            <Typography>{isSaving ? "저장 중..." : "저장"}</Typography>
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default CardEditDialog;
