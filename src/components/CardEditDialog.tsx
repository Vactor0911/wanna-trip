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
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import Tooltip from "./Tooltip";
import CardTextEditor from "./text_editor/CardTextEditor";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimeField } from "@mui/x-date-pickers";
import NaverMap from "./naver_map/NaverMap";
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
import React from "react";
import NaverMapDialog from "./naver_map/NaverMapDialog";
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  LocationInterface,
  naverMapDialogOpenAtom,
  naverMapInitialLocationAtom,
  selectedLocationAtom,
} from "../state/naverMapDialog";
import { useCopyCard } from "../hooks/template";

interface MapSectionProps {
  selectedLocation: LocationInterface | null; // 위치 정보가 없을 수도 있으므로 null 허용
  handleMapClick: () => void;
  disabled?: boolean; // 지도 클릭 비활성화 여부
}

// 지도 컴포넌트 분리
const MapSection = React.memo(
  (props: MapSectionProps) => {
    const { selectedLocation, handleMapClick, disabled } = props;
    const theme = useTheme();

    return (
      <Box
        position="relative"
        sx={{
          width: "100%",
          height: { xs: "200px", md: "auto" },
          aspectRatio: "1/1",
        }}
      >
        <NaverMap
          width="100%"
          height="100%"
          interactive={false}
          lat={selectedLocation?.latitude || DEFAULT_LAT}
          lng={selectedLocation?.longitude || DEFAULT_LNG}
          markerPosition={
            selectedLocation &&
            selectedLocation.latitude !== undefined &&
            selectedLocation.longitude !== undefined
              ? {
                  lat: selectedLocation.latitude,
                  lng: selectedLocation.longitude,
                }
              : null
          }
          sx={{ borderRadius: 2 }}
        />

        {/* 전체화면 버튼 */}
        <Tooltip title="전체화면으로 보기" placement="left">
          <IconButton
            onClick={handleMapClick}
            disabled={disabled}
            disableRipple
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
          onClick={disabled ? undefined : handleMapClick}
          sx={{
            cursor: disabled ? "not-allowed" : "pointer",
            borderRadius: 2,
            pointerEvents: disabled ? "none" : "auto", // 잠금 상태일 때는 이벤트 차단
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.05)" },
          }}
        />
      </Box>
    );
  },
  // 메모이제이션 최적화를 위한 비교 함수 수정
  (prevProps, nextProps) => {
    // disabled 상태가 변경되었으면 리렌더링
    if (prevProps.disabled !== nextProps.disabled) return false;

    // locationInfo 변경 확인 (기존 코드)
    if (!prevProps.selectedLocation && !nextProps.selectedLocation) return true;
    if (!prevProps.selectedLocation || !nextProps.selectedLocation)
      return false;

    return (
      prevProps.selectedLocation.latitude ===
        nextProps.selectedLocation.latitude &&
      prevProps.selectedLocation.longitude ===
        nextProps.selectedLocation.longitude
    );
  }
);

interface CardEditDialogProps {
  fetchTemplateData: () => Promise<void>; // 함수 타입 추가
  emitFetch: () => void; // 소켓을 통한 템플릿 패치 요청 함수 타입 추가
  emitCardEditingStart: (cardUuid: string) => void;
  emitCardEditingEnd: (cardUuid: string) => void;
}

