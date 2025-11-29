import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Avatar,
  BoxProps,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FaceRoundedIcon from "@mui/icons-material/FaceRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { useNavigate } from "react-router-dom";
import { SERVER_HOST } from "../utils/axiosInstance";
import { motion, useMotionValue, animate } from "framer-motion";
import { useBreakpoint } from "../hooks";

// 인기 템플릿 데이터 타입 정의
export interface PopularTemplateData {
  id: string; // key
  image?: string; // 이미지 URL (없으면 배경색 사용)
  bgColor?: string; // 배경색 (image 없을 때 사용)
  title: string; // 제목
  username: string; // 작성자
  userProfileImage?: string; // 작성자 프로필 이미지 URL
  shared_count: number; // 공유 수
  thumbnailUrl?: string; // 썸네일 URL 추가
}

interface PopularTemplatesProps extends BoxProps {
  maxCards?: number; // 최대 카드 개수
  type: "template" | "post"; // 컴포넌트 타입
  data: PopularTemplateData[];
  onCardClick?: (templateId: string) => void; // 카드 클릭 핸들러
}

// 가로:세로 비율 (11:6)
const CARD_ASPECT_RATIO = 11 / 6;
const GAP = 24; // 카드 사이 간격(px)
const MAX_CARD_HEIGHT = 300; // 카드 최대 높이(px)

/**
 * 인기 템플릿/커뮤니티 배너 컴포넌트
 * @param maxCards - 최대 카드 개수 (기본값: 3)
 * @param data - 배너 데이터 배열
 * @param onCardClick - 카드 클릭 시 실행할 콜백 함수
 */
