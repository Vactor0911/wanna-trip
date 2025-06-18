import React, { useState } from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import IosShareIcon from "@mui/icons-material/IosShare";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

// 게시글 데이터 타입 정의
export interface PostData {
  id: string;
  imgbg: string; // 왼쪽 박스 배경색 또는 이미지 URL
  title: string; // 게시글 제목
  hashtags: string[]; // 해시태그 목록
  likes: number; // 좋아요 수
  comments: number; // 댓글 수
  shares: number; // 공유 수
}

// 게시글 prop 타입
interface PostItemProps {
  post: PostData; // 게시글 데이터 객체
  onClick?: () => void; // 클릭 이벤트 핸들러
}

const PostItem: React.FC<PostItemProps> = ({
  post, // post prop 받음
  onClick,
}) => {
  const { imgbg, title, hashtags, likes, comments, shares } = post;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    // 게시글 항목 전체를 감싸는 박스
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "center", md: "flex-start" },
        p: 2,
        bgcolor: "#fff",
        borderRadius: 2,
        boxShadow: 4,
        cursor: "pointer",
        "&:hover": { bgcolor: "#f5f5f5" },
        position: "relative",
        width: "100%",
      }}
    >
      {/* 왼쪽 박스 배경색/이미지 영역 */}
      <Box
        sx={{
          width: { xs: "100%", md: 284 }, // 모바일/태블릿: 100% 너비, PC: 284px 고정 너비
          height: { xs: 180, md: 185 }, // 모바일/태블릿: 180px 높이, PC: 185px 높이
          bgcolor: imgbg.startsWith("#") ? imgbg : undefined,
          backgroundImage: imgbg.startsWith("http")
            ? `url(${imgbg})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 2,
          flexShrink: 0,
          mb: { xs: 2, md: 0 }, // 모바일/태블릿: 하단 여백, PC: 여백 없음
          mr: { xs: 0, md: 2 }, // 모바일/태블릿: 우측 여백 없음, PC: 우측 여백
        }}
      />

      <Stack sx={{ flexGrow: 1, width: { xs: "100%", md: "auto" } }}>
        {/* 모바일 100% 너비, PC 자동 너비 */}
        {/* 제목  */}
        <Stack>
          <Typography variant="h5" fontWeight={800} sx={{ width: "100%" }}>
            {title}
          </Typography>
        </Stack>
        {/* 태그 Stack */}
        <Stack mb={{ xs: 2, md: 0 }}>
          {/* 모바일/태블릿: 하단 여백, PC: 여백 없음 */}
          <Typography variant="body2">
            {hashtags.map((tag) => `#${tag}`).join(" ")}
          </Typography>
        </Stack>
        {/* 좋아요, 공유, 댓글 아이콘 (반응형 위치 조정) */}
        <Box
          sx={{
            position: { xs: "static", md: "absolute" },
            bottom: { xs: "auto", md: 16 },
            right: { xs: "auto", md: 16 },
            mt: { xs: 2, md: 0 },
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "center", md: "flex-end" },
            alignItems: { xs: "center", md: "flex-end" },
            display: "flex",
          }}
        >
          {/* 좋아요 수 */}
          <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            {likeCount}
          </Typography>
          {/* 좋아요 아이콘 */}
          <IconButton size="small" onClick={handleLikeClick} sx={{ mr: 1.5 }}>
            {isLiked ? (
              <FavoriteIcon color="error" fontSize="small" />
            ) : (
              <FavoriteBorderOutlinedIcon fontSize="small" />
            )}
          </IconButton>

          {/* 공유 수 */}
          <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            {shares}
          </Typography>

          {/* 공유 아이콘 */}
          <IconButton size="small" sx={{ mr: 1.5 }}>
            <IosShareIcon fontSize="small" />
          </IconButton>

          {/* 댓글 수 */}
          <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            {comments}
          </Typography>
          {/* 댓글 아이콘 */}
          <IconButton size="small">
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
};

export default PostItem;
