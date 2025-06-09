import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Stack,
  Chip,
  Button,
  TextField,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

const CommunityPostDetail = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  /**
   * 이전 페이지로 이동
   */
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        position: "relative",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          p: {
            xs: 2, // 모바일: 16px
            sm: 3, // 태블릿: 24px
            md: 4, // 데스크톱: 32px
          },
        }}
      >
        {/* 뒤로가기 버튼 */}
        <Button
          onClick={handleGoBack}
          startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: "0.8em" }} />}
          sx={{
            mb: 3,
            color: "text.primary",
            "&:hover": {
              bgcolor: "transparent",
              textDecoration: "none",
            },
            p: 0,
            minWidth: 0,
            fontSize: {
              xs: "1.5em", // 모바일
              sm: "1.8em", // 태블릿
              md: "2em", // 데스크톱
            },
          }}
        >
          게시판
        </Button>
      </Box>
    </Box>
  );
};

export default CommunityPostDetail;
