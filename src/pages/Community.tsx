import { Stack, Typography, Box } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CommunityCard from "../components/CommunityCard";

const Community = () => {
  return (
    <Stack gap={8} mt={4}>
      <Box>
        <Typography variant="h5" sx={{ mb: 4 }}>
          실시간 인기 게시글
        </Typography>
      </Box>

      <Box>
        <Typography variant="h5" sx={{ mb: 4 }}>
          여행 카테고리
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {[1, 2, 3, 4].map((item) => (
            <CommunityCard
              key={item}
              title={`카테고리 ${item}`}
              type="existing"
              id={item}
            />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="h5" sx={{ mb: 4 }}>
          일반 게시판
        </Typography>
      </Box>
    </Stack>
  );
};

export default Community;
