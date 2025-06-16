import {
  Dialog,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
  Typography,
  List,
  Divider,
  ListItemButton,
  Button,
  Drawer,
  Link,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PlaceIcon from "@mui/icons-material/Place";
import NaverMap from "./NaverMap";
import axiosInstance from "../utils/axiosInstance";
import React from "react";

// 바텀 상세정보 용 아이콘
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import CategoryIcon from "@mui/icons-material/Category";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

// 검색 결과 타입 정의
interface SearchResult {
  title: string; // 장소명 (예: "서울특별시청")
  address: string; // 주소
  category: string; // 카테고리 (예: "음식점 > 한식")
  description: string; // 설명
  link: string; // 링크
  mapx: string; // 경도 (예: "1269796830")
  mapy: string; // 위도 (예: "375704149")
  telephone: string; // 전화번호
}

interface FullScreenMapDialogProps {
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
  zoom?: number;
  // locationInfoFromCard를 선택사항으로 변경하고 내부 프로퍼티도 조정
  locationInfoFromCard?: {
    title: string;
    address: string;
    category?: string;
    thumbnailUrl?: string; // 선택사항으로 변경
    imageUrl?: string | null; // 선택사항으로 변경
    latitude?: number; // latitude 추가 (있을 수도 있으므로)
    longitude?: number; // longitude 추가 (있을 수도 있으므로)
  } | null;
}

const FullScreenMapDialog = ({
  open,
  onClose,
  onSelectPlace,
  lat = 37.5665, // 기본 서울 시청 위도
  lng = 126.978, // 기본 서울 시청 경도
  zoom = 15, // 기본 줌 레벨
  locationInfoFromCard, // 카드에서 전달받은 위치 정보
}: FullScreenMapDialogProps) => {
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // 검색 결과 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(""); // 오류 메시지 상태
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null); // 선택된 위치
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null
  ); // 마커 위치
  const [chosenPlace, setChosenPlace] = useState<SearchResult | null>(null); // 선택된 위치
  const [currentZoom, setCurrentZoom] = useState(zoom); // 현재 지도 줌 레벨

  const [placeImage, setPlaceImage] = useState<{
    imageUrl: string | null;
    thumbnailUrl: string | null;
  } | null>(null); // 장소 이미지 상태
  const [imageLoading, setImageLoading] = useState(false); // 이미지 로딩 상태

  const [drawerOpen, setDrawerOpen] = useState(true);
  const DRAWER_WIDTH = 350; // 검색 패널 너비

  // 다이얼로그가 처음 열릴 때만 실행 (검색 상태 초기화 용도)
  useEffect(() => {
    if (open) {
      // 검색 관련 상태 초기화
      setSearchQuery("");
      setSearchResults([]);
      setError("");
      setIsLoading(false);
    }
  }, [open]); // open 상태가 변경될 때만 실행

  // 위치 정보와 마커 초기화 용도
  useEffect(() => {
    if (open && lat && lng && !selectedLocation) {
      setSelectedLocation({ lat, lng });
      setMarker({ lat, lng });
      setCurrentZoom(zoom);
    }
  }, [open, lat, lng, zoom, selectedLocation]);

  // 카드에서 넘어온 위치 정보로 상세 정보 설정 용도
  useEffect(() => {
    if (open && locationInfoFromCard && !chosenPlace) {
      setChosenPlace({
        title: locationInfoFromCard.title || `위치 (${lat}, ${lng})`,
        address: locationInfoFromCard.address || "",
        category: locationInfoFromCard.category || "",
        description: "",
        link: "",
        mapx: String(lng * 10000000),
        mapy: String(lat * 10000000),
        telephone: "",
      });

      // 이미지 정보가 있는 경우에만 설정
      if (locationInfoFromCard?.thumbnailUrl) {
        setPlaceImage({
          imageUrl: locationInfoFromCard.imageUrl || null,
          thumbnailUrl: locationInfoFromCard.thumbnailUrl,
        });
        setImageLoading(false);
      }
    }
  }, [open, locationInfoFromCard, chosenPlace, lat, lng]);

  // 검색어 초기화 핸들러 추가
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // 검색어 입력 핸들러
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // 검색 실행 핸들러
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      // 장소 검색 API 호출
      const response = await axiosInstance.get("/naver-map/places", {
        params: {
          query: searchQuery,
          display: 15,
          start: 1,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data && response.data.items) {
        setSearchResults(response.data.items);

        console.log("검색 결과:", response.data.items);

        // 결과가 있으면 첫번째 항목으로 지도 및 마커 업데이트
        const firstResult = response.data.items[0];
        const newLat = parseFloat(firstResult.mapy) / 10000000;
        const newLng = parseFloat(firstResult.mapx) / 10000000;
        setSelectedLocation({ lat: newLat, lng: newLng }); // 선택된 위치 업데이트
        setMarker({ lat: newLat, lng: newLng }); // 마커 위치 업데이트
        setCurrentZoom(currentZoom); // 현재 줌 레벨 유지
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("장소 검색 오류:", err);
      setError("장소 검색 중 오류가 발생했습니다");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentZoom, searchQuery]);

  // 리스트에서 항목 선택 시 지도 업데이트와 선택 결과 저장
  const handleSelectPlace = useCallback(
    async (place: SearchResult) => {
      // 선택한 위치 정보 추출
      const latitude = parseFloat(place.mapy) / 10000000;
      const longitude = parseFloat(place.mapx) / 10000000;

      // 위치 정보 업데이트
      setSelectedLocation({ lat: latitude, lng: longitude });
      setMarker({ lat: latitude, lng: longitude });
      setChosenPlace(place);
      setCurrentZoom(17);

      // 이미지 검색
      const title = place.title.replace(/<[^>]*>/g, "");
      setImageLoading(true);
      setPlaceImage(null);

      try {
        const response = await axiosInstance.get("/naver-map/place-images", {
          params: { query: title },
          headers: { "Content-Type": "application/json" },
        });

        if (response.data && response.data.success && response.data.bestMatch) {
          setPlaceImage(response.data.bestMatch);
        } else {
          setPlaceImage({ imageUrl: null, thumbnailUrl: null });
        }
      } catch (err) {
        console.error("이미지 검색 오류:", err);
        setPlaceImage({ imageUrl: null, thumbnailUrl: null });
      } finally {
        setImageLoading(false);
      }
    },
    [
      setSelectedLocation,
      setMarker,
      setChosenPlace,
      setCurrentZoom,
      setImageLoading,
      setPlaceImage,
    ]
  );

  // Enter 키 입력 시 검색 실행
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // 확인 버튼 클릭 핸들러 – 선택된 결과를 부모에 전달하고 dialog 닫기
  const handleConfirm = useCallback(() => {
    if (chosenPlace) {
      const latitude = parseFloat(chosenPlace.mapy) / 10000000;
      const longitude = parseFloat(chosenPlace.mapx) / 10000000;

      // 백엔드에서 제공된 이미지만 사용
      onSelectPlace({
        title: chosenPlace.title.replace(/<[^>]*>/g, ""),
        address: chosenPlace.address,
        latitude,
        longitude,
        category: chosenPlace.category,
        // thumbnailUrl이 있는 경우에만 전달
        ...(placeImage?.thumbnailUrl && {
          thumbnailUrl: placeImage.thumbnailUrl,
        }),
        ...(placeImage?.imageUrl && { imageUrl: placeImage.imageUrl }),
      });
    }
    onClose();
  }, [chosenPlace, onClose, onSelectPlace, placeImage]);

  // 닫기 버튼 핸들러
  const handleClose = useCallback(() => {
    // 상세 정보 초기화
    setChosenPlace(null);
    setPlaceImage(null);
    setImageLoading(false);
    setSearchResults([]);
    setSearchQuery("");

    // 부모 컴포넌트의 onClose 호출
    onClose();
  }, [onClose]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { margin: 0, borderRadius: 0 } }}
    >
      {/* 지도 배경 */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          // 드로어가 열려있을 때만 left 위치 조정, 닫힐 때는 위치 조정 없음
          transition: "left 0.3s ease", // 부드러운 전환 효과
          ...(drawerOpen && {
            left: 350,
            width: "calc(100% - 350px)",
          }),
        }}
      >
        <NaverMap
          key={`map-${selectedLocation?.lat}-${selectedLocation?.lng}-${currentZoom}`}
          width="100%"
          height="100%"
          lat={selectedLocation?.lat ?? lat}
          lng={selectedLocation?.lng ?? lng}
          zoom={currentZoom}
          interactive
          markerPosition={marker}
        />
      </Box>

      {/* 닫기 버튼 */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          zIndex: 1200,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 1)",
          },
        }}
      >
        <CloseRoundedIcon />
      </IconButton>

      {/* 토글 버튼 */}
      <Box
        onClick={() => setDrawerOpen((prev) => !prev)}
        sx={{
          position: "absolute",
          top: "50%",
          left: drawerOpen ? DRAWER_WIDTH : 0,
          transform: "translateY(-50%)",
          zIndex: 1300,
          width: 24,
          height: 48,
          bgcolor: "white",
          borderRadius: "0, 15px 15px 0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "left 0.2s ease",
          "&:hover": {
            bgcolor: "#f5f5f5",
          },
        }}
      >
        {drawerOpen ? (
          <ChevronLeftIcon fontSize="medium" />
        ) : (
          <ChevronRightIcon fontSize="medium" />
        )}
      </Box>

      {/* 검색 패널 */}
      <Drawer
        open={drawerOpen}
        variant="persistent"
        anchor="left"
        PaperProps={{
          sx: { width: 350, backgroundColor: "rgba(255,255,255,0.95)" },
        }}
      >
        <Box p={2}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder="장소를 검색하세요"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
            />
          </Stack>

          {isLoading ? (
            <Box textAlign="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" p={2}>
              {error}
            </Typography>
          ) : searchResults.length > 0 ? (
            <List>
              {searchResults.map((place, i) => (
                <Box key={i}>
                  <ListItemButton onClick={() => handleSelectPlace(place)}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PlaceIcon fontSize="small" color="primary" />
                        <Typography fontWeight="bold">
                          {place.title.replace(/<[^>]*>/g, "")}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {place.address}
                      </Typography>
                      {place.category && (
                        <Typography variant="caption" color="text.secondary">
                          {place.category}
                        </Typography>
                      )}
                    </Stack>
                  </ListItemButton>
                  <Divider />
                </Box>
              ))}
            </List>
          ) : (
            <Box p={3} textAlign="center">
              <Typography color="text.secondary">
                {searchQuery ? "검색 결과가 없습니다." : ""}
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* 바텀 상세정보 + 확인 버튼 */}
      {chosenPlace && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: drawerOpen ? 350 : 0,
            right: 0,
            bgcolor: "rgba(255,255,255,0.98)",
            p: 0,
            zIndex: 1100,
            boxShadow: 3,
            maxHeight: "40%", // 최대 높이 제한
            overflowY: "auto", // 내용이 많은 경우 스크롤 가능
          }}
        >
          {/* 헤더 부분 - 장소명 등 */}
          <Box sx={{ p: 2, pb: 1.5 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {/* 이미지 */}
              {imageLoading ? (
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "action.hover",
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              ) : placeImage?.thumbnailUrl ? (
                <Box
                  component="img"
                  src={placeImage.thumbnailUrl}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    objectFit: "cover",
                  }}
                />
              ) : null}

              {/* 메인 정보 영역 */}
              <Box flex={1}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {chosenPlace.title.replace(/<[^>]*>/g, "")}
                </Typography>

                {/* 카테고리 정보 */}
                {chosenPlace.category && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={0.5}
                  >
                    <CategoryIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {chosenPlace.category}
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* 확인 버튼 */}
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={imageLoading}
              >
                확인
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* 상세 정보 영역 */}
          <Box sx={{ p: 2, pt: 1.5 }}>
            {/* 주소 정보 */}
            {chosenPlace.address && (
              <Stack direction="row" spacing={1.5} mb={1.5}>
                <LocationOnIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {chosenPlace.address}
                  </Typography>
                </Box>
              </Stack>
            )}

            {/* 전화번호 정보 */}
            {chosenPlace.telephone && (
              <Stack direction="row" spacing={1.5} mb={1.5}>
                <PhoneIcon color="action" />
                <Link
                  href={`tel:${chosenPlace.telephone}`}
                  variant="body2"
                  underline="hover"
                  color="text.primary"
                >
                  {chosenPlace.telephone}
                </Link>
              </Stack>
            )}

            {/* 웹사이트 정보 */}
            {chosenPlace.link && (
              <Stack direction="row" spacing={1.5} mb={1.5}>
                <LanguageIcon color="action" />
                <Link
                  href={chosenPlace.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  underline="hover"
                  color="text.primary"
                  sx={{
                    maxWidth: "80%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {chosenPlace.link}
                  <OpenInNewIcon
                    fontSize="inherit"
                    sx={{
                      fontSize: "0.9rem",
                      ml: 0.5,
                      verticalAlign: "middle",
                    }}
                  />
                </Link>
              </Stack>
            )}

            {/* 설명 정보 */}
            {chosenPlace.description && (
              <Typography
                variant="body2"
                paragraph
                mt={1}
                color="text.secondary"
              >
                {chosenPlace.description}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Dialog>
  );
};

export default FullScreenMapDialog;
