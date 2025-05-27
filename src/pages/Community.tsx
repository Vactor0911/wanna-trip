import {
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useRef } from "react";
import { travelRegions } from "../data/travelRegions";
import SearchIcon from "@mui/icons-material/Search";
import PostItem from "../components/PostItem";
import TravelRegionCard from "../components/TravelRegionCard";

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

  const scrollButtonStyles = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    background: "rgba(255,255,255, 0.8)",
    boxShadow: 1,
    "&:hover": { background: "rgba(255,255,255, 1)" },
    display: { xs: "none", sm: "flex" },
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: { xs: 2, sm: 3, md: 4 } }}>
      {/* 인기 게시글 */}
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

      {/* 여행 카테고리 */}
      <Box sx={{ mb: { xs: 4, sm: 6, md: 8 } }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          여행 카테고리
        </Typography>

        <Box
          sx={{ position: "relative", display: "flex", alignItems: "center" }}
        >
          <IconButton
            onClick={handleScrollLeft}
            sx={{
              ...scrollButtonStyles,
              left: 0,
              transform: "translateX(-50%) translateY(-50%)",
            }}
          >
            <ArrowBackIosNewRoundedIcon />
          </IconButton>

          <Stack
            direction="row"
            spacing={{ xs: 2, sm: 3, md: 5 }}
            ref={scrollRef}
            sx={{
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              px: { xs: 2, sm: 3, md: 4 },
              width: "100%",
            }}
          >
            {travelRegions.map((region, index) => (
              <TravelRegionCard
                key={index}
                region={region}
                width={{ xs: 200, sm: 280, md: 300 }}
                height={{ xs: 220, sm: 300, md: 320 }}
                mr={{ xs: 2, sm: 3, md: 4 }}
              />
            ))}
          </Stack>

          <IconButton
            onClick={handleScrollRight}
            sx={{
              ...scrollButtonStyles,
              right: 0,
              transform: "translateX(50%) translateY(-50%)",
            }}
          >
            <ArrowForwardIosRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 일반 게시판 */}
      <Box sx={{ mt: { xs: 5, sm: 8, md: 10 }, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 2, sm: 4 }}
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            일반 게시판
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: "40%", md: "30%" },
              border: "1px solid #000",
              borderRadius: "8px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
              pr: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="게시글,글쓴이,카테고리,태그 검색"
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{ pl: 2 }}
            />
            <SearchIcon color="action" sx={{ fontSize: 20 }} />
          </Box>
        </Stack>
      </Box>

      <Stack spacing={2}>
        <PostItem
          imgbg="#f3e5f5"
          title="일본여행의 진심만을 담은 '유튜버 허니'의 계획은? 3박 4일로 완벽 일본 여행!"
          hashtags={["일본", "단기여행", "행복", "유튜버"]}
          likes={132}
          shares={23}
          comments={3}
        />
        <PostItem
          imgbg="#f0f4c3"
          title="일본으로 2박 여행 가볼래?"
          hashtags={["일본", "해외여행", "강추"]}
          likes={312}
          shares={3}
          comments={5}
        />
        <PostItem
          imgbg="#bbdefb"
          title="연인끼리 추억 쌓기 (당일치기)"
          hashtags={["연인", "단기여행", "힐링", "즐거운", "시원한"]}
          likes={1322}
          shares={23}
          comments={3}
        />
        <PostItem
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
