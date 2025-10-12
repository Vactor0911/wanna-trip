import {
  Dialog,
  IconButton,
  Box,
  Paper,
  Stack,
  Typography,
  List,
  ListItem,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Tooltip from "./Tooltip";
import { useCallback, useMemo, useState, useEffect } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import RoomRoundedIcon from '@mui/icons-material/RoomRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NaverMap from "./naver_map/NaverMap";
import { useAtom } from "jotai";
import { templateAtom } from "../state/template";
import { stripHtml } from "../utils";

interface TemplateMapDialogProps {
  open: boolean;
  onClose: () => void;
}

// 상수 정의
const DAY_COLORS = [
  '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f',
  '#00796b', '#5d4037', '#455a64', '#e91e63', '#ff9800',
  '#795548', '#607d8b', '#ff5722', '#9c27b0', '#3f51b5'
];

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

const TemplateMapDialog = ({ open, onClose }: TemplateMapDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [template] = useAtom(templateAtom);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    title: string;
    address: string;
    dayNumber: number;
    startTime: string;
    endTime: string;
    content: string;
  } | null>(null);
  const [showAllLocations, setShowAllLocations] = useState<boolean>(true);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showMobilePanel, setShowMobilePanel] = useState<boolean>(false);

  // 일차별 색상 함수
  const getDayColor = useCallback((dayNumber: number) => {
    return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
  }, []);

  // 모든 위치 정보 수집
  const allLocations = useMemo(() => {
    const locations: Array<{
      lat: number;
      lng: number;
      title: string;
      address: string;
      dayNumber: number;
      startTime: string;
      endTime: string;
      content: string;
    }> = [];

    template.boards.forEach((board) => {
      board.cards.forEach((card) => {
        if (card.location?.latitude !== undefined && 
            card.location?.longitude !== undefined &&
            card.location?.title !== undefined &&
            card.location?.address !== undefined) {
          locations.push({
            lat: card.location.latitude,
            lng: card.location.longitude,
            title: card.location.title,
            address: card.location.address,
            dayNumber: board.dayNumber ?? 1,
            startTime: card.startTime.format("HH:mm"),
            endTime: card.endTime.format("HH:mm"),
            content: card.content,
          });
        }
      });
    });

    return locations;
  }, [template.boards]);

  // 선택된 일차의 위치들
  const selectedDayLocations = useMemo(() => {
    if (!selectedDay) return [];
    return allLocations.filter(loc => loc.dayNumber === selectedDay);
  }, [allLocations, selectedDay]);

  // 표시할 마커 데이터
  const displayMarkers = useMemo(() => {
    const locationsToShow = showAllLocations 
      ? allLocations 
      : selectedLocation 
        ? allLocations.filter(loc => loc.dayNumber === selectedLocation.dayNumber)
        : selectedDayLocations;
    
    return locationsToShow
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((location, index) => ({
        lat: location.lat,
        lng: location.lng,
        title: location.title,
        color: getDayColor(location.dayNumber),
        label: showAllLocations ? location.dayNumber.toString() : (index + 1).toString(),
      }));
  }, [selectedLocation, selectedDayLocations, allLocations, showAllLocations, getDayColor]);

  // 연결선 데이터 생성
  const displayPolylines = useMemo(() => {
    const createPolyline = (locations: typeof allLocations, dayNumber: number) => {
      if (locations.length < 2) return null;
      
      const sortedLocations = [...locations].sort((a, b) => a.startTime.localeCompare(b.startTime));
      return {
        path: sortedLocations.map(location => ({ lat: location.lat, lng: location.lng })),
        color: getDayColor(dayNumber),
        weight: 3,
        opacity: 0.8
      };
    };

    if (showAllLocations) {
      const groupedByDay = allLocations.reduce((acc, location) => {
        if (!acc[location.dayNumber]) {
          acc[location.dayNumber] = [];
        }
        acc[location.dayNumber].push(location);
        return acc;
      }, {} as { [key: number]: typeof allLocations });

      return Object.entries(groupedByDay)
        .map(([dayNumber, locations]) => createPolyline(locations, parseInt(dayNumber)))
        .filter((polyline): polyline is NonNullable<typeof polyline> => polyline !== null);
    } else {
      const locationsToShow = selectedLocation 
        ? allLocations.filter(loc => loc.dayNumber === selectedLocation.dayNumber)
        : selectedDayLocations;
      
      const polyline = createPolyline(locationsToShow, locationsToShow[0]?.dayNumber || 1);
      return polyline ? [polyline] : [];
    }
  }, [selectedLocation, selectedDayLocations, allLocations, getDayColor, showAllLocations]);

  // 지도 중심점 계산
  const mapCenter = useMemo(() => {
    const calculateCenter = (locations: typeof allLocations) => {
      if (locations.length === 0) return DEFAULT_CENTER;
      if (locations.length === 1) return { lat: locations[0].lat, lng: locations[0].lng };
      
      const lats = locations.map(loc => loc.lat);
      const lngs = locations.map(loc => loc.lng);
      
      return {
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
      };
    };

    if (selectedLocation) {
      return { lat: selectedLocation.lat, lng: selectedLocation.lng };
    }
    
    const locationsToShow = showAllLocations ? allLocations : selectedDayLocations;
    return calculateCenter(locationsToShow);
  }, [selectedDayLocations, selectedLocation, showAllLocations, allLocations]);

  // 줌 레벨 계산
  const mapZoom = useMemo(() => {
    const calculateZoom = (locations: typeof allLocations) => {
      if (locations.length === 0) return 15;
      if (locations.length === 1) return 17;
      
      const lats = locations.map(loc => loc.lat);
      const lngs = locations.map(loc => loc.lng);
      
      const latDiff = Math.max(...lats) - Math.min(...lats);
      const lngDiff = Math.max(...lngs) - Math.min(...lngs);
      const maxDiff = Math.max(latDiff, lngDiff) + 0.002;
      
      if (maxDiff < 0.001) return 18;
      if (maxDiff < 0.003) return 17;
      if (maxDiff < 0.008) return 16;
      if (maxDiff < 0.015) return 15;
      if (maxDiff < 0.03) return 14;
      if (maxDiff < 0.06) return 13;
      if (maxDiff < 0.12) return 12;
      if (maxDiff < 0.25) return 11;
      if (maxDiff < 0.5) return 10;
      if (maxDiff < 1.0) return 9;
      if (maxDiff < 2.0) return 8;
      if (maxDiff < 4.0) return 7;
      return 7;
    };

    if (selectedLocation) {
      return 17;
    }
    
    const locationsToShow = showAllLocations ? allLocations : selectedDayLocations;
    return calculateZoom(locationsToShow);
  }, [selectedDayLocations, selectedLocation, showAllLocations, allLocations]);

  // 일정별로 그룹화
  const scheduleByDay = useMemo(() => {
    const grouped: { [key: number]: typeof allLocations } = {};
    
    allLocations.forEach((location) => {
      if (!grouped[location.dayNumber]) {
        grouped[location.dayNumber] = [];
      }
      grouped[location.dayNumber].push(location);
    });

    Object.values(grouped).forEach(locations => {
      locations.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [allLocations]);

  // 이벤트 핸들러들
  const handleClose = useCallback(() => onClose(), [onClose]);

  const handleDayClick = useCallback((dayNumber: number) => {
    setSelectedDay(dayNumber);
    setSelectedLocation(null);
    setShowAllLocations(false);
  }, []);

  const handleLocationClick = useCallback((location: typeof allLocations[0], event?: React.MouseEvent) => {
    event?.stopPropagation();
    setSelectedLocation(location);
    setSelectedDay(location.dayNumber);
    setShowAllLocations(false);
  }, []);

  const handleMarkerClick = useCallback((marker: { lat: number; lng: number; title?: string }) => {
    const matchingLocation = allLocations.find(location => 
      location.lat === marker.lat && location.lng === marker.lng
    );

    if (matchingLocation) {
      setSelectedLocation(matchingLocation);
      setSelectedDay(matchingLocation.dayNumber);
      setShowAllLocations(false);
    }
  }, [allLocations]);

  const handleToggleAllLocations = useCallback(() => {
    // 전체보기가 아닐 때만 전체보기로 전환
    if (!showAllLocations) {
      setShowAllLocations(true);
      setSelectedDay(null);
      setSelectedLocation(null);
    }
  }, [showAllLocations]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 0);
  }, []);

  const handleToggleMobilePanel = useCallback(() => {
    setShowMobilePanel(prev => !prev);
  }, []);

  // 모바일 패널 높이 계산
  const getMobilePanelHeight = useCallback(() => {
    if (isSmallMobile) {
      return "min(45vh, 350px)"; // 작은 모바일: 45% 또는 최대 350px
    } else if (isMobile) {
      return "min(45vh, 400px)"; // 일반 모바일: 45% 또는 최대 400px
    }
    return "min(45vh, 400px)";
  }, [isMobile, isSmallMobile]);

  // 초기 상태 설정
  useEffect(() => {
    if (open) {
      setShowAllLocations(true);
      setSelectedDay(null);
      setSelectedLocation(null);
      setIsScrolled(false);
      setShowMobilePanel(false);
    }
  }, [open]);

  // 화면 크기 변경 시 모바일 패널 자동 조정
  useEffect(() => {
    if (!isMobile && showMobilePanel) {
      setShowMobilePanel(false);
    }
  }, [isMobile, showMobilePanel]);

  // 일정 리스트 렌더링 함수
  const renderScheduleList = useCallback(() => {
    if (Object.keys(scheduleByDay).length === 0 || (!showAllLocations && selectedDay && !selectedDayLocations.length)) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
            color: "text.secondary",
          }}
        >
          <PlaceOutlinedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="body1">
            {Object.keys(scheduleByDay).length === 0 
              ? "등록된 장소가 없습니다" 
              : `${selectedDay}일차에 등록된 장소가 없습니다`}
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={2}>
        {/* 1일차 우선 표시 */}
        {scheduleByDay[1] && (
          <Paper 
            elevation={selectedDay === 1 && !showAllLocations ? 3 : 1} 
            sx={{ 
              p: 2, 
              border: selectedDay === 1 && !showAllLocations ? `2px solid ${getDayColor(1)}` : "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                elevation: 4,
                transform: "translateY(-2px)",
              }
            }}
            onClick={() => handleDayClick(1)}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Chip
                label="1일차"
                size="small"
                sx={{
                  backgroundColor: getDayColor(1),
                  color: "white",
                  "&:hover": {
                    backgroundColor: getDayColor(1),
                    opacity: 0.8,
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {scheduleByDay[1].length}개 장소
              </Typography>
            </Stack>
            
            <List dense>
              {scheduleByDay[1].map((location, index) => (
                <ListItem 
                  key={`${location.lat}-${location.lng}-${index}`} 
                  sx={{ 
                    px: 0.5, 
                    py: 1.5,
                    cursor: "pointer",
                    borderRadius: 1,
                    backgroundColor: selectedLocation?.lat === location.lat && selectedLocation?.lng === location.lng && !showAllLocations
                      ? `${getDayColor(1)}20` 
                      : "transparent",
                    "&:hover": {
                      backgroundColor: `${getDayColor(1)}10`,
                    },
                    borderBottom: index < scheduleByDay[1].length - 1 ? "1px solid #e0e0e0" : "none"
                  }}
                  onClick={(event) => handleLocationClick(location, event)}
                >
                  <Stack sx={{ width: "100%" }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <ScheduleRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="medium">
                        {location.startTime} ~ {location.endTime}
                      </Typography>
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ wordBreak: "break-word" }}
                      >
                        {stripHtml(location.title)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ wordBreak: "break-word" }}
                      >
                        {location.address}
                      </Typography>
                      {location.content && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {stripHtml(location.content)}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* 나머지 일차들 */}
        {Object.entries(scheduleByDay)
          .filter(([dayNumber]) => parseInt(dayNumber) !== 1)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([dayNumber, locations]) => {
            const dayNum = parseInt(dayNumber);
            const isSelected = selectedDay === dayNum;
            const dayColor = getDayColor(dayNum);
            return (
              <Paper 
                key={dayNumber} 
                elevation={isSelected && !showAllLocations ? 3 : 1} 
                sx={{ 
                  p: 2,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isSelected && !showAllLocations ? `2px solid ${dayColor}` : "none",
                  "&:hover": {
                    elevation: 4,
                    transform: "translateY(-2px)",
                  }
                }}
                onClick={() => handleDayClick(dayNum)}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Chip
                    label={`${dayNumber}일차`}
                    size="small"
                    sx={{
                      backgroundColor: dayColor,
                      color: "white",
                      "&:hover": {
                        backgroundColor: dayColor,
                        opacity: 0.8,
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {locations.length}개 장소
                  </Typography>
                </Stack>
              
              <List dense>
                {locations.map((location, index) => (
                  <ListItem 
                    key={`${location.lat}-${location.lng}-${index}`} 
                    sx={{ 
                      px: 0.5, 
                      py: 1.5,
                      cursor: "pointer",
                      borderRadius: 1,
                      backgroundColor: selectedLocation?.lat === location.lat && selectedLocation?.lng === location.lng && !showAllLocations
                        ? `${dayColor}20` 
                        : "transparent",
                      "&:hover": {
                        backgroundColor: `${dayColor}10`,
                      },
                      borderBottom: index < locations.length - 1 ? "1px solid #e0e0e0" : "none"
                    }}
                    onClick={(event) => handleLocationClick(location, event)}
                  >
                    <Stack sx={{ width: "100%" }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <ScheduleRoundedIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="medium">
                          {location.startTime} ~ {location.endTime}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {stripHtml(location.title)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {location.address}
                        </Typography>
                        {location.content && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ wordBreak: "break-word" }}
                          >
                            {stripHtml(location.content)}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </Paper>
            );
          })}
      </Stack>
    );
  }, [scheduleByDay, showAllLocations, selectedDay, selectedDayLocations, selectedLocation, getDayColor, handleDayClick, handleLocationClick]);

  return (
    <Dialog 
      fullScreen={isMobile} 
      open={open} 
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: isMobile ? "100vh" : "90vh",
          maxHeight: isMobile ? "100vh" : "90vh",
          margin: isMobile ? 0 : "auto",
          borderRadius: isMobile ? 0 : undefined,
        }
      }}
    >
      <Box sx={{ 
        display: "flex", 
        height: isMobile ? "100vh" : "100%", 
        overflow: "hidden",
        width: isMobile ? "100vw" : "100%",
      }}>
        {/* 좌측 일정 리스트 (데스크톱) */}
        <Box
          sx={{
            width: { xs: "100%", md: "400px" },
            minWidth: { xs: "100%", md: "400px" },
            height: "100%",
            overflow: "auto",
            backgroundColor: "#fafafa",
            borderRight: { xs: "none", md: `1px solid ${theme.palette.divider}` },
            position: "relative",
            display: { xs: "none", md: "block" },
          }}
          onScroll={handleScroll}
        >
          {/* 헤더 */}
          <Box 
            sx={{ 
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: "#fafafa",
              p: 2,
              pb: 1,
              boxShadow: isScrolled ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              transition: "box-shadow 0.2s ease",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h5" fontWeight="bold">
                  일정 지도
                </Typography>
                <Tooltip title={showAllLocations ? "전체보기 중" : "전체보기"}>
                  <span>
                    <IconButton 
                      onClick={handleToggleAllLocations}
                      size="small"
                      disabled={showAllLocations}
                      sx={{
                        color: showAllLocations ? theme.palette.primary.main : theme.palette.text.secondary,
                        '&:hover': {
                          color: showAllLocations ? theme.palette.primary.main : theme.palette.text.primary,
                          backgroundColor: 'transparent',
                        },
                        '&:focus': {
                          backgroundColor: 'transparent',
                        },
                        '&.Mui-disabled': {
                          color: theme.palette.primary.main,
                          opacity: 0.7,
                        }
                      }}
                    >
                      <RoomRoundedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Tooltip title="닫기">
                <IconButton 
                  onClick={handleClose} 
                  size="small"
                  sx={{
                    '&:focus': {
                      backgroundColor: 'transparent',
                    }
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* 스크롤 가능한 콘텐츠 */}
          <Box sx={{ p: 2, pt: 1 }}>

            {renderScheduleList()}
          </Box>
        </Box>

        {/* 우측 지도 */}
        <Box
          sx={{
            flex: 1,
            height: isMobile ? "100vh" : "100%",
            position: "relative",
            display: { xs: "block", md: "block" },
            width: isMobile ? "100vw" : "auto",
          }}
        >
          {/* 모바일 헤더 */}
          {isMobile && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1001,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                p: 2,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
              }}
            >
              <Stack direction="row" spacing={1}>
                <Tooltip title="메뉴">
                  <IconButton
                    onClick={handleToggleMobilePanel}
                    size="small"
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.7)",
                      },
                    }}
                  >
                    <MenuRoundedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="닫기">
                  <IconButton
                    onClick={handleClose}
                    size="small"
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.7)",
                      },
                    }}
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          )}

          <NaverMap
            width={isMobile ? "100vw" : "100%"}
            height={isMobile ? "100vh" : "100%"}
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            zoom={mapZoom}
            interactive={true}
            markers={displayMarkers}
            polylines={displayPolylines}
            onMarkerClick={handleMarkerClick}
          />
        </Box>

      </Box>

      {/* 모바일 하단 패널 */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: showMobilePanel ? getMobilePanelHeight() : "0",
            maxHeight: isSmallMobile ? "50vh" : "55vh",
            backgroundColor: "#fafafa",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
            overflow: "hidden",
            transition: "height 0.3s ease-in-out",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {showMobilePanel && (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {/* 모바일 패널 헤더 */}
              <Box
                sx={{
                  p: 2,
                  pb: 1,
                  borderBottom: "1px solid #e0e0e0",
                  flexShrink: 0,
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" fontWeight="bold">
                      일정 지도
                    </Typography>
                    <Tooltip title={showAllLocations ? "전체보기 중" : "전체보기"}>
                      <span>
                        <IconButton 
                          onClick={handleToggleAllLocations}
                          size="small"
                          disabled={showAllLocations}
                          sx={{
                            color: showAllLocations ? theme.palette.primary.main : theme.palette.text.secondary,
                            '&:hover': {
                              color: showAllLocations ? theme.palette.primary.main : theme.palette.text.primary,
                              backgroundColor: 'transparent',
                            },
                            '&:focus': {
                              backgroundColor: 'transparent',
                            },
                            '&.Mui-disabled': {
                              color: theme.palette.primary.main,
                              opacity: 0.7,
                            }
                          }}
                        >
                          <RoomRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                  <Tooltip title="닫기">
                    <IconButton 
                      onClick={() => setShowMobilePanel(false)}
                      size="small"
                      sx={{
                        '&:focus': {
                          backgroundColor: 'transparent',
                        }
                      }}
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* 모바일 패널 콘텐츠 */}
              <Box 
                sx={{ 
                  flex: 1, 
                  overflow: "auto", 
                  p: 2, 
                  pt: 1 
                }}
                onScroll={handleScroll}
              >
                {renderScheduleList()}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Dialog>
  );
};

export default TemplateMapDialog;