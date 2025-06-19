import {
  Dialog,
  IconButton,
  Box,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NaverMap from "./NaverMap";
import NaverMapSearchDrawer from "./NaverMapSearchDrawer";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  DEFAULT_ZOOM,
  DEFAULT_LAT,
  DEFAULT_LNG,
  drawerOpenAtom,
  keywordAtom,
  markerPositionAtom,
  naverMapDialogOpenAtom,
  searchResultsAtom,
  selectedLocationAtom,
  selectedPositionAtom,
  zoomAtom,
  locationDialogAnchor,
  naverMapInitialLocationAtom,
} from "../../state/naverMapDialog";
import NaverMapLocationPopup from "./NaverMapLocationPopup";

const NaverMapDialog = () => {
  const [open, setOpen] = useAtom(naverMapDialogOpenAtom); // 네이버 지도 대화상자 열림 상태
  const setKeyword = useSetAtom(keywordAtom); // 검색어 상태
  const setSearchResults = useSetAtom(searchResultsAtom); // 검색 결과 상태
  const [selectedPosition, setSelectedPosition] = useAtom(selectedPositionAtom); // 선택된 위치
  const [selectedLocation, setSelectedLocation] = useAtom(selectedLocationAtom); // 선택된 위치 정보
  const [marker, setMarker] = useAtom(markerPositionAtom); // 마커 위치
  const [zoom, setZoom] = useAtom(zoomAtom); // 현재 지도 줌 레벨
  const setDrawerOpen = useSetAtom(drawerOpenAtom); // 검색 드로어 메뉴 열림 상태
  const theme = useTheme(); // MUI 테마
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 모바일 여부
  const setLocationDialogAnchor = useSetAtom(locationDialogAnchor); // 위치 선택 대화상자 앵커 요소
  const initialLocation = useAtomValue(naverMapInitialLocationAtom); // 초기 위치 정보

  // 다이얼로그가 처음 열릴 때만 실행 (검색 상태 초기화 용도)
  useEffect(() => {
    if (open) {
      // 검색 관련 상태 초기화
      setKeyword("");
      setSearchResults([]);
      setDrawerOpen(!isMobile); // PC, 태블릿에선 검색 드로어 메뉴 열림 상태로 설정
    }
  }, [isMobile, open, setDrawerOpen, setKeyword, setSearchResults]);

  // 위치 정보와 마커 초기화 용도
  useEffect(() => {
    // 다이얼로그가 닫혀있다면 종료
    if (!open) {
      return;
    }

    console.log("선택된 위치 정보:", selectedLocation);
    if (
      selectedLocation &&
      selectedLocation.latitude &&
      selectedLocation.longitude
    ) {
      const lat = selectedLocation.latitude;
      const lng = selectedLocation.longitude;

      setSelectedPosition({ lat, lng });
      setMarker({ lat, lng });
      setZoom(DEFAULT_ZOOM);
    }
  }, [open, selectedLocation, setMarker, setSelectedPosition, setZoom]);

  // 닫기 버튼 핸들러
  const handleClose = useCallback(() => {
    // 상세 정보 초기화
    setSelectedLocation(initialLocation); // 선택된 위치 초기화
    setSearchResults([]);
    setKeyword("");
    setDrawerOpen(false); // 검색 드로어 메뉴 닫기
    setLocationDialogAnchor(null); // 위치 선택 대화상자 앵커 초기화
    setOpen(false);
  }, [
    initialLocation,
    setDrawerOpen,
    setKeyword,
    setLocationDialogAnchor,
    setOpen,
    setSearchResults,
    setSelectedLocation,
  ]);

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      {/* 지도 배경 */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
          transition: "left 0.3s ease", // 부드러운 전환 효과
        }}
      >
        <NaverMap
          key={`map-${selectedPosition?.lat}-${selectedPosition?.lng}-${zoom}`}
          width="100%"
          height="100%"
          lat={selectedPosition?.lat || DEFAULT_LAT}
          lng={selectedPosition?.lng || DEFAULT_LNG}
          zoom={zoom}
          interactive
          markerPosition={marker}
        />
      </Box>

      {/* 검색 드로어 메뉴 */}
      <NaverMapSearchDrawer />

      {/* 장소 팝업 대화상자 */}
      <NaverMapLocationPopup />

      {/* 닫기 버튼 */}
      <Paper
        sx={{
          position: "fixed",
          right: 16,
          top: 24,
          borderRadius: "50%",
          zIndex: 1000,
        }}
      >
        <IconButton onClick={handleClose}>
          <CloseRoundedIcon color="primary" />
        </IconButton>
      </Paper>
    </Dialog>
  );
};

export default NaverMapDialog;
