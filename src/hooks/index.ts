import { useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router";

// 소켓 및 알림 훅 export
export * from "./socket";
export * from "./template";
export * from "./notification";

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

/**
 * GitHub Pages에서 404 에러 페이지로 리다이렉트된 경우 URL을 파싱하여 원래의 페이지로 리다이렉트하는 훅
 */
export const useRedirectPage = () => {
  const navigate = useNavigate();

  return (): boolean => {
    const currentUrl = window.location.href; // 현재 URL 가져오기

    // 404.html에서 반환된 URL의 형식이 아닌 경우 종료
    if (!currentUrl.includes("/?/")) {
      return false; // 리다이렉트 실패
    }

    // 404.html에서 반환된 URL 파싱
    const url = currentUrl.split("/?/")[1];
    navigate(url, { replace: true }); // 원래의 페이지로 리다이렉트
    return true; // 리다이렉트 성공
  };
};
