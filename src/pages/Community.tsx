import { Box, Stack, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useRef, useState, useEffect } from "react";
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

// 타입 정의 추가

type PopularTemplateData = {
  id: string;
  bgColor?: string;
  image?: string;
  label: string;
  author: string;
  likes: number;
  shares: number;
  comments: number;
};

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
  {
    id: "5",
    imgbg: "#f3e5f5",
    title:
      "일본여행의 진심만을 담은 '유튜버 허니'의 계획은? 3박 4일로 완벽 일본 여행!",
    hashtags: ["강릉", "단기여행", "행복", "유튜버"],
    likes: 132,
    comments: 3,
    shares: 23,
  },
  {
    id: "6",
    imgbg: "#f0f4c3",
    title: "일본으로 2박 여행 가볼래?",
    hashtags: ["일본", "해외여행", "강추"],
    likes: 312,
    comments: 5,
    shares: 3,
  },
  {
    id: "7",
    imgbg: "#bbdefb",
    title: "연인끼리 추억 쌓기 (당일치기)",
    hashtags: ["연인", "단기여행", "힐링", "즐거운", "시원한"],
    likes: 1322,
    comments: 3,
    shares: 23,
  },
  {
    id: "8",
    imgbg: "#eeeeee",
    title: "국내 맛집 여행",
    hashtags: ["국내여행", "맛집", "전국", "힐링"],
    likes: 411,
    comments: 2,
    shares: 11,
  },
  {
    id: "9",
    imgbg: "#f3e5f5",
    title: "강릉 여행 재밌다",
    hashtags: ["강릉", "맛집", "행복", "유튜버"],
    likes: 132,
    comments: 3,
    shares: 23,
  },
  {
    id: "10",
    imgbg: "#f0f4c3",
    title: "일본으로 2박 여행 가볼래?",
    hashtags: ["일본", "해외여행", "서울", "맛집"],
    likes: 312,
    comments: 5,
    shares: 3,
  },
  {
    id: "11",
    imgbg: "#bbdefb",
    title: "연인끼리 추억 쌓기 (당일치기)",
    hashtags: ["서울", "단기여행", "힐링", "즐거운", "시원한"],
    likes: 1322,
    comments: 3,
    shares: 23,
  },
  {
    id: "12",
    imgbg: "#eeeeee",
    title: "국내 맛집 여행",
    hashtags: ["국내여행", "맛집", "전국", "힐링", "일본", "부산"],
    likes: 411,
    comments: 2,
    shares: 11,
  },
];

const ITEM_WIDTH = 280; // 카드의 실제 너비(px)
const ITEM_GAP = 24; // gap={3} -> 8px * 3 = 24px

const useHorizontalScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // 한 화면에 보이는 카드 개수만큼 정확히 스크롤
  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const visibleCount = Math.floor(clientWidth / (ITEM_WIDTH + ITEM_GAP));
      const moveCount = visibleCount > 0 ? visibleCount : 1;
      const scrollAmount = moveCount * (ITEM_WIDTH + ITEM_GAP);
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // 스크롤 위치를 체크하여 화살표 표시 여부 결정
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setIsAtStart(scrollLeft <= 0);
      setIsAtEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      checkScrollPosition();
      return () => {
        scrollElement.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, []);

  return {
    scrollRef,
    isAtStart,
    isAtEnd,
    handleScrollLeft: () => handleScroll("left"),
    handleScrollRight: () => handleScroll("right"),
  };
};

const POSTS_PER_PAGE = 5; // 한 페이지에 보여줄 게시글 수

const Community = () => {
  const { scrollRef, isAtStart, isAtEnd, handleScrollLeft, handleScrollRight } =
    useHorizontalScroll();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // sm 이하: 모바일
  const pageGroupSize = isMobile ? 5 : 8;

  // 페이지네이션을 위한 현재 페이지 상태 정의
  const [currentPage, setCurrentPage] = useState(1);

  // 선택된 태그 상태 추가
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 태그가 바뀔 때마다 페이지를 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags]);

  // 실제 게시글 수에 따라 동적으로 계산 해야되는 부분
  const totalPages = 20;

  // regionTags는 regionImages에서 자동 생성 + 코드 내 직접 추가 태그 모두 포함
  const regionTags = [
    ...regionImages.map((region) => region.name),
    "추가태그1",
    "추가태그2",
    "일본",
    "맛집",
    // 필요시 직접 추가/수정
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

  // 카테고리 클릭 시 태그 추가
  const handleCategoryClick = (name: string) => {
    if (!selectedTags.includes(name)) {
      setSelectedTags([...selectedTags, name]);
    }
  };

  const scrollButtonStyles = {
    position: "absolute",
    zIndex: 2,
    background: "rgba(255,255,255)",
    boxShadow: 1,
    "&:hover": { background: "rgba(255,255,255)" },
  };

  // 선택된 태그가 있을 경우 해당 태그가 모두 포함된 게시글만 필터링 (AND 조건)
  const filteredPosts =
    selectedTags.length === 0
      ? temporaryPosts
      : temporaryPosts.filter((post) =>
          selectedTags.every((tag) => post.hashtags.includes(tag))
        );

  // 페이지네이션된 게시글 목록 계산
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );
  const totalPostPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  return (
    <Stack mt={4} gap={8} pb={10}>
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
      <Box px={{ xs: 1, md: "auto" }}>
        <Stack gap={4}>
          {/* 섹션 제목 */}
          <Typography variant="h5" fontWeight={700}>
            여행 카테고리
          </Typography>

          <Box
            sx={{ position: "relative", display: "flex", alignItems: "center" }}
          >
            {/* 왼쪽 버튼 */}
            {!isAtStart && (
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
            )}

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
                      onClick={() => handleCategoryClick(category.name)}
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
            {!isAtEnd && (
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
            )}
          </Box>
        </Stack>
      </Box>

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
        <SearchBox
          regionTags={regionTags}
          onSearch={handleSearch}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
        {/* Chip이 많아질 때도 게시판과 겹치지 않도록 여백 추가 */}
        <Box sx={{ height: 32 }} />

        {/* 일반 게시판 목록  */}
        <Stack spacing={2} sx={{ mt: 4 }}>
          {paginatedPosts.length > 0 ? (
            paginatedPosts.map((post) => (
              <CommunityPostItem
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post.id)}
              />
            ))
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "center", py: 6 }}
            >
              게시글이 없습니다.
            </Typography>
          )}
        </Stack>

        {/* 게시판 페이지네이션 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 4,
            gap: 1,
          }}
        >
          <IconButton
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </IconButton>
          {Array.from({ length: Math.max(totalPostPages, 1) }, (_, i) => (
            <IconButton
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              sx={{
                width: 40,
                height: 40,
                backgroundColor:
                  currentPage === i + 1 ? "#e0e0e0" : "transparent",
                color: currentPage === i + 1 ? "#000" : "#aaa",
                fontWeight: currentPage === i + 1 ? 700 : 400,
                fontSize: "1.1em",
                borderRadius: "50%",
              }}
              disabled={totalPostPages === 0}
            >
              {i + 1}
            </IconButton>
          ))}
          <IconButton
            onClick={() =>
              setCurrentPage(Math.min(totalPostPages, currentPage + 1))
            }
            disabled={currentPage === totalPostPages || totalPostPages === 0}
          >
            {">"}
          </IconButton>
        </Box>
      </Box>

      {/* 스크롤 맨 위로 이동 버튼 */}
      <ScrollToTopButton />
    </Stack>
  );
};

export default Community;
