import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

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

  // isVisible 상태가 true일 때만 버튼 렌더링
  return (
    <>
      {isVisible && (
        <Box
          sx={{
            position: "fixed", // 화면에 고정
            bottom: { xs: "100px", sm: "60px", md: "40px" }, // 하단 여백: 모바일(xs), 태블릿(sm), 웹(md) 기준
            right: { xs: "30px", sm: "40px", md: "50px" }, // 오른쪽 여백: 모바일(xs), 태블릿(sm), 웹(md) 기준
            zIndex: 1000,

            width: { xs: "48px", sm: "52px", md: "56px" }, // 버튼 너비: 모바일(xs), 태블릿(sm), 웹(md) 기준
            height: { xs: "48px", sm: "52px", md: "56px" }, // 버튼 높이: 모바일(xs), 태블릿(sm), 웹(md) 기준
            borderRadius: "50%", // 원형 버튼
            backgroundColor: "white", // 배경색
            boxShadow: "0 3px 5px rgba(0,0,0,0.5)", // 그림자 효과
            display: "flex", // flexbox 레이아웃
            alignItems: "center", // 수직 중앙 정렬
            justifyContent: "center", // 수평 중앙 정렬
            cursor: "pointer", // 마우스 오버 시 포인터 변경
          }}
          onClick={scrollToTop}
        >
          {/* 위쪽 화살표 아이콘 */}
          <ArrowUpwardIcon sx={{ color: "#3288FF", fontSize: "35px" }} />
        </Box>
      )}
    </>
  );
};

export default ScrollToTopButton;
