import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const ScrollToTopButton = () => {
  // 버튼 표시 상태 관리
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    // 페이지가 특정 스크롤 위치
    if (window.pageYOffset > 200) {
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

  // isVisible 상태가 true일 때만 버튼 렌더링
  return (
    <>
      {isVisible && (
        <Box
          sx={{
            position: "fixed",
            bottom: "40px",
            right: "50px",
            zIndex: 1000,

            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "white",
            boxShadow: "0 3px 5px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={scrollToTop}
        >
          {/* 위쪽 화살표 아이콘 */}
          <ArrowUpwardIcon sx={{ color: "#1976d2", fontSize: "35px" }} />
        </Box>
      )}
    </>
  );
};

export default ScrollToTopButton;
