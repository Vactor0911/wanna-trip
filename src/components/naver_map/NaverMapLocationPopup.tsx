import {
  Stack,
  Popover,
  Box,
  Skeleton,
  Typography,
  IconButton,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_ZOOM,
  drawerOpenAtom,
  locationDialogAnchor,
  markerPositionAtom,
  naverMapDialogOpenAtom,
  selectedLocationAtom,
  zoomAtom,
} from "../../state/naverMapDialog";
import axiosInstance from "../../utils/axiosInstance";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";

const NaverMapLocationPopup = () => {
  const [anchorElement, setAnchorElement] = useAtom(locationDialogAnchor); // 위치 선택 대화상자 앵커 요소
  const [selectedLocation, setSelectedLocation] = useAtom(selectedLocationAtom); // 선택된 위치 정보
  const setMarkerPosition = useSetAtom(markerPositionAtom); // 마커 위치 상태
  const setZoom = useSetAtom(zoomAtom); // 현재 줌 상태
  const [isLoading, setIsLoading] = useState(false); // 이미지 로딩 상태
  const [image, setImage] = useState<{
    imageUrl: string | null;
    thumbnailUrl: string | null;
  } | null>(null); // 선택한 장소 이미지
  const setNaverMapDialogOpen = useSetAtom(naverMapDialogOpenAtom);
  const theme = useTheme(); // MUI 테마
  const drawerOpen = useAtomValue(drawerOpenAtom); // 검색 드로어 메뉴 열림 상태

  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 모바일 여부 확인

  // 대화상자 닫기
  const handleClose = useCallback(() => {
    setAnchorElement(null);
  }, [setAnchorElement]);

  // 팝업시 선택한 장소 정보 추출 및 이미지 검색
  useEffect(() => {
    console.log("팝업 열림");

    // 팝업이 닫히는 작업이라면 종료
    if (!anchorElement) {
      console.log("팝업 닫힘 - 앵커 부적절");
      return;
    }

    // 위도 경도 데이터가 없다면 종료
    if (!selectedLocation || !selectedLocation.mapx || !selectedLocation.mapy) {
      console.log("팝업 닫힘 - 선택된 위치 정보 없음");
      return;
    }

    console.log("팝업 열림 - 위치 정보 추출");

    // 선택한 위치 정보 추출
    const latitude = parseFloat(selectedLocation.mapy) / 10000000;
    const longitude = parseFloat(selectedLocation.mapx) / 10000000;

    // 위치 정보 업데이트
    setMarkerPosition({ lat: latitude, lng: longitude });
    setZoom(DEFAULT_ZOOM);

    // 이미지 검색
    const title = selectedLocation.title.replace(/<[^>]*>/g, "");
    setIsLoading(true);
    setImage(null);

    try {
      Promise.resolve().then(async () => {
        const response = await axiosInstance.get("/naver-map/place-images", {
          params: { query: title },
          headers: { "Content-Type": "application/json" },
        });

        if (response.data && response.data.success && response.data.bestMatch) {
          setImage(response.data.bestMatch);
        } else {
          setImage({ imageUrl: null, thumbnailUrl: null });
        }
      });
    } catch (err) {
      console.error("이미지 검색 오류:", err);
      setImage({ imageUrl: null, thumbnailUrl: null });
    } finally {
      setIsLoading(false);
    }
  }, [anchorElement, selectedLocation, setMarkerPosition, setZoom]);

  // 링크 클릭
  const handleLinkClick = useCallback(() => {
    if (selectedLocation?.link) {
      window.open(selectedLocation.link, "_blank");
    }
  }, [selectedLocation]);

  // 선택 버튼 클릭
  const handleSelectButtonClick = useCallback(() => {
    if (!selectedLocation) {
      return;
    }

    if (!selectedLocation.mapx || !selectedLocation.mapy) {
      return;
    }

    // 선택한 장소 정보
    const latitude = parseFloat(selectedLocation.mapy) / 10000000;
    const longitude = parseFloat(selectedLocation.mapx) / 10000000;

    // 백엔드에서 제공된 이미지만 사용
    setSelectedLocation({
      title: selectedLocation.title.replace(/<[^>]*>/g, ""),
      address: selectedLocation.address,
      latitude,
      longitude,
      category: selectedLocation.category,
      // thumbnailUrl이 있는 경우에만 전달
      ...(image?.thumbnailUrl && {
        thumbnailUrl: image.thumbnailUrl,
      }),
      ...(image?.imageUrl && { imageUrl: image.imageUrl }),
    });
    handleClose(); // 대화상자 닫기
    setNaverMapDialogOpen(false); // 네이버 지도 대화상자 닫기
  }, [
    handleClose,
    image,
    selectedLocation,
    setNaverMapDialogOpen,
    setSelectedLocation,
  ]);

  // 모바일의 경우 검색 드로어가 열리면 팝업 닫기
  useEffect(() => {
    if (isMobile && anchorElement && drawerOpen) {
      handleClose();
    }
  }, [anchorElement, drawerOpen, handleClose, isMobile]);

  // 렌더링할 요소
  const renderElement = useMemo(() => {
    return (
      <Stack padding={2} gap={2} width={350} position="relative">
        {/* 상단 부분 */}
        <Stack direction="row" gap={3} alignItems="flex-start">
          {/* 대표 이미지 */}
          {isLoading || !image ? (
            <Skeleton
              variant="rectangular"
              width={100}
              height={100}
              sx={{
                borderRadius: 1,
              }}
            />
          ) : (
            <Box
              component="img"
              src={image?.imageUrl ?? undefined}
              alt={selectedLocation?.title.replace(/<[^>]*>/g, "")}
              width={100}
              height={100}
              borderRadius={1}
            />
          )}

          {/* 주요 정보 */}
          <Stack mt={1}>
            {/* 장소명 */}
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedLocation?.title.replace(/<[^>]*>/g, "")}
            </Typography>

            {/* 카테고리 */}
            <Typography
              variant="subtitle2"
              color="text.secondary"
              display="inline-flex"
              alignItems="center"
            >
              <CategoryRoundedIcon
                color="primary"
                fontSize="small"
                sx={{
                  marginRight: 0.5,
                }}
              />
              {selectedLocation?.category}
            </Typography>
          </Stack>
        </Stack>

        {/* 선택 버튼 */}
        <Button variant="contained" onClick={handleSelectButtonClick}>
          <Typography variant="subtitle1" fontWeight="bold">
            선택
          </Typography>
        </Button>

        {/* 구분선 */}
        <Divider />

        {/* 세부 정보 */}
        <Stack gap={1}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            display="inline-flex"
            alignItems="center"
          >
            <LocationOnRoundedIcon
              fontSize="small"
              sx={{
                marginRight: 0.5,
              }}
            />
            {selectedLocation?.address}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            display="inline-flex"
            alignItems="center"
            sx={{
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={handleLinkClick}
          >
            <LanguageRoundedIcon
              fontSize="small"
              sx={{
                marginRight: 0.5,
              }}
            />
            {selectedLocation?.link}
          </Typography>
        </Stack>

        {/* 닫기 버튼 */}
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: "7px",
            right: "7px",
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
    );
  }, [
    handleClose,
    handleLinkClick,
    handleSelectButtonClick,
    image,
    isLoading,
    selectedLocation?.address,
    selectedLocation?.category,
    selectedLocation?.link,
    selectedLocation?.title,
  ]);

  // 모바일 팝업
  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={!!anchorElement}
        onClose={handleClose}
        variant="persistent"
        sx={{
          "& .MuiDrawer-paper": {
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            boxShadow: 5,
            border: "none",
          },
        }}
      >
        {renderElement}
      </Drawer>
    );
  }

  // PC, 태블릿 팝업
  return (
    <Popover
      open={!!anchorElement}
      onClose={handleClose}
      anchorEl={anchorElement}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      sx={{
        transform: "translateX(50px)",
      }}
    >
      {renderElement}
    </Popover>
  );
};

export default NaverMapLocationPopup;
