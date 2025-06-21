// HorizontalCarousel.tsx
import { Box, IconButton, Paper } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import { motion, useMotionValue, animate } from "framer-motion";
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface HorizontalCarouselProps {
  children: ReactNode;
  visibleCount?: number; // 한 화면에 보이는 카드 수 (기본값: 3)
  gap?: number; // 카드 간격(px) (기본값: 24)
}

export default function HorizontalCarousel(props: HorizontalCarouselProps) {
  const { children, visibleCount = 3, gap = 24 } = props;

  const items = Array.isArray(children) ? children : [children];
  const x = useMotionValue(0); // 트랙 X 위치
  const firstItemRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0); // 카드 1장 폭 + gap
  const [page, setPage] = useState(0); // 페이지 인덱스
  const totalPages = Math.max(1, Math.ceil(items.length / visibleCount));

  // 카드 폭 측정
  useLayoutEffect(() => {
    if (!firstItemRef.current) return;
    const measure = () => {
      setStep(firstItemRef.current!.offsetWidth + gap);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(firstItemRef.current);
    return () => ro.disconnect();
  }, [gap]);

  // 페이지 이동 애니메이션
  useEffect(() => {
    if (!step) return;
    const contentW = step * items.length; // 전체 컨텐츠 폭
    const viewportW = step * visibleCount; // 현재 보이는 영역 폭
    const maxDrag = viewportW - contentW; // 최대 드래그 가능 위치

    const rawX = -page * visibleCount * step;
    const targetX = Math.max(maxDrag, Math.min(0, rawX));

    animate(x, targetX, { type: "spring", stiffness: 300, damping: 40 });
  }, [page, step, items.length, visibleCount, x]);

  // 페이지가 총 페이지 수를 초과하지 않도록 조정
  useLayoutEffect(() => {
    if (page >= totalPages) setPage(totalPages - 1);
  }, [totalPages, page]);

  // 다음 버튼 클릭
  const handleNextButtonClick = useCallback(() => {
    setPage((prevPage) => (prevPage + 1) % totalPages);
  }, [totalPages]);

  // 이전 버튼 클릭
  const handlePrevButtonClick = useCallback(() => {
    setPage((prevPage) => (prevPage === 0 ? totalPages - 1 : prevPage - 1));
  }, [totalPages]);

  return (
    <Box position="relative">
      {/* 이전 버튼 */}
      <Paper
        elevation={2}
        sx={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
          borderRadius: "50px",
        }}
      >
        <IconButton onClick={handlePrevButtonClick} size="small">
          <ChevronLeftRoundedIcon color="primary" fontSize="large" />
        </IconButton>
      </Paper>

      {/* 다음 버튼 */}
      <Paper
        elevation={2}
        sx={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translate(50%, -50%)",
          zIndex: 1,
          borderRadius: "50px",
        }}
      >
        <IconButton onClick={handleNextButtonClick} size="small">
          <ChevronRightRoundedIcon color="primary" fontSize="large" />
        </IconButton>
      </Paper>

      {/* 캐러셀 컨테이너 */}
      <Box overflow="hidden" padding={2}>
        {/* 캐러셀 트랙 */}
        <motion.div
          style={{ display: "flex", gap, x }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }} // 상대 이동만 허용
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (!step) return;
            const threshold = step / 4;
            if (info.offset.x < -threshold) handleNextButtonClick();
            else if (info.offset.x > threshold) handlePrevButtonClick();
          }}
        >
          {items.map((child, i) => (
            <Box
              key={i}
              ref={i === 0 ? firstItemRef : undefined}
              component={motion.div}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              sx={{
                flex: "0 0 auto",
                width: `calc((100% - ${
                  (visibleCount - 1) * gap
                }px) / ${visibleCount})`,
                height: firstItemRef.current?.clientHeight,
                borderRadius: 3,
              }}
            >
              {child}
            </Box>
          ))}
        </motion.div>
      </Box>
    </Box>
  );
}
