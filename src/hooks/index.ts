import { useTheme, useMediaQuery } from "@mui/material";

/** 현재 브라우저의 MUI breakpoint 이름을 반환 */
export const useBreakpoint = (): "xs" | "sm" | "md" | "lg" | "xl" => {
  const theme = useTheme();

  // 화면 브레이크 포인트 확인
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));

  // 브레이크 포인트 반환
  if (isXl) return "xl";
  if (isLg) return "lg";
  if (isMd) return "md";
  if (isSm) return "sm";
  return "xs";
};