const CardEditDialog = (props: CardEditDialogProps) => {
  const {
    fetchTemplateData,
    emitFetch,
    emitCardEditingStart,
    emitCardEditingEnd,
  } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const copyCard = useCopyCard(); // 카드 복제 훅

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
  const setIsMapDialogOpen = useSetAtom(naverMapDialogOpenAtom); // 전체화면 지도 대화상자 열림 상태
  const setNaverMapInitialLocation = useSetAtom(naverMapInitialLocationAtom); // 초기 위치 정보 상태

  // 위치 정보 상태 추가
  const [selectedLocation, setSelectedLocation] = useAtom(selectedLocationAtom); // 선택한 위치 정보 상태

  const [currentEditCard] = useAtom(currentEditCardAtom); // 현재 편집 중인 카드 정보
  const [template] = useAtom(templateAtom); // 템플릿 상태 추가
  const [isOwner, setIsOwner] = useState(true); // 템플릿 소유자 여부

  // 현재 보드 정보 찾기
  const currentBoard = template.boards.find(
    (board) => board.uuid === currentEditCard?.boardUuid
  );

  // 보드 카드 업데이트 함수
  const [, updateBoardCard] = useAtom(updateBoardCardAtom); // 보드 카드 업데이트 함수
  const [, deleteBoardCard] = useAtom(deleteBoardCardAtom); // 보드 카드 삭제 함수 추가

  // 카드 편집 이벤트 송신
  useEffect(() => {
    if (cardEditDialogOpen) {
      emitCardEditingStart(currentEditCard.cardUuid!);
    } else {
      emitCardEditingEnd(currentEditCard.cardUuid!);
    }
  }, [
    cardEditDialogOpen,
    currentEditCard?.cardUuid,
    emitCardEditingStart,
    emitCardEditingEnd,
  ]);

  // isOwner 상태 설정
  useEffect(() => {
    // localStorage에서 template_isOwner 값 가져오기
    const ownerStatus = localStorage.getItem("template_isOwner");
    setIsOwner(ownerStatus !== "false"); // 'false'가 아니면 true로 설정

    // 소유자가 아니면 컨트롤 비활성화
    if (ownerStatus === "false") {
      setIsCardLocked(true); // 카드를 잠금 상태로 설정
    }
  }, []);

  // 동적 제목 생성 수정
  const dialogTitle = useMemo(() => {
    if (!isOwner) return "계획 보기 (읽기 전용)";
    return currentBoard
      ? `${currentBoard.dayNumber || "N"}일차`
      : "새 카드 작성";
  }, [currentBoard, isOwner]);

  // 대화상자 열 때 시간 초기화
  useEffect(() => {
    if (cardEditDialogOpen) {
      // 새 카드인 경우 기본 값으로 시작
      if (!currentEditCard?.cardUuid) {
        setContent("");
        setIsCardLocked(false); // 기본값 - 잠금 해제
        setStartTime(dayjs("2001-01-01T01:00"));
        setEndTime(dayjs("2001-01-01T02:00"));
        setSelectedLocation(null); // 위치 정보 초기화
      }
      // 기존 카드인 경우 데이터 로드
      else {
        // 현재 보드 찾기
        const currentBoard = template.boards.find(
          (board) => board.uuid === currentEditCard?.boardUuid
        );

        // 현재 카드 찾기
        const currentCard = currentBoard?.cards.find(
          (card) => card.uuid === currentEditCard?.cardUuid
        );

        if (currentCard && !cardEditDialogOpen) {
          setContent(currentCard.content || "");
          setStartTime(currentCard.startTime || dayjs("2001-01-01T01:00"));
          setEndTime(currentCard.endTime || dayjs("2001-01-01T02:00"));
          setIsCardLocked(currentCard.locked || false); // 카드의 잠금 상태 설정

          // 카드에 위치 정보가 있으면 설정
          if (currentCard.location) {
            // 필요한 필드를 추출하여 새 객체 생성
            const extractedLocation = {
              title: currentCard.location.title,
              address: currentCard.location.address || "", // 주소가 없을 경우 빈 문자열 기본값
              latitude: currentCard.location.latitude ?? 37.5665, // 위도가 없을 경우 서울시청 좌표
              longitude: currentCard.location.longitude ?? 126.978, // 경도가 없을 경우 서울시청 좌표
              category: currentCard.location.category,
              thumbnailUrl: currentCard.location.thumbnailUrl,
            };

            setSelectedLocation(extractedLocation);
          } else {
            // 서버에서 위치 정보 조회
            const fetchLocationInfo = async () => {
              try {
                const response = await axiosInstance.get(
                  `/card/location/${currentEditCard.cardUuid}`
                );
                if (
                  response.data &&
                  response.data.success &&
                  response.data.location
                ) {
                  // 서버 응답에서 위치 정보 변환
                  const locationData = {
                    title: response.data.location.title,
                    address: response.data.location.address,
                    latitude: parseFloat(response.data.location.latitude),
                    longitude: parseFloat(response.data.location.longitude),
                    category: response.data.location.category,
                    thumbnailUrl: response.data.location.thumbnail_url,
                  };

                  // 위치 정보 설정
                  setSelectedLocation(locationData);
                }
              } catch (error) {
                console.error("위치 정보 로드 실패:", error);
                setSelectedLocation(null);
              }
            };
            fetchLocationInfo();
          }
        }
      }
    }
  }, [
    cardEditDialogOpen,
    currentEditCard,
    setSelectedLocation,
    template.boards,
  ]);

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
      if (currentEditCard && currentEditCard.boardUuid) {
        // 내용 수정할 때는 orderIndex를 전송하지 않도록 수정
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cardData: any = {
          content, // 카드 내용
          startTime: startTime.format("HH:mm:ss"), // 시작 시간
          endTime: endTime.format("HH:mm:ss"), // 종료 시간
          locked: isCardLocked, // 잠금 상태
          orderIndex: currentEditCard.orderIndex || 1,
          // 위치 정보가 있는 경우에만 포함
          ...(selectedLocation && {
            location: {
              title: selectedLocation.title,
              address: selectedLocation.address,
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              category: selectedLocation.category || "",
              thumbnail_url: selectedLocation.thumbnailUrl || "",
            },
          }),
        };

        // 새 카드 생성 시에만 orderIndex 포함 (드래그 앤 드롭으로 위치 변경하는 경우는 별도 처리)
        const isNewCard = !currentEditCard.cardUuid;
        if (isNewCard) {
          cardData.orderIndex = currentEditCard.orderIndex || 1;
        }

        let response;

        // 기존 카드 수정
        if (currentEditCard.cardUuid) {
          response = await axiosInstance.put(
            `/card/${currentEditCard.cardUuid}`,
            cardData,
            { headers: { "X-CSRF-Token": csrfToken } }
          );
        }
        // 새 카드 생성
        else {
          response = await axiosInstance.post(
            `/card/${currentEditCard.boardUuid}`,
            cardData,
            { headers: { "X-CSRF-Token": csrfToken } }
          );
        }

        if (response.data.success) {
          // 카드 ID 가져오기 (신규 카드면 응답에서, 기존 카드면 현재 ID 사용)
          const cardUuid = isNewCard
            ? response.data.cardUuid
            : currentEditCard.cardUuid;

          // 카드 객체 생성 (새 카드든 수정된 카드든)
          const updatedCard = {
            uuid: cardUuid,
            content,
            startTime,
            endTime,
            locked: isCardLocked,
            orderIndex: currentEditCard.orderIndex || 1,
            ...(selectedLocation ? { location: selectedLocation } : {}),
          };

          // 카드 상태 업데이트 - 모든 경우에 항상 업데이트
          updateBoardCard({
            boardUuid: currentEditCard.boardUuid,
            card: updatedCard,
            isNew: isNewCard,
          });
          emitFetch(); // 소켓을 통한 템플릿 패치 요청

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
    emitFetch,
    endTime,
    isCardLocked,
    selectedLocation,
    setCardEditDialogOpen,
    startTime,
    updateBoardCard,
  ]);

  // 저장 버튼 클릭
  const handleSaveButtonClick = useCallback(() => {
    saveCardToServer();
    emitFetch();
  }, [saveCardToServer, emitFetch]);

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
    setNaverMapInitialLocation(selectedLocation);
  }, [selectedLocation, setIsMapDialogOpen, setNaverMapInitialLocation]);

  // 카드 복제 버튼 클릭
  const handleDuplicateCardButtonClick = useCallback(async () => {
    // 현재 편집 중인 카드가 없거나 보드 정보가 없으면 오류 출력
    if (!currentEditCard?.cardUuid || !currentEditCard?.boardUuid) {
      setErrorMessage("복제할 카드가 없거나 보드 정보가 없습니다.");
      return;
    }

    setIsSaving(true); // 저장 중 상태로 변경
    setErrorMessage(""); // 오류 메시지 초기화
    // 카드 복제 훅 호출
    try {
      await copyCard(currentEditCard.cardUuid);

      await fetchTemplateData(); // 템플릿 데이터 새로고침
      emitFetch(); // 소켓을 통한 템플릿 패치 요청
    } catch (error) {
      console.error("카드 추가 중 오류 발생:", error);
    } finally {
      setIsSaving(false); // 저장 중 상태 해제
      handleMoreMenuClose(); // 메뉴 닫기
      setCardEditDialogOpen(false); // 대화상자 닫기
    }
  }, [
    copyCard,
    currentEditCard?.boardUuid,
    currentEditCard.cardUuid,
    emitFetch,
    fetchTemplateData,
    handleMoreMenuClose,
    setCardEditDialogOpen,
  ]);

  // 카드 삭제 핸들러
  const handleCardDelete = useCallback(async () => {
    if (!currentEditCard?.cardUuid || !currentEditCard?.boardUuid) {
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
        `/card/${currentEditCard.cardUuid}`,
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 보드에서 카드 제거
        deleteBoardCard({
          boardUuid: currentEditCard.boardUuid,
          cardUuid: currentEditCard.cardUuid,
        });
        emitFetch();

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
    currentEditCard.boardUuid,
    currentEditCard.cardUuid,
    deleteBoardCard,
    emitFetch,
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
              {/* 카드 잠금 버튼 - 소유자일 때만 표시 */}
              {isOwner && (
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
              )}

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
                    <MoreVertIcon fontSize="large" color="black" />
                  </IconButton>
                </Tooltip>

                {/* 닫기 버튼 */}
                <Tooltip title="닫기" placement="top">
                  <IconButton onClick={handleCardEditDialogClose} size="small">
                    <CloseRoundedIcon fontSize="large" color="black" />
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
                <MapSection
                  selectedLocation={selectedLocation}
                  handleMapClick={handleMapClick}
                  disabled={isCardLocked}
                />

                {/* 선택된 장소 정보 표시 */}
                {selectedLocation && (
                  <Box sx={{ mt: 1, px: 1 }}>
                    {/* 장소명 */}
                    <Typography variant="subtitle2" fontWeight="bold" noWrap>
                      {selectedLocation.title}
                    </Typography>

                    {/* 주소 */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {selectedLocation.address}
                    </Typography>

                    {/* 장소 카테고리 */}
                    {selectedLocation.category && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {selectedLocation.category}
                      </Typography>
                    )}
                  </Box>
                )}
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
                      disabled={isCardLocked}
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
                      disabled={isCardLocked}
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
                  disabled={isCardLocked}
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

          {/* 버튼 컨테이너 - 소유자일 때만 저장 버튼 표시 */}
          <Stack direction="row" gap={2} alignSelf="flex-end">
            {/* 닫기 버튼 */}
            <Button
              variant="outlined"
              color="black"
              sx={{
                px: 3,
              }}
              onClick={handleCardEditDialogClose}
            >
              <Typography>{isOwner ? "취소" : "닫기"}</Typography>
            </Button>

            {/* 저장 버튼 - 소유자일 때만 표시 */}
            {isOwner && (
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
            )}
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
            disabled={!currentEditCard?.cardUuid}
          >
            <ListItemIcon>
              <ContentCopyRoundedIcon />
            </ListItemIcon>
            <ListItemText>복제하기</ListItemText>
          </MenuItem>

          {/* 카드 삭제 */}
          <MenuItem
            onClick={handleDeleteMenuClick}
            disabled={!currentEditCard?.cardUuid}
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
      <NaverMapDialog />
    </>
  );
};

export default CardEditDialog;
