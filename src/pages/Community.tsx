import Slider from "react-slick";
import { Stack, Typography, Card, CardContent, Box } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const popularPosts = [
  { id: 1, title: "test1", content: "인기글 내용 1" },
  { id: 2, title: "test2", content: "인기글 내용 2" },
  { id: 3, title: "test3", content: "인기글 내용 3" },
  { id: 4, title: "test4", content: "인기글 내용 4" },
];

const Community = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2, // 한 번에 보여줄 카드 개수
    slidesToScroll: 1,
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4">실시간 인기글</Typography>
      <Slider {...sliderSettings}>
        {popularPosts.map((post) => (
          <Card key={post.id} sx={{ mx: 1 }}>
            <CardContent>
              <Typography variant="h6">{post.title}</Typography>
              <Typography variant="body2">{post.content}</Typography>
            </CardContent>
          </Card>
        ))}
      </Slider>
      <Stack>
        <Typography variant="h4">여행 카테고리</Typography>
        <Stack>
          <Stack sx={{ bgcolor: "#eee" }}>
            <Box>box</Box>
          </Stack>
        </Stack>
      </Stack>
      <Stack>
        <Typography variant="h4">일반 게시판</Typography>
      </Stack>
    </Stack>
  );
};
export default Community;
