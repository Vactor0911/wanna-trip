import React, { useState } from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import IosShareIcon from "@mui/icons-material/IosShare";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

// 게시글  prop 타입
interface PostItemProps {
  imgbg: string; // 왼쪽 박스 배경색 또는 이미지 URL
  title: string; // 게시글 제목
  hashtags: string[]; // 해시태그 목록
  likes: number; // 좋아요 수
  comments: number; // 댓글 수
  shares: number; // 공유 수
}

const PostItem: React.FC<PostItemProps> = ({
  imgbg,
  title,
  hashtags,
  likes,
  comments,
  shares,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    // 게시글 항목 전체를 감싸는 박스
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
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
          width: 284,
          height: 185,
          bgcolor: imgbg.startsWith("#") ? imgbg : undefined,
          backgroundImage: imgbg.startsWith("http")
            ? `url(${imgbg})`
            : undefined, // http로 시작하면 배경 이미지
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 2,
          flexShrink: 0,
          mr: 2,
        }}
      />

      {/* stack 레이아웃  */}
      <Stack sx={{ flexGrow: 1 }}>
        {/* 제목  */}
        <Stack>
          <Typography variant="h5" fontWeight={800} sx={{ width: "100%" }}>
            {title}
          </Typography>
        </Stack>

        {/* 태그 Stack */}
        <Stack>
          <Typography variant="body2">
            {hashtags.map((tag) => `#${tag}`).join(" ")}
          </Typography>
        </Stack>

        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
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
