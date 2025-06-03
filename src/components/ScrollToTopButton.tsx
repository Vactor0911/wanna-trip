import { useState, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const ScrollToTopButton = () => {
  // 버튼 표시 상태 관리 (기본값: 숨김)
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    // 페이지가 특정 스크롤 위치(예: 200px) 아래로 내려가면 버튼 표시
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
      behavior: "smooth", // 부드러운 스크롤 효과
    });
  };

  // 컴포넌트 마운트 시 스크롤 이벤트 리스너 추가
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    // 컴포넌트 언마운트 시 스크롤 이벤트 리스너 제거
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // 빈 배열: 마운트/언마운트 시에만 실행

  // isVisible 상태가 true일 때만 버튼 렌더링
  return (
    <>
      {isVisible && (
        <Box
          sx={{
            position: "fixed", // 뷰포트에 고정
            bottom: "40px", // 하단에서 40px 위로
            right: "40px", // 우측에서 40px 왼쪽으로
            zIndex: 1000, // 다른 요소들 위에 표시
            // 원형 모양, 배경, 그림자 스타일
            width: "56px", // 너비
            height: "56px", // 높이 (너비와 동일하게 하여 원형)
            borderRadius: "50%", // 원형으로 만듦
            backgroundColor: "white", // 흰색 배경
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)", // 그림자 효과
            display: "flex", // 아이콘 중앙 정렬을 위해 flex 사용
            alignItems: "center", // 세로 중앙 정렬
            justifyContent: "center", // 가로 중앙 정렬
            cursor: "pointer", // 마우스 오버 시 포인터 모양
          }}
          onClick={scrollToTop}
        >
          {/* 위쪽 화살표 아이콘 */}
          <ArrowUpwardIcon sx={{ color: "#1976d2", fontSize: "33px" }} />{" "}
          {/* 파란색 화살표 */}
        </Box>
      )}
    </>
  );
};

export default ScrollToTopButton;
