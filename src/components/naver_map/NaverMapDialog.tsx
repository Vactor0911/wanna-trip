import {
  Dialog,
  IconButton,
  Box,
  Paper,
} from "@mui/material";
import { useCallback, useEffect } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NaverMap from "./NaverMap";
import NaverMapSearchDrawer from "./NaverMapSearchDrawer";
import { useAtom, useSetAtom } from "jotai";
import {
  drawerOpenAtom,
  keywordAtom,
  markerPositionAtom,
  naverMapDialogOpenAtom,
  searchResultsAtom,
  selectedPositionAtom,
  zoomAtom,
} from "../../state/naverMapDialog";
import NaverMapLocationPopup from "./NaverMapLocationPopup";

interface NaverMapDialogProps {
  lat?: number; // 카드에 저장된 위치가 있을 경우 값 전달
  lng?: number;
}

const NaverMapDialog = (props: NaverMapDialogProps) => {
  const { lat = 37.5665, lng = 126.978 } = props;

  const [open, setOpen] = useAtom(naverMapDialogOpenAtom); // 네이버 지도 대화상자 열림 상태
  const setKeyword = useSetAtom(keywordAtom); // 검색어 상태
  const setSearchResults = useSetAtom(searchResultsAtom); // 검색 결과 상태
  const [selectedPosition, setSelectedPosition] = useAtom(selectedPositionAtom); // 선택된 위치
  const [marker, setMarker] = useAtom(markerPositionAtom); // 마커 위치
  const [zoom, setZoom] = useAtom(zoomAtom); // 현재 지도 줌 레벨
  const setDrawerOpenAtom = useSetAtom(drawerOpenAtom); // 검색 드로어 메뉴 열림 상태

  // 다이얼로그가 처음 열릴 때만 실행 (검색 상태 초기화 용도)
  useEffect(() => {
    if (open) {
      // 검색 관련 상태 초기화
      setKeyword("");
      setSearchResults([]);
      setDrawerOpenAtom(true); // 검색 드로어 메뉴 열림 상태로 설정
    }
  }, [open, setDrawerOpenAtom, setKeyword, setSearchResults]);

  // 위치 정보와 마커 초기화 용도
  useEffect(() => {
    // 다이얼로그가 닫혀있다면 종료
    if (!open) {
      return;
    }

    if (lat && lng) {
      setSelectedPosition({ lat, lng });
      setMarker({ lat, lng });
      setZoom(zoom);
    }
  }, [open, lat, lng, zoom, setZoom, setMarker, setSelectedPosition]);

  // 닫기 버튼 핸들러
  const handleClose = useCallback(() => {
    // 상세 정보 초기화
    setSelectedPosition(null);
    setSearchResults([]);
    setKeyword("");
    setOpen(false);
  }, [setKeyword, setOpen, setSearchResults, setSelectedPosition]);

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
          lat={selectedPosition?.lat ?? lat}
          lng={selectedPosition?.lng ?? lng}
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
