import { Box, Stack, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useRef, useState } from "react";
import CommunityPostItem from "../components/CommunityPostItem";
import SearchBox from "../components/SearchBox";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useNavigate } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";

// 이미지 파일들
import seoulImg from "../assets/images/seoul.jpg";
import busanImg from "../assets/images/busan.jpg";
import gangneungImg from "../assets/images/gangneung.jpg";
import incheonImg from "../assets/images/incheon.jpg";
import gyeongjuImg from "../assets/images/gyeongju.jpg";
import jejuImg from "../assets/images/jeju.jpg";
import sokchoImg from "../assets/images/sokcho.jpg";
import yeosuImg from "../assets/images/yeosu.jpg";
import PopularTemplates from "../components/PopularTemplates";

// 임시 인기 게시글 데이터
const dummyPopularTemplates: PopularTemplateData[] = [
  {
    id: "1",
    bgColor: "#76B6FF",
    label: "파워J를 위한 일본 여행 완벽 플래너",
    author: "고유로",
    likes: 12,
    shares: 3,
    comments: 5,
  },
  {
    id: "2",
    bgColor: "#FFF0A7",
    label: "감성 가득 오사카 2박 3일",
    author: "여행러버",
    likes: 8,
    shares: 2,
    comments: 1,
  },
  {
    id: "3",
    bgColor: "#FFB7E4",
    label: "도쿄 핵심 맛집 투어",
    author: "맛집헌터",
    likes: 20,
    shares: 7,
    comments: 10,
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    label: "벚꽃 시즌 교토 산책",
    author: "벚꽃소녀",
    likes: 15,
    shares: 4,
    comments: 2,
  },
];

// 지역 이미지 데이터 타입 정의
type RegionImage = {
  name: string;
  imgSrc: string;
};

// 지역 이미지 데이터
const regionImages: RegionImage[] = [
  { name: "서울", imgSrc: seoulImg },
  { name: "부산", imgSrc: busanImg },
  { name: "강릉", imgSrc: gangneungImg },
  { name: "인천", imgSrc: incheonImg },
  { name: "경주", imgSrc: gyeongjuImg },
  { name: "제주", imgSrc: jejuImg },
  { name: "속초", imgSrc: sokchoImg },
  { name: "여수", imgSrc: yeosuImg },
];

// 게시글 데이터
export const temporaryPosts = [
  {
    id: "1",
    imgbg: "#f3e5f5",
    title:
      "일본여행의 진심만을 담은 '유튜버 허니'의 계획은? 3박 4일로 완벽 일본 여행!",
    hashtags: ["일본", "단기여행", "행복", "유튜버"],
    likes: 132,
    comments: 3,
    shares: 23,
  },
  {
    id: "2",
    imgbg: "#f0f4c3",
    title: "일본으로 2박 여행 가볼래?",
    hashtags: ["일본", "해외여행", "강추"],
    likes: 312,
    comments: 5,
    shares: 3,
  },
  {
    id: "3",
    imgbg: "#bbdefb",
    title: "연인끼리 추억 쌓기 (당일치기)",
    hashtags: ["연인", "단기여행", "힐링", "즐거운", "시원한"],
    likes: 1322,
    comments: 3,
    shares: 23,
  },
  {
    id: "4",
    imgbg: "#eeeeee",
    title: "국내 맛집 여행",
    hashtags: ["국내여행", "맛집", "전국", "힐링"],
    likes: 411,
    comments: 2,
    shares: 11,
  },
];

const useHorizontalScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Constants for item width and margin
  const ITEM_WIDTH = 200; // Width of each item in pixels
  const ITEM_MARGIN = 16; // Margin between items in pixels

  const scrollAmount = 3 * (ITEM_WIDTH + ITEM_MARGIN); // Total scroll amount for 3 items
  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return {
    scrollRef,
    handleScrollLeft: () => handleScroll("left"),
    handleScrollRight: () => handleScroll("right"),
  };
};

