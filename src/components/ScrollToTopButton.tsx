import { useState, useEffect } from "react";
import { IconButton, Paper } from "@mui/material";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";

const ScrollToTopButton = () => {
  // 버튼 표시 상태 관리
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (window.scrollY > 200) {
      setIsVisible(true);
    } else {
      // 그렇지 않으면 버튼 숨김
      setIsVisible(false);
    }
  };

  // 버튼 클릭 시 페이지 상단으로 부드럽게 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: "40px",
        right: "40px",
        borderRadius: "50%",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.2s ease-in-out",
      }}
    >
      <IconButton onClick={scrollToTop}>
        <ArrowUpwardRoundedIcon color="primary" fontSize="large" />
      </IconButton>
    </Paper>
  );
};

export default ScrollToTopButton;
