import { Box, Stack, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import SquareTemplateCard from "../components/SquareTemplateCard";
import { useRef } from "react";
import { categories } from "../utils/categories";

const Community = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = 3 * (200 + 24);
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = 3 * (200 + 24);
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: 3 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          실시간 인기 게시글
        </Typography>

        <Box sx={{ height: 220, bgcolor: "#e0e0e0", borderRadius: 2 }}></Box>
      </Box>

      {/* 여행 카테고리 영역 */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          여행 카테고리
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            position: "relative",
          }}
        >
          {/* 이전 버튼   */}
          <IconButton
            onClick={handleScrollLeft}
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateX(-45%) translateY(-50%)",
              zIndex: 2,
              background: "rgba(255,255,255,0.8)",
              boxShadow: 1,
              "&:hover": { background: "rgba(255,255,255)" },
            }}
          >
            <ArrowBackIosNewRoundedIcon />
          </IconButton>

          {/* 카테고리  Stack 컨테이너  */}
          <Stack
            direction="row"
            spacing={3}
            ref={scrollRef}
            sx={{
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {/* SquareTemplateCard 컴포넌트로 렌더링 */}
            {categories.map((category, index) => (
              <Box key={index} sx={{ flexShrink: 0 }}>
                <SquareTemplateCard title={category.name}>
                  <Box
                    component="img"
                    src={category.image}
                    alt={category.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "inherit",
                    }}
                  />
                </SquareTemplateCard>
              </Box>
            ))}
          </Stack>

          {/* 다음 버튼  */}
          <IconButton
            onClick={handleScrollRight}
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateX(45%) translateY(-50%)",
              zIndex: 2,
              background: "rgba(255,255,255,0.8)",
              boxShadow: 1,
              "&:hover": { background: "rgba(255,255,255)" },
            }}
          >
            <ArrowForwardIosRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 일반 게시판 영역 */}
      <Box>
        {/* 섹션 제목 */}
        <Typography variant="h5" fontWeight={700} mb={2}>
          일반 게시판
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ height: 70, bgcolor: "#f3e5f5", borderRadius: 2 }} />
          <Box sx={{ height: 70, bgcolor: "#f0f4c3", borderRadius: 2 }} />
          <Box sx={{ height: 70, bgcolor: "#bbdefb", borderRadius: 2 }} />
          <Box sx={{ height: 70, bgcolor: "#eeeeee", borderRadius: 2 }} />
          <Box sx={{ height: 70, bgcolor: "#212121", borderRadius: 2 }} />
        </Stack>
      </Box>
    </Box>
  );
};

export default Community;
