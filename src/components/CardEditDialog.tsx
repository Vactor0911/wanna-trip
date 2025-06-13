import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
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
  deleteBoardCardAtom,
  templateAtom,
  updateBoardCardAtom,
} from "../state/template";
import dayjs from "dayjs";
import SubjectRoundedIcon from "@mui/icons-material/SubjectRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FullScreenMapDialog from "./FullScreenMapDialog";
import { useAddCard } from "../hooks/template";

const CardEditDialog = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const addCard = useAddCard(); // 카드 추가 훅

  const [cardEditDialogOpen, setCardEditDialogOpen] = useAtom(
    cardEditDialogOpenAtom
  );
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false); // 더보기 메뉴 열림 상태

  const [isCardLocked, setIsCardLocked] = useState(false); // 카드 잠금 상태
  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태
  const [content, setContent] = useState(""); // 카드 내용
  const [startTime, setStartTime] = useState(dayjs("2001-01-01T01:00")); // 시작 시간
  const [endTime, setEndTime] = useState(dayjs("2001-01-01T02:00")); // 종료 시간
  const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지 상태
  const moreMenuAnchorElement = useRef<HTMLButtonElement | null>(null); // 더보기 메뉴 앵커 요소

  // 전체화면 지도 상태
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);

  const [currentEditCard] = useAtom(currentEditCardAtom); // 현재 편집 중인 카드 정보
  const [template] = useAtom(templateAtom); // 템플릿 상태 추가

  // 현재 보드 정보 찾기
  const currentBoard = template.boards.find(
    (board) => board.id === currentEditCard?.boardId
  );

  // 보드 카드 업데이트 함수
  const [, updateBoardCard] = useAtom(updateBoardCardAtom); // 보드 카드 업데이트 함수
  const [, deleteBoardCard] = useAtom(deleteBoardCardAtom); // 보드 카드 삭제 함수 추가

  // 동적 제목 생성
  const dialogTitle = currentBoard
    ? `${currentBoard.dayNumber || "N"}일차`
    : "새 카드 작성";

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

  // 시작 시간 변경
  const handleStartTimeChange = useCallback(
    (newTime: dayjs.Dayjs | null) => {
      if (newTime && newTime.isBefore(endTime)) {
        setStartTime(newTime);
      }
    },
    [endTime]
  );

  // 종료 시간 변경
  const handleEndTimeChange = useCallback(
    (newTime: dayjs.Dayjs | null) => {
      if (newTime && newTime.isAfter(startTime)) {
        setEndTime(newTime);
      }
    },
    [startTime]
  );

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
        // 내용 수정할 때는 orderIndex를 전송하지 않도록 수정
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cardData: any = {
          content, // 카드 내용
          startTime: startTime.format("YYYY-MM-DD HH:mm:ss"), // 시작 시간
          endTime: endTime.format("YYYY-MM-DD HH:mm:ss"), // 종료 시간
          locked: isCardLocked, // 잠금 상태
        };

        // 새 카드 생성 시에만 orderIndex 포함 (드래그 앤 드롭으로 위치 변경하는 경우는 별도 처리)
        const isNewCard = !currentEditCard.cardId;
        if (isNewCard) {
          cardData.orderIndex = currentEditCard.orderIndex || 0;
        }

        let response;

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

  // 더보기 메뉴 열기
  const handleMoreMenuOpen = useCallback(() => {
    setIsMoreMenuOpen(true);
  }, []);

  // 더보기 메뉴 닫기
  const handleMoreMenuClose = useCallback(() => {
    setIsMoreMenuOpen(false);
  }, []);

  // 지도 클릭 시 전체화면 모달 열기
  const handleMapClick = useCallback(() => {
    setIsMapDialogOpen(true);
  }, []);

  // 전체화면 지도 모달 닫기
  const handleMapDialogClose = useCallback(() => {
    setIsMapDialogOpen(false);
  }, []);

  // 카드 복제 버튼 클릭
  const handleDuplicateCardButtonClick = useCallback(async () => {
    // 현재 편집 중인 카드가 없거나 보드 정보가 없으면 오류 출력
    if (!currentEditCard?.cardId || !currentEditCard?.boardId) {
      setErrorMessage("복제할 카드가 없거나 보드 정보가 없습니다.");
      return;
    }

    setIsSaving(true); // 저장 중 상태로 변경
    setErrorMessage(""); // 오류 메시지 초기화

    // 복제 카드 데이터
    const newCard = {
      content,
      startTime,
      endTime,
      isLocked: false, // 복제 시 잠금 해제
    };

    // 카드 추가 훅 호출
    try {
      await addCard(
        newCard,
        currentEditCard.boardId,
        currentEditCard.orderIndex
      );
    } catch (error) {
      console.error("카드 추가 중 오류 발생:", error);
    } finally {
      setIsSaving(false); // 저장 중 상태 해제
      handleMoreMenuClose(); // 메뉴 닫기
      setCardEditDialogOpen(false); // 대화상자 닫기
    }
  }, [
    addCard,
    content,
    currentEditCard.boardId,
    currentEditCard?.cardId,
    currentEditCard.orderIndex,
    endTime,
    handleMoreMenuClose,
    setCardEditDialogOpen,
    startTime,
  ]);

  // 카드 삭제 핸들러
  const handleCardDelete = useCallback(async () => {
    if (!currentEditCard?.cardId || !currentEditCard?.boardId) {
      setErrorMessage("삭제할 카드가 없거나 보드 정보가 없습니다.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 카드 삭제 API 호출
      const response = await axiosInstance.delete(
        `/card/${currentEditCard.cardId}`,
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        console.log("카드 삭제 성공:", response.data);

        // 보드에서 카드 제거
        deleteBoardCard({
          boardId: currentEditCard.boardId,
          cardId: currentEditCard.cardId,
        });

        // 삭제 후 대화상자 닫기
        setCardEditDialogOpen(false);
      } else {
        setErrorMessage("카드 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("카드 삭제 중 오류 발생:", error);
      setErrorMessage("카드 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [
    currentEditCard.boardId,
    currentEditCard.cardId,
    deleteBoardCard,
    setCardEditDialogOpen,
  ]);

  // 메뉴 아이템 클릭 핸들러들
  const handleDeleteMenuClick = useCallback(() => {
    handleMoreMenuClose();
    handleCardDelete();
  }, [handleMoreMenuClose, handleCardDelete]);

  return (
    <>
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
        {/* 헤더 부분 */}
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

              <Stack
                direction="row"
                flex={1}
                justifyContent="flex-end"
                alignItems="center"
                gap={1}
              >
                {/* 메뉴 버튼 */}
                <Tooltip title="메뉴" placement="top">
                  <IconButton
                    onClick={handleMoreMenuOpen}
                    size="small"
                    ref={moreMenuAnchorElement}
                  >
                    <MoreVertIcon
                      fontSize="large"
                      sx={{ color: theme.palette.black.main }}
                    />
                  </IconButton>
                </Tooltip>

                {/* 닫기 버튼 */}
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

        {/* 컨텐츠 부분 */}
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
            gap={2}
          >
            <Stack direction="column" justifyContent="space-between" gap={2}>
              {/* 장소 */}
              <Stack gap={1}>
                {/* 제목 */}
                <Stack direction="row" alignItems="center" gap={1}>
                  <PlaceOutlinedIcon />
                  <Typography variant="h6">장소</Typography>
                </Stack>

                {/* 지도 뷰어 - 정적 모드로 변경하고 클릭 이벤트 추가 */}
                <Box
                  position="relative"
                  sx={{
                    width: "100%",
                    height: {
                      xs: "200px",
                      md: "auto",
                    },
                    aspectRatio: "1/1",
                  }}
                >
                  <NaverMap
                    width="100%"
                    height="100%"
                    interactive={false} // 상호작용 비활성화
                    sx={{
                      borderRadius: 2,
                    }}
                  />

                  {/* 전체화면 버튼 */}
                  <Tooltip title="전체화면으로 보기" placement="left">
                    <IconButton
                      onClick={handleMapClick}
                      disableRipple // 클릭 시 ripple 효과 제거
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: theme.palette.primary.main,
                        boxShadow: 1,
                        zIndex: 1,
                      }}
                      size="small"
                    >
                      <AspectRatioIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* 클릭 가능한 투명 오버레이 */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    onClick={handleMapClick}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  />
                </Box>
              </Stack>

              {/* 시간 */}
              <Stack gap={1}>
                {/* 제목 */}
                <Stack direction="row" alignItems="center" gap={1}>
                  <ScheduleRoundedIcon />
                  <Typography variant="h6">시간</Typography>
                </Stack>

                <Stack
                  direction={{
                    xs: "row",
                    md: "column",
                  }}
                  alignItems="center"
                  gap={2}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {/* 시작 시간 */}
                    <TimeField
                      label="시작 시간"
                      value={startTime}
                      onChange={handleStartTimeChange}
                      ampm={false}
                    />

                    {/* 구분자 */}
                    <Typography
                      variant="h5"
                      display={{
                        xs: "inline-flex",
                        md: "none",
                      }}
                    >
                      ~
                    </Typography>

                    {/* 종료 시간 */}
                    <TimeField
                      label="종료 시간"
                      value={endTime}
                      onChange={handleEndTimeChange}
                      ampm={false}
                    />
                  </LocalizationProvider>
                </Stack>
              </Stack>
            </Stack>

            {/* 내용 */}
            <Stack
              width={{
                xs: "100%",
                md: "70%",
              }}
              height="450px"
              gap={1}
            >
              {/* 제목 */}
              <Stack direction="row" alignItems="center" gap={1}>
                <SubjectRoundedIcon />
                <Typography variant="h6">내용</Typography>
              </Stack>

              {/* 텍스트 편집기 */}
              <Box width="100%" flex={1}>
                <CardTextEditor
                  setContent={setContent}
                  initialContent={content} // 현재 카드 내용을 초기값으로 전달
                />
              </Box>
            </Stack>
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

      {/* 더보기 메뉴 */}
      <Menu
        anchorEl={moreMenuAnchorElement.current}
        open={isMoreMenuOpen}
        onClose={handleMoreMenuClose}
      >
        <MenuList disablePadding>
          {/* 카드 복제 */}
          <MenuItem
            onClick={handleDuplicateCardButtonClick}
            disabled={!currentEditCard?.cardId}
          >
            <ListItemIcon>
              <ContentCopyRoundedIcon />
            </ListItemIcon>
            <ListItemText>복제하기</ListItemText>
          </MenuItem>

          {/* 카드 삭제 */}
          <MenuItem
            onClick={handleDeleteMenuClick}
            disabled={!currentEditCard?.cardId}
          >
            <ListItemIcon>
              <DeleteOutlineRoundedIcon
                sx={{
                  color: theme.palette.error.main,
                }}
              />
            </ListItemIcon>
            <ListItemText
              sx={{
                color: theme.palette.error.main,
              }}
            >
              삭제하기
            </ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* 전체화면 지도 모달 */}
      <FullScreenMapDialog
        open={isMapDialogOpen}
        onClose={handleMapDialogClose}
      />
    </>
  );
};

export default CardEditDialog;
