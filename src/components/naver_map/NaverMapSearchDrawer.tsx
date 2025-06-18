import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useCallback, useRef, useState } from "react";
import NaverMapSearchItem from "./NaverMapSearchItem";
import { useAtom, useSetAtom } from "jotai";
import {
  drawerOpenAtom,
  keywordAtom,
  markerPositionAtom,
  searchResultsAtom,
  selectedPositionAtom,
  zoomAtom,
} from "../../state/naverMapDialog";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import axiosInstance from "../../utils/axiosInstance";

const DRAWER_WIDTH = "350px"; // 드로어 메뉴 너비

const NaverMapSearchDrawer = () => {
  const [open, setOpen] = useAtom(drawerOpenAtom); // 검색창 드로어 메뉴 열림 상태
  const [keyword, setKeyword] = useAtom(keywordAtom); // 검색어 상태
  const searchInputRef = useRef<HTMLInputElement | null>(null); // 검색창 입력 참조
  const [searchResults, setSearchResults] = useAtom(searchResultsAtom); // 검색 결과 상태
  const [isLoading, setIsLoading] = useState(false); // 검색 로딩 상태
  const [isError, setIsError] = useState(false); // 검색 오류 상태
  const setSelectedPosition = useSetAtom(selectedPositionAtom); // 선택된 위치 상태
  const setMarker = useSetAtom(markerPositionAtom); // 마커 위치 상태
  const [zoom, setZoom] = useAtom(zoomAtom); // 현재 줌 레벨 상태
  const theme = useTheme(); // MUI 테마

  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 모바일 여부 확인

  // 드로어 메뉴 토글 버튼 클릭
  const handleToggleButtonClick = useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  // 드로어 메뉴 열기
  const handleDrawerOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  // 드로어 메뉴 닫기
  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  // 검색 실행 핸들러
  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;

    setIsLoading(true); // 검색 시작시 로딩 상태 설정

    try {
      // 장소 검색 API 호출
      const response = await axiosInstance.get("/naver-map/places", {
        params: {
          query: keyword,
          display: 15,
          start: 1,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data && response.data.items) {
        setSearchResults(response.data.items);

        // 결과가 있으면 첫번째 항목으로 지도 및 마커 업데이트
        const firstResult = response.data.items[0];
        const newLat = parseFloat(firstResult.mapy) / 10000000;
        const newLng = parseFloat(firstResult.mapx) / 10000000;
        setSelectedPosition({ lat: newLat, lng: newLng }); // 선택된 위치 업데이트
        setMarker({ lat: newLat, lng: newLng }); // 마커 위치 업데이트
        setZoom(zoom); // 현재 줌 레벨 유지
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("장소 검색 오류:", err);
      setSearchResults([]);
      setIsError(true); // 오류 상태 설정
    } finally {
      setIsLoading(false); // 검색 완료 후 로딩 상태 해제
    }
  }, [
    keyword,
    setMarker,
    setSearchResults,
    setSelectedPosition,
    setZoom,
    zoom,
  ]);

  // 검색어 입력
  const handleKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(event.target.value);
      setIsLoading(false); // 검색어 입력시 로딩 상태 초기화
      setIsError(false); // 검색어 입력시 오류 상태 초기화
    },
    [setKeyword]
  );

  // 검색창 키 입력시
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.ctrlKey && event.key === "a") {
        // Ctrl + A 입력시 검색창 전체 선택
        event.preventDefault();
        searchInputRef.current?.select();
      } else if (event.key === "Enter") {
        // Enter 키 입력시 검색 실행
        event.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  // 검색어 초기화
  const handleKeywordClear = useCallback(() => {
    setKeyword(""); // 검색어 상태 초기화
    setSearchResults([]); // 검색 결과 초기화
    setIsLoading(false); // 로딩 상태 초기화
    setIsError(false); // 오류 상태 초기화
  }, [setKeyword, setSearchResults]);

  if (isMobile) {
    return (
      <>
        {/* 검색창 */}
        <Box
          position="fixed"
          top={16}
          width={open ? "100%" : "calc(100% - 56px)"}
          px={8}
          pr="16px"
          zIndex={1010}
          sx={{
            transition: "width 0.2s ease-in-out",
          }}
        >
          <OutlinedInput
            ref={searchInputRef}
            fullWidth
            placeholder="장소를 검색하세요"
            value={keyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyDown}
            onClick={handleDrawerOpen}
            sx={{
              borderRadius: "50px",
              background: "white",
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleKeywordClear}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            }
          />
        </Box>

        {/* 드로어 닫기 버튼 */}
        <Paper
          sx={{
            position: "fixed",
            top: 27,
            left: 16,
            borderRadius: "50%",
            zIndex: 1010,
            opacity: open ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          <IconButton
            onClick={handleDrawerClose}
            sx={{
              padding: 0,
            }}
          >
            <ChevronLeftRoundedIcon fontSize="large" color="primary" />
          </IconButton>
        </Paper>

        {/* 검색 결과 드로어 메뉴 */}
        <Box position="fixed" top={0} left={0} width="100%" zIndex={1005}>
          <Collapse in={open} orientation="vertical">
            <Stack
              width="100vw"
              height="100vh"
              justifyContent="flex-end"
              sx={{
                background: "#f5f5f5",
              }}
            >
              {/* 검색 결과 컨테이너 */}
              <Stack
                height="calc(100vh - 88px)"
                paddingX={2}
                gap={1.5}
                sx={{
                  overflowY: "auto",
                }}
              >
                {searchResults.map((result, index) => (
                  <>
                  <NaverMapSearchItem
                    key={`naver-map-search-item-${index}`}
                    {...result} // result 객체의 모든 속성을 NaverMapSearchItem에 전달
                  />

                  <Divider key={`naver-map-divider-${index}`} />
                </>
                ))}
              </Stack>
            </Stack>
          </Collapse>
        </Box>
      </>
    );
  }

  return (
    <>
      {/* 검색 드로어 메뉴 */}
      <Drawer
        open={open}
        onClose={handleDrawerClose}
        anchor="left"
        variant="persistent"
      >
        <Stack
          position="relative"
          width={DRAWER_WIDTH}
          height="100vh"
          padding={2}
          gap={2}
        >
          {/* 검색창 */}
          <OutlinedInput
            ref={searchInputRef}
            fullWidth
            placeholder="장소를 검색하세요"
            value={keyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyDown}
            sx={{ borderRadius: "50px" }}
            startAdornment={
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleKeywordClear}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            }
          />

          <Stack
            gap={1.5}
            sx={{
              overflowY: "auto",
              height: "calc(100vh - 64px)", // 검색창 높이를 제외한 나머지 영역
            }}
          >
            {isError && (
              <Stack
                alignItems="center"
                justifyContent="center"
                gap={1}
                flex={1}
                pb="88px" // 검색창 높이를 제외한 나머지 영역
              >
                <WarningAmberRoundedIcon
                  sx={{
                    color: "text.secondary",
                    fontSize: "8rem",
                  }}
                />
                <Typography variant="h5" color="text.secondary">
                  검색 결과가 없습니다.
                </Typography>
              </Stack>
            )}
            {!isError &&
              isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <>
                  <Stack key={`naver-map-skeleton-${index}`} gap={0.5}>
                    <Skeleton variant="text" width="130px" height="32px" />
                    <Skeleton variant="text" width="200px" />
                    <Skeleton variant="text" width="100px" />
                  </Stack>

                  <Divider key={`naver-map-skeleton-divider-${index}`} />
                </>
              ))}
            {!isError &&
              !isLoading &&
              searchResults.map((result, index) => (
                <>
                  <NaverMapSearchItem
                    key={`naver-map-search-item-${index}`}
                    {...result} // result 객체의 모든 속성을 NaverMapSearchItem에 전달
                  />

                  <Divider key={`naver-map-divider-${index}`} />
                </>
              ))}
          </Stack>
        </Stack>
      </Drawer>

      {/* 토글 버튼 */}
      <Button
        sx={{
          display: "flex",
          position: "fixed",
          padding: "0",
          width: "24px",
          minWidth: "0",
          height: "48px",
          top: "50%",
          left: open ? DRAWER_WIDTH : 0,
          transform: "translateY(-50%)",
          background: "white",
          boxShadow: 3,
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
          zIndex: 1000,
          transition: "left 225ms cubic-bezier(0, 0, 0.2, 1);",
        }}
        onClick={handleToggleButtonClick}
      >
        {open ? (
          <ChevronLeftRoundedIcon fontSize="large" />
        ) : (
          <ChevronRightRoundedIcon fontSize="large" />
        )}
      </Button>
    </>
  );
};

export default NaverMapSearchDrawer;
