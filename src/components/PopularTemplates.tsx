import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, Typography, Paper, Avatar } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useNavigate } from "react-router-dom";

// 인기 템플릿 데이터 타입 정의
export interface PopularTemplateData {
  id: string; // key
  image?: string; // 이미지 URL (없으면 배경색 사용)
  bgColor?: string; // 배경색 (image 없을 때 사용)
  label: string; // 제목
  author: string; // 작성자
  likes: number; // 좋아요 수
  shares: number; // 공유 수
  comments: number; // 댓글 수
}

interface PopularTemplatesProps {
  type: "template" | "community";
  data: PopularTemplateData[];
}

// 가로:세로 비율 (11:6)
const CARD_ASPECT_RATIO = 11/6;

/**
 * 인기 템플릿/커뮤니티 배너 컴포넌트
 * @param type - template | community
 * @param data - 배너 데이터 배열
 */
const PopularTemplates = ({ type, data }: PopularTemplatesProps) => {
  // 슬라이드 인덱스 관리
  const [index, setIndex] = useState(0);
  // 부모 영역의 width 측정
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  // 페이지 이동을 위한 navigate
  const navigate = useNavigate();

  // 보여줄 카드 개수 계산
  let visibleCount = 1;
  if (type === "template") {
    if (data.length === 2) visibleCount = 2;
    else if (data.length >= 3) visibleCount = 2;
  } else if (type === "community") {
    if (data.length === 2) visibleCount = 2;
    else if (data.length === 3) visibleCount = 3;
    else if (data.length >= 4) visibleCount = 3;
  }

  // 버튼 노출 조건
  const showArrows =
    (type === "template" && data.length >= 3) ||
    (type === "community" && data.length >= 4);

  // 슬라이드 데이터 계산 (순환)
  const getVisibleData = () => {
    if (!showArrows) return data.slice(0, visibleCount);
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      result.push(data[(index + i) % data.length]);
    }
    return result;
  };

  // 이전/다음 버튼 핸들러
  const handlePrev = () => {
    setIndex((prev) =>
      prev === 0 ? data.length - 1 : prev - 1
    );
  };
  const handleNext = () => {
    setIndex((prev) => (prev + 1) % data.length);
  };

  // 부모 영역의 width를 측정해서 상태로 저장
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 카드의 width, height 계산 (영역에 비례)
  const gap = 16; // 카드 사이 간격(px)
  const totalGap = gap * (visibleCount - 1);
  const cardWidth =
    visibleCount > 0 && containerWidth > 0
      ? (containerWidth - totalGap) / visibleCount
      : 320;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  return (
    <Box
      ref={containerRef}
      width="100%"
      sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      {/* 이전 버튼 - 카드 영역 안쪽에 고정 */}
      {showArrows && (
        <IconButton
          onClick={handlePrev}
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateX(-45%) translateY(-50%)",
            zIndex: 2,
            background: "rgba(255,255,255)",
            boxShadow: 1,
            '&:hover': { background: "rgba(255,255,255)" },
          }}
        >
          <ArrowBackIosNewRoundedIcon />
        </IconButton>
      )}

      {/* 카드 리스트 */}
      <Box display="flex" gap={`${gap}px`} width="100%">
        {getVisibleData().map((tpl) => (
          <Paper
            key={tpl.id}
            onClick={() => navigate(`/template/${tpl.id}`)} // 카드 클릭 시 이동
            sx={{
              width: cardWidth,
              height: cardHeight,
              borderRadius: 4,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              bgcolor: tpl.image ? undefined : tpl.bgColor || "#e0f7fa",
              backgroundImage: tpl.image
                ? `url(${tpl.image})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              boxShadow: 2,
              transition: "width 0.2s, height 0.2s",
              cursor: "pointer", // 커서 포인터
            }}
          >
            {/* 카드 하단 정보 */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                bgcolor: "rgba(255,255,255)",
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                  {tpl.author[0]}
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {tpl.label}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {tpl.author}
              </Typography>
              <Box display="flex" gap={2} mt={0.5}>
                <Typography variant="caption">❤️ {tpl.likes}</Typography>
                <Typography variant="caption">🔄 {tpl.shares}</Typography>
                <Typography variant="caption">💬 {tpl.comments}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 다음 버튼 - 카드 영역 안쪽에 고정 */}
      {showArrows && (
        <IconButton
          onClick={handleNext}
          sx={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateX(45%) translateY(-50%)",
            zIndex: 2,
            background: "rgba(255,255,255)",
            boxShadow: 1,
            '&:hover': { background: "rgba(255,255,255)" },
          }}
        >
          <ArrowForwardIosRoundedIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default PopularTemplates;