const PopularTemplates = ({
  maxCards = 3,
  data,
  onCardClick,
  ...boxProps
}: PopularTemplatesProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();

  // 캐러셀 상태
  const [itemCounts, setItemCounts] = useState(3); // 화면 크기에 따라 보이는 카드 수
  const x = useMotionValue(0); // 트랙 X 위치
  const firstItemRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0); // 카드 1장 폭 + gap
  const [page, setPage] = useState(0); // 페이지 인덱스
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수

  // 페이지 수 계산
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(data.length / itemCounts)));
  }, [itemCounts, data.length]);

  // 화면 크기에 따라 보이는 카드 수 조정
  useLayoutEffect(() => {
    const visibleCount = {
      xs: 1,
      sm: 2,
      md: maxCards,
      lg: maxCards,
      xl: maxCards,
    };

    switch (breakpoint) {
      case "xs":
        setItemCounts(Math.min(visibleCount.xs, data.length));
        break;
      case "sm":
        setItemCounts(Math.min(visibleCount.sm, data.length));
        break;
      case "md":
        setItemCounts(Math.min(visibleCount.md, data.length));
        break;
      case "lg":
        setItemCounts(Math.min(visibleCount.lg, data.length));
        break;
      case "xl":
        setItemCounts(Math.min(visibleCount.xl, data.length));
        break;
      default:
        setItemCounts(Math.min(visibleCount.md, data.length));
        break;
    }
  }, [maxCards, breakpoint, data.length]);

  // 카드 폭 측정
  useLayoutEffect(() => {
    if (!firstItemRef.current) return;

    const measure = () => {
      if (firstItemRef.current) {
        setStep(firstItemRef.current.offsetWidth + GAP);
      }
    };

    // 초기 측정
    measure();

    // ResizeObserver 등록
    const ro = new ResizeObserver(() => {
      if (firstItemRef.current) {
        const newStep = firstItemRef.current.offsetWidth + GAP;
        setStep(newStep);
      }
    });

    if (firstItemRef.current) {
      ro.observe(firstItemRef.current);
    }

    return () => ro.disconnect();
  }, []);

  // 페이지 이동 애니메이션
  useEffect(() => {
    if (!step) return;
    const contentW = step * data.length; // 전체 컨텐츠 폭
    const viewportW = step * itemCounts; // 현재 보이는 영역 폭
    const maxDrag = viewportW - contentW; // 최대 드래그 가능 위치

    const rawX = -page * itemCounts * step;
    const targetX = Math.max(maxDrag, Math.min(0, rawX));

    animate(x, targetX, { type: "spring", stiffness: 300, damping: 40 });
  }, [page, step, data.length, itemCounts, x]);

  // 페이지가 총 페이지 수를 초과하지 않도록 조정
  useLayoutEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [totalPages, page]);

  // 버튼 표시 여부 (아이템 수가 화면에 보이는 카드 수보다 많을 때만 버튼 표시)
  const showNavigationButtons = data.length > itemCounts;

  // 다음 버튼 클릭
  const handleNextButtonClick = useCallback(() => {
    if (!showNavigationButtons) return;
    setPage((prevPage) => (prevPage + 1) % totalPages);
  }, [totalPages, showNavigationButtons]);

  // 이전 버튼 클릭
  const handlePrevButtonClick = useCallback(() => {
    if (!showNavigationButtons) return;
    setPage((prevPage) => (prevPage === 0 ? totalPages - 1 : prevPage - 1));
  }, [totalPages, showNavigationButtons]);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback(
    (templateId: string) => {
      if (onCardClick) {
        onCardClick(templateId);
      } else {
        navigate(`/template/${templateId}`);
      }
    },
    [onCardClick, navigate]
  );

  // 카드 높이 계산 (최대 높이 제한)
  const getCardHeight = () => {
    if (!firstItemRef.current) return 250;
    const calculatedHeight =
      firstItemRef.current.offsetWidth / CARD_ASPECT_RATIO;
    return Math.min(calculatedHeight, MAX_CARD_HEIGHT);
  };

  // 데이터가 없을 때 빈 상태 UI
  if (data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
          px: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(
            "#ff6b6b",
            0.05
          )} 0%, ${alpha("#ff8e53", 0.02)} 100%)`,
          border: `2px dashed ${alpha("#ff6b6b", 0.25)}`,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
        {...boxProps}
      >
        {/* 배경 장식 */}
        <Box
          sx={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${alpha(
              "#ff6b6b",
              0.1
            )} 0%, ${alpha("#ff8e53", 0.05)} 100%)`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -20,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${alpha(
              "#ff8e53",
              0.08
            )} 0%, ${alpha("#ffc107", 0.05)} 100%)`,
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${alpha(
              "#ff6b6b",
              0.15
            )} 0%, ${alpha("#ff8e53", 0.1)} 100%)`,
            mb: 2,
          }}
        >
          <TravelExploreIcon
            sx={{
              fontSize: 40,
              color: alpha("#ff6b6b", 0.6),
            }}
          />
        </Box>
        <Typography variant="h6" color="text.secondary" mb={1} fontWeight={600}>
          아직 인기 템플릿이 없습니다
        </Typography>
        <Typography variant="body2" color="text.disabled">
          다른 사용자들이 템플릿을 공유하면 여기에 표시됩니다
        </Typography>
      </Box>
    );
  }

  return (
    <Box position="relative" {...boxProps}>
      {/* 이전 버튼 - 아이템이 visibleCount보다 많을 때만 표시 */}
      {showNavigationButtons && (
        <Paper
          elevation={2}
          sx={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            borderRadius: "50px",
          }}
        >
          <IconButton onClick={handlePrevButtonClick} size="small">
            <ChevronLeftRoundedIcon color="primary" fontSize="large" />
          </IconButton>
        </Paper>
      )}

      {/* 다음 버튼 - 아이템이 visibleCount보다 많을 때만 표시 */}
      {showNavigationButtons && (
        <Paper
          elevation={2}
          sx={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translate(50%, -50%)",
            zIndex: 2,
            borderRadius: "50px",
          }}
        >
          <IconButton onClick={handleNextButtonClick} size="small">
            <ChevronRightRoundedIcon color="primary" fontSize="large" />
          </IconButton>
        </Paper>
      )}

      {/* 캐러셀 컨테이너 */}
      <Box overflow="hidden" padding={2}>
        {/* 캐러셀 트랙 */}
        <motion.div
          style={{ display: "flex", gap: GAP, x }}
          drag={showNavigationButtons ? "x" : false}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (!step || !showNavigationButtons) return;
            const threshold = step / 4;
            if (info.offset.x < -threshold) handleNextButtonClick();
            else if (info.offset.x > threshold) handlePrevButtonClick();
          }}
        >
          {data.map((tpl, i) => (
            <Box
              key={tpl.id}
              ref={i === 0 ? firstItemRef : undefined}
              component={motion.div}
              sx={{
                flex: "0 0 auto",
                width: `calc((100% - ${
                  (itemCounts - 1) * GAP
                }px) / ${itemCounts})`,
                cursor: "pointer",
              }}
              onClick={() => handleCardClick(tpl.id)}
            >
              <Paper
                elevation={3}
                sx={{
                  width: "100%",
                  height: getCardHeight(),
                  minHeight: 250,
                  borderRadius: 4,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  background: tpl.thumbnailUrl
                    ? undefined
                    : tpl.image
                    ? undefined
                    : tpl.bgColor || "#e0f7fa",
                  backgroundImage: tpl.thumbnailUrl
                    ? `url(${tpl.thumbnailUrl})`
                    : tpl.image
                    ? `url(${tpl.image})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 5,
                  },
                  "&:active": {
                    transform: "scale(0.97)",
                  },
                }}
              >
                {/* 카드 하단 정보 */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    bgcolor: theme.palette.background.paper,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {/* 좌측: 아바타, 제목/작성자 */}
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    flex={1}
                    minWidth={0}
                  >
                    {tpl.userProfileImage ? (
                      <Avatar
                        src={`${SERVER_HOST}${tpl.userProfileImage}`}
                        sx={{ width: 32, height: 32, flexShrink: 0 }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: theme.palette.primary.main,
                          flexShrink: 0,
                        }}
                      >
                        <FaceRoundedIcon
                          sx={{
                            width: "90%",
                            height: "90%",
                            color: grey[100],
                          }}
                        />
                      </Avatar>
                    )}
                    <Box minWidth={0}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          color: theme.palette.text.primary,
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {tpl.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 15, fontWeight: 400 }}
                      >
                        {tpl.username}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 우측: 퍼가기 수 */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ color: "text.secondary", flexShrink: 0, ml: 2 }}
                  >
                    <IosShareRoundedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={500}>
                      {tpl.shared_count}
                    </Typography>
                  </Stack>
                </Box>
              </Paper>
            </Box>
          ))}
        </motion.div>
      </Box>
    </Box>
  );
};

export default PopularTemplates;
