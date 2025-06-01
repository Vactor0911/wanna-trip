import {
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
  Chip,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useRef, useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CommunityPostItem from "../components/CommunityPostItem";

// 이미지 파일
import seoulImg from "../images/서울.jpg";
import busanImg from "../images/부산.jpg";
import gangneungImg from "../images/강릉.jpg";
import incheonImg from "../images/인천.jpg";
import gyeongjuImg from "../images/경주.jpg";
import jejuImg from "../images/제주.jpg";
import sokchoImg from "../images/속초.jpg";
import yeosuImg from "../images/여수.jpg";

const useHorizontalScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAmount = 3 * (200 + 16);

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

  // 검색어 입력 필드의 현재 텍스트 상태 관리
  const [inputValue, setInputValue] = useState("");
  // 선택된 지역 태그 상태 관리 (문자열 배열 - # 없는 지역 이름)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // 검색어 입력에 따라 추천되는 지역 태그 목록 상태 관리
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  // 지역 태그 추천 목록 표시 상태 관리
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  useEffect(() => {
    const words = inputValue.split(/\s+/);
    const lastWord = words[words.length - 1];

    // 마지막 단어가 '#'으로 시작하고 비어있지 않다면 태그 추천 로직 실행
    if (lastWord.startsWith("#") && lastWord.length > 1) {
      const tagPrefix = lastWord.substring(1).toLowerCase();

      // 지역 태그 목록에서 일치하는 태그 필터링 (#으로 시작하는 단어로 필터링)
      const filteredTags = regionTags.filter(
        (tag) =>
          tag.toLowerCase().startsWith(tagPrefix) && !selectedTags.includes(tag)
      );
      setSuggestedTags(filteredTags);
      // 일치하는 태그가 있고 검색창에 포커스가 있다면 추천 목록 표시
      if (
        filteredTags.length > 0 &&
        document.activeElement?.closest(".search-input-box")
      ) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setSuggestedTags([]);
      setShowSuggestions(false);
    }
  }, [inputValue, selectedTags]);

  // 검색 실행 핸들러
  const handleSearch = () => {
    // 검색 실행 시 선택된 태그와 현재 입력된 텍스트를 조합하여 사용
    const fullSearchTerm =
      selectedTags.map((tag) => `#${tag}`).join(" ") +
      (inputValue ? ` ${inputValue}` : "");
    console.log("검색 실행 (전체 검색어):", fullSearchTerm.trim());
    // 여기에 실제 검색 로직 구현 (예: API 호출, 데이터 필터링 등)

    // 검색 실행 후 상태 초기화 (선택된 태그, 입력 값, 추천 목록 숨김)
    setSelectedTags([]);
    setInputValue("");
    setSuggestedTags([]);
    setShowSuggestions(false);
  };

  // 추천 태그 클릭 핸들러
  const handleSuggestionTagClick = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }

    const words = inputValue.split(/\s+/);
    words.pop();
    setInputValue(words.join(" ") + " ");

    setSuggestedTags([]);
    setShowSuggestions(false);
  };

  // 검색창 내부에서 태그 삭제 핸들러
  const handleDeleteTag = (tagToDelete: string) => () => {
    setSelectedTags((chips) => chips.filter((tag) => tag !== tagToDelete));
  };

  // 검색창 입력 필드에 포커스가 왔을 때 호출되는 핸들러
  const handleInputFocus = () => {
    // 현재 입력 값이 #으로 시작하는 단어를 포함하고 있다면 추천 목록 표시 (useEffect에서 필터링 로직 처리)
    const words = inputValue.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith("#")) {
      // useEffect에서 이미 필터링 및 설정 로직을 처리하므로 여기서는 단순히 표시 상태만 제어
      setShowSuggestions(true);
    } else if (inputValue.trim() === "") {
      // 입력 값이 비어있으면 전체 지역 태그 중 선택되지 않은 태그만 추천 목록으로 표시
      const filteredTagsForEmptyInput = regionTags.filter(
        (tag) => !selectedTags.includes(tag) // 이미 선택된 태그는 추천 목록에서 제외
      );
      setSuggestedTags(filteredTagsForEmptyInput);
      setShowSuggestions(true); // 추천 목록 표시
    }
    // 태그 추천은 # 입력 시에만 동작하도록 useEffect 로직으로 제어
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!document.activeElement?.closest(".region-suggestions-box")) {
        setShowSuggestions(false);
        setSuggestedTags([]);
      }
    }, 100);
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
            ].map((category, index) => (
              <Stack key={index} gap={1.1}>
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

        {/* 검색창과 태그 추천 목록 컨테이너 */}
        <Stack
          sx={{
            width: { xs: "100%", sm: "23em" },
            position: { xs: "static", sm: "absolute" },
            top: 0,
            right: 0,
            zIndex: 2,
            display: "flex",
            minHeight: 30,
            border: "1px solid #6F6F6F",
            borderRadius: "8px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            p: 1,
            bgcolor: "white",
            mt: { xs: 2, sm: 0 },
          }}
        >
          {/* 검색 & 태그 박스 */}
          <Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                mb: 1,
                alignItems: "center",
              }}
            >
              {/* 선택된 태그들을 Mui Chip 형태로 표시 */}
              {selectedTags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  onDelete={handleDeleteTag(tag)}
                  size="small"
                  color="primary"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: "flex-start" }}
                />
              ))}
            </Box>
            {/* 검색어 입력 및 버튼 영역 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {/* 검색어 입력 필드 (TextField) */}
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={"게시글,글쓴이,카테고리,태그 검색"}
                  /* TODO: 아래줄 바꾸는 법 및 쓸때마다 아래줄 생기는거 바꿔야함*/
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: "1rem" },
                  }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </Box>
              {/* 검색 버튼 */}
              <IconButton onClick={handleSearch}>
                <SearchIcon sx={{ fontSize: 35, color: "#000" }} />
              </IconButton>
            </Box>

            {/* 지역 태그 추천 목록 */}
            {showSuggestions && suggestedTags.length > 0 && (
              <Box
                className="region-suggestions-box"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 1.5,
                  pb: 1.3,
                }}
              >
                {/* 추천 태그  */}
                {suggestedTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    onClick={() => handleSuggestionTagClick(tag)}
                    size="small"
                    variant="outlined"
                    clickable
                    sx={{
                      justifyContent: "flex-start",
                      fontSize: "1.1rem",
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      {/* 일반 게시판 목록  */}
      <Stack spacing={2}>
        <CommunityPostItem
          imgbg="#f3e5f5"
          title="일본여행의 진심만을 담은 '유튜버 허니'의 계획은? 3박 4일로 완벽 일본 여행!"
          hashtags={["일본", "단기여행", "행복", "유튜버"]}
          likes={132}
          shares={23}
          comments={3}
        />
        <CommunityPostItem
          imgbg="#f0f4c3"
          title="일본으로 2박 여행 가볼래?"
          hashtags={["일본", "해외여행", "강추"]}
          likes={312}
          shares={3}
          comments={5}
        />
        <CommunityPostItem
          imgbg="#bbdefb"
          title="연인끼리 추억 쌓기 (당일치기)"
          hashtags={["연인", "단기여행", "힐링", "즐거운", "시원한"]}
          likes={1322}
          shares={23}
          comments={3}
        />
        <CommunityPostItem
          imgbg="#eeeeee"
          title="국내 맛집 여행"
          hashtags={["국내여행", "맛집", "전국", "힐링"]}
          likes={411}
          shares={11}
          comments={2}
        />
      </Stack>
    </Box>
  );
};

export default Community;
