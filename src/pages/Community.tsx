import { Box, Stack, Typography } from "@mui/material";

const Community = () => {
  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: 3 }}>
      <Box sx={{ mb: 5 }}>
        {/* 섹션 제목 */}
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
        {/* 지역 들어갈 자리 */}
        <Stack direction="row" spacing={3}>
          <Box
            sx={{
              width: 120,
              height: 120,
              bgcolor: "#e3f2fd",
              borderRadius: 3,
            }}
          />
          <Box
            sx={{
              width: 120,
              height: 120,
              bgcolor: "#e3f2fd",
              borderRadius: 3,
            }}
          />
          <Box
            sx={{
              width: 120,
              height: 120,
              bgcolor: "#e3f2fd",
              borderRadius: 3,
            }}
          />
          <Box
            sx={{
              width: 120,
              height: 120,
              bgcolor: "#e3f2fd",
              borderRadius: 3,
            }}
          />
          <Box
            sx={{
              width: 120,
              height: 120,
              bgcolor: "#e3f2fd",
              borderRadius: 3,
            }}
          />
        </Stack>
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