const Community = () => {
  const { scrollRef, handleScrollLeft, handleScrollRight } =
    useHorizontalScroll();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // sm 이하: 모바일
  const pageGroupSize = isMobile ? 5 : 8;

  // 페이지네이션을 위한 현재 페이지 상태 정의
  const [currentPage, setCurrentPage] = useState(1);

  // 실제 게시글 수에 따라 동적으로 계산 해야되는 부분
  const totalPages = 20;

  // 페이지 변경 핸들러 함수
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value); // 현재 페이지 상태 업데이트
    console.log("페이지 변경됨: ", value);
  };

  // regionTags를 regionImages에서 자동으로 생성
  const regionTags = regionImages.map((region) => region.name);

  // 검색 실행 핸들러
  const handleSearch = (selectedTags: string[], inputValue: string) => {
    // 검색 실행 시 선택된 태그와 현재 입력된 텍스트를 조합하여 사용
    const fullSearchTerm =
      selectedTags.map((tag) => `#${tag}`).join(" ") +
      (inputValue.trim() ? ` ${inputValue.trim()}` : "");
    console.log("검색 실행 (전체 검색어):", fullSearchTerm.trim());
    // 여기에 실제 검색 로직 구현 (예: API 호출, 데이터 필터링 등)
  };

  // 게시글 클릭 핸들러
  const handlePostClick = (postId: string) => {
    navigate(`/community/post/${postId}`);
  };

  const scrollButtonStyles = {
    position: "absolute",
    zIndex: 2,
    background: "rgba(255,255,255)",
    boxShadow: 1,
    "&:hover": { background: "rgba(255,255,255)" },
  };

  return (
    <Stack mt={4} gap={8}>
      {/* 인기 게시글  */}
      <Stack gap={4}>
        <Typography variant="h5">인기 템플릿</Typography>
        {/* 임시 데이터로 PopularTemplates 컴포넌트 렌더링 */}
        <PopularTemplates
          maxCards={3}
          type="post"
          data={dummyPopularTemplates}
        />
      </Stack>

      {/* 여행 카테고리 섹션  */}
      <Stack gap={4}>
        {/* 섹션 제목 */}
        <Typography variant="h5" fontWeight={700}>
          여행 카테고리
        </Typography>

        <Box
          sx={{ position: "relative", display: "flex", alignItems: "center" }}
        >
          {/* 왼쪽 버튼 */}
          <IconButton
            onClick={handleScrollLeft}
            sx={{
              ...scrollButtonStyles,
              left: 0,
              transform: "translateX(-50%) translateY(-40%)",
            }}
          >
            <ArrowBackIosNewRoundedIcon />
          </IconButton>

          <Stack
            ref={scrollRef}
            direction="row"
            gap={3}
            sx={{
              overflowX: "auto",
              py: 1,
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {regionImages.map((category) => (
              <Stack key={category.name} gap={1.1}>
                <Stack
                  direction="column"
                  spacing={1}
                  sx={{
                    flexShrink: 0,
                    width: 280,
                    height: 280,
                    borderRadius: 8,
                    boxShadow: 5,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: 280,
                      borderRadius: 8,
                      border: "1px solid #B7B7B7",
                      overflow: "hidden",
                      cursor: "pointer",
                      backgroundImage: `url(${category.imgSrc})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></Box>
                </Stack>

                {/* 지역 이름  */}
                <Typography
                  variant="body1"
                  fontWeight={400}
                  fontSize={"1.2em"}
                  color="text.primary"
                  textAlign="left"
                  ml={2.5}
                >
                  {category.name}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* 오른쪽 버튼 */}
          <IconButton
            onClick={handleScrollRight}
            sx={{
              ...scrollButtonStyles,
              right: 0,
              transform: "translateX(50%) translateY(-40%)",
            }}
          >
            <ArrowForwardIosRoundedIcon />
          </IconButton>
        </Box>
      </Stack>

      {/* 일반 게시판 */}
      <Box sx={{ position: "relative" }}>
        {/* 섹션 제목 */}
        <Typography
          variant="h5"
          fontWeight={700}
          height="3em"
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          일반 게시판
        </Typography>

        {/* 검색 컴포넌트 */}
        <SearchBox regionTags={regionTags} onSearch={handleSearch} />
        {/* Chip이 많아질 때도 게시판과 겹치지 않도록 여백 추가 */}
        <Box sx={{ height: 32 }} />

        {/* 일반 게시판 목록  */}
        <Stack spacing={2} sx={{ mt: 4 }}>
          {temporaryPosts.map((post) => (
            <CommunityPostItem
              key={post.id}
              post={post}
              onClick={() => handlePostClick(post.id)}
            />
          ))}
        </Stack>

        {/* 게시판 번호  */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 4,
            mb: { xs: 30, md: 6 },
            gap: 1,
          }}
        >
          {/* 이전 그룹 버튼 */}
          <IconButton
            onClick={() => {
              // 이전 그룹의 마지막 페이지를 선택
              const prevGroupStart = Math.max(
                1,
                Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize -
                  (pageGroupSize - 1)
              );
              const prevGroupEnd = prevGroupStart + pageGroupSize - 1;
              setCurrentPage(Math.min(prevGroupEnd, totalPages));
            }}
            disabled={currentPage <= pageGroupSize}
          >
            <ArrowBackIosNewRoundedIcon />
          </IconButton>

          {/* 페이지 번호 그룹 */}
          {Array.from({ length: pageGroupSize }, (_, i) => {
            const pageNum =
              Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize +
              i +
              1;
            if (pageNum > totalPages) return null;
            return (
              <IconButton
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor:
                    currentPage === pageNum ? "#e0e0e0" : "transparent",
                  color: currentPage === pageNum ? "#000" : "#aaa",
                  fontWeight: currentPage === pageNum ? 700 : 400,
                  fontSize: "1.1em",
                  borderRadius: "50%",
                }}
              >
                {pageNum}
              </IconButton>
            );
          })}

          {/* 다음 그룹 버튼 */}
          <IconButton
            onClick={() => {
              // 다음 그룹의 첫 번째 페이지를 선택
              const nextGroupStart = Math.min(
                totalPages,
                Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize +
                  pageGroupSize +
                  1
              );
              setCurrentPage(nextGroupStart);
            }}
            disabled={
              Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize +
                pageGroupSize +
                1 >
              totalPages
            }
          >
            <ArrowForwardIosRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 스크롤 맨 위로 이동 버튼 */}
      <ScrollToTopButton />
    </Stack>
  );
};

export default Community;
