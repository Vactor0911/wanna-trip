import { Dialog, IconButton, Box, Paper } from "@mui/material";
import { useCallback, useEffect } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NaverMap from "./NaverMap";
import NaverMapSearchDrawer from "./NaverMapSearchDrawer";
import { useAtom, useSetAtom } from "jotai";
import {
  keywordAtom,
  LocationInterface,
  markerPositionAtom,
  searchResultsAtom,
  selectedPositionAtom,
  zoomAtom,
} from "../../state/naverMapDialog";
import NaverMapLocationPopup from "./NaverMapLocationPopup";

interface NaverMapDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPlace: (place: {
    title: string;
    address: string;
    latitude: number;
    longitude: number;
    category?: string;
    thumbnailUrl?: string;
    imageUrl?: string | null;
  }) => void;
  lat?: number; // 카드에 저장된 위치가 있을 경우 값 전달
  lng?: number;
  locationInfoFromCard?: LocationInterface;
}

const NaverMapDialog = (props: NaverMapDialogProps) => {
  const { open, onClose, lat = 37.5665, lng = 126.978 } = props;

  const setKeyword = useSetAtom(keywordAtom); // 검색어 상태
  const setSearchResults = useSetAtom(searchResultsAtom); // 검색 결과 상태
  const [selectedPosition, setSelectedPosition] = useAtom(selectedPositionAtom); // 선택된 위치
  const [marker, setMarker] = useAtom(markerPositionAtom); // 마커 위치
  const [zoom, setZoom] = useAtom(zoomAtom); // 현재 지도 줌 레벨

  // 다이얼로그가 처음 열릴 때만 실행 (검색 상태 초기화 용도)
  useEffect(() => {
    if (open) {
      // 검색 관련 상태 초기화
      setKeyword("");
      setSearchResults([]);
    }
  }, [open, setKeyword, setSearchResults]); // open 상태가 변경될 때만 실행

  // 위치 정보와 마커 초기화 용도
  useEffect(() => {
    if (open && lat && lng && !selectedPosition) {
      setSelectedPosition({ lat, lng });
      setMarker({ lat, lng });
      setZoom(zoom);
    }
  }, [open, lat, lng, zoom, selectedPosition, setZoom, setSelectedPosition]);

  // 닫기 버튼 핸들러
  const handleClose = useCallback(() => {
    // 상세 정보 초기화
    setSelectedPosition(null);
    setSearchResults([]);
    setKeyword("");

    // 부모 컴포넌트의 onClose 호출
    onClose();
  }, [onClose, setKeyword, setSearchResults, setSelectedPosition]);

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
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
          top: 16,
          borderRadius: "50%",
        }}
      >
        <IconButton onClick={handleClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Paper>
    </Dialog>
  );
};

export default NaverMapDialog;
