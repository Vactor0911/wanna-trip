import { Box, Stack, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useRef } from "react";
import CommunityPostItem from "../components/CommunityPostItem";
import SearchBox from "../components/SearchBox";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useNavigate } from "react-router-dom";

// 이미지 파일
import seoulImg from "../images/서울.jpg";
import busanImg from "../images/부산.jpg";
import gangneungImg from "../images/강릉.jpg";
import incheonImg from "../images/인천.jpg";
import gyeongjuImg from "../images/경주.jpg";
import jejuImg from "../images/제주.jpg";
import sokchoImg from "../images/속초.jpg";
import yeosuImg from "../images/여수.jpg";

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

  const regionTags = [
    "서울",
    "부산",
    "강릉",
    "인천",
    "경주",
    "제주",
    "속초",
    "여수",
  ];

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
    <Box sx={{ width: "100%", minHeight: "100vh", p: { xs: 2, sm: 3, md: 4 } }}>
      {/* 인기 게시글  */}
      <Box sx={{ mb: { xs: 4, sm: 6, md: 8 } }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          실시간 인기 게시글
        </Typography>
        <Box
          sx={{
            height: { xs: 180, sm: 250, md: 300 },
            bgcolor: "#e0e0e0",
            borderRadius: 2,
          }}
        ></Box>
      </Box>

      {/* 여행 카테고리 섹션  */}
      <Stack sx={{ mb: { xs: 4, sm: 6, md: 8 } }}>
        {/* 섹션 제목 */}
        <Typography variant="h5" fontWeight={700} mb={2}>
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
            {/* 각 여행 카테고리 항목 */}
            {[
              {
                name: "서울",
                imgSrc: seoulImg,
              },
              {
                name: "부산",
                imgSrc: busanImg,
              },
              {
                name: "강릉",
                imgSrc: gangneungImg,
              },
              {
                name: "인천",
                imgSrc: incheonImg,
              },
              {
                name: "경주",
                imgSrc: gyeongjuImg,
              },
              {
                name: "제주",
                imgSrc: jejuImg,
              },
              {
                name: "속초",
                imgSrc: sokchoImg,
              },
              {
                name: "여수",
                imgSrc: yeosuImg,
              },
            ].map((category) => (
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
      <Box sx={{ mt: { xs: 5, sm: 8, md: 10 }, mb: 2, position: "relative" }}>
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
      </Box>

      {/* 일반 게시판 목록  */}
      <Stack spacing={2}>
        {temporaryPosts.map((post) => (
          <CommunityPostItem
            key={post.id}
            post={post}
            onClick={() => handlePostClick(post.id)}
          />
        ))}
      </Stack>

      {/* 스크롤 맨 위로 이동 버튼 */}
      <ScrollToTopButton />
    </Box>
  );
};

export default Community;
