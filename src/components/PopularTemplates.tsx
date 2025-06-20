import { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Avatar,
  BoxProps,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ShareIcon from "@mui/icons-material/Share";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import IosShareIcon from "@mui/icons-material/IosShare";
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
  description?: string; // 설명
}

interface PopularTemplatesProps extends BoxProps {
  maxCards?: number; // 최대 카드 개수
  type: "template" | "post"; // 컴포넌트 타입
  data: PopularTemplateData[];
  onCardClick?: (templateId: string) => void; // 카드 클릭 핸들러
}

// 가로:세로 비율 (11:6)
const CARD_ASPECT_RATIO = 11 / 6;

/**
 * 인기 템플릿/커뮤니티 배너 컴포넌트
 * @param maxCards - 최대 카드 개수 (기본값: 3)
 * @param type - 컴포넌트 타입
 * @param data - 배너 데이터 배열
 * @param onCardClick - 카드 클릭 시 실행할 콜백 함수
 */
const PopularTemplates = ({
  maxCards = 3,
  type,
  data,
  onCardClick,
  ...boxProps
}: PopularTemplatesProps) => {
  // 슬라이드 인덱스 관리
  const [index, setIndex] = useState(0);
  // 부모 영역의 width 측정
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  // 페이지 이동을 위한 navigate
  const navigate = useNavigate();
  const [likedTemplates, setLikedTemplates] = useState<Set<string>>(new Set());

  // 화면 너비에 따른 보여줄 카드 개수 계산
  const getVisibleCount = () => {
    if (!containerWidth) return 1;

    // 화면 너비에 따른 카드 개수 결정
    if (containerWidth >= 1200) return Math.min(maxCards, data.length);
    if (containerWidth >= 768) return Math.min(2, data.length);
    return 1;
  };

  const visibleCount = getVisibleCount();

  // 버튼 노출 조건
  const showArrows = data.length > visibleCount;

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
    setIndex((prev) => (prev === 0 ? data.length - 1 : prev - 1));
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

  // 카드 클릭 핸들러
  const handleCardClick = (templateId: string) => {
    if (onCardClick) {
      onCardClick(templateId);
    } else {
      navigate(`/template/${templateId}`);
    }
  };

  // 좋아요 토글 핸들러
  const handleLikeClick = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    setLikedTemplates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  return (
    <Box px={{ xs: 1, md: "auto" }}>
      <Box
        ref={containerRef}
        width="100%"
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        {...boxProps}
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
              "&:hover": { background: "rgba(255,255,255)" },
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
              onClick={() => handleCardClick(tpl.id)}
              sx={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: 4,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                bgcolor: tpl.image ? undefined : tpl.bgColor || "#e0f7fa",
                backgroundImage: tpl.image ? `url(${tpl.image})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "250px", // 최소 높이 설정
                position: "relative",
                boxShadow: 2,
                transition: "width 0.2s, height 0.2s",
                cursor: "pointer",
              }}
            >
              {/* 카드 하단 정보 */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  bgcolor: "rgba(255,255,255)",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                {/* 상단: 아바타, 제목/작성자 */}
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 18 }}>
                    {tpl.author[0]}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{
                        color: "#222",
                        lineHeight: 1.2,
                        maxWidth: 220,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {tpl.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: 13, fontWeight: 400 }}
                    >
                      {tpl.author}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1} mt={0.5} justifyContent="flex-end">
                  {type === "template" ? (
                    <Typography
                      variant="caption"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <ShareIcon sx={{ fontSize: 16 }} /> {tpl.shares}
                    </Typography>
                  ) : (
                    <>
                      {/* 좋아요 */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          {tpl.likes}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleLikeClick(e, tpl.id)}
                          sx={{ position: "relative", top: 1 }}
                        >
                          {likedTemplates.has(tpl.id) ? (
                            <FavoriteIcon color="error" fontSize="small" />
                          ) : (
                            <FavoriteBorderOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                      {/* 공유 */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          {tpl.shares}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{ position: "relative", top: -1 }}
                        >
                          <IosShareIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {/* 댓글 */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          {tpl.comments}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{ position: "relative", top: 1 }}
                        >
                          <ChatBubbleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </>
                  )}
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
              "&:hover": { background: "rgba(255,255,255)" },
            }}
          >
            <ArrowForwardIosRoundedIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default PopularTemplates;
