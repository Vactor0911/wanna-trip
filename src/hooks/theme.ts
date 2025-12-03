import { useColorScheme, useMediaQuery } from "@mui/material";
import { useCallback, useMemo } from "react";

const useThemeMode = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { mode, setMode } = useColorScheme();

  /**
   * 현재 테마 모드 반환
   */
  const themeMode = useMemo(
    () => (mode === "system" ? (prefersDarkMode ? "dark" : "light") : mode),
    [mode, prefersDarkMode]
  );

  /**
   * 테마 모드 토글
   */
  const toggleThemeMode = useCallback(() => {
    const newMode = themeMode === "light" ? "dark" : "light";
    setMode(newMode);
  }, [themeMode, setMode]);

  return { themeMode, toggleThemeMode };
};

export default useThemeMode;
