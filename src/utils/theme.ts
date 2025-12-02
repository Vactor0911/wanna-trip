import { createTheme, responsiveFontSizes, PaletteMode } from "@mui/material";

// MUI Palette 확장
declare module "@mui/material/styles" {
  interface Palette {
    black: Palette["primary"];
  }
  interface PaletteOptions {
    black?: PaletteOptions["primary"];
  }
}

// MUI Button 색상 확장
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    black: true;
  }
}

// SVG 아이콘 색상 확장
declare module "@mui/material/SvgIcon" {
  interface SvgIconPropsColorOverrides {
    black: true;
  }
}

// 공통 팔레트 값
const commonPalette = {
  primary: {
    main: "#3288ff",
  },
  success: {
    main: "#19df79",
  },
};

// 공통 타이포그래피
const typography = {
  fontFamily: ["Pretendard-Regular", "Noto Sans KR", "sans-serif"].join(","),
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 700 },
  h5: { fontWeight: 700 },
  h6: { fontWeight: 700 },
};

// 공통 컴포넌트 스타일
const getComponents = (mode: PaletteMode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: mode === "dark" ? "#1f1f1f" : "#ffffff",
        transition: "background-color 0.3s ease, color 0.3s ease",
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderWidth: 1.2,
        borderRadius: "50px",
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      arrow: true,
    },
    styleOverrides: {
      tooltip: {
        fontSize: "0.9rem",
      },
    },
  },
  MuiTypography: {
    styleOverrides: {
      root: {
        wordBreak: "keep-all" as const,
      },
    },
  },
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: "24px !important",
        paddingRight: "24px !important",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
        transition: "background-color 0.3s ease",
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundImage: "none",
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        backgroundImage: "none",
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
});

// 라이트 테마 생성
export const createLightTheme = () =>
  responsiveFontSizes(
    createTheme({
      palette: {
        mode: "light",
        ...commonPalette,
        secondary: {
          main: "#f6f6f6",
        },
        info: {
          main: "#fff",
        },
        black: {
          main: "#404040",
        },
        divider: "#797979",
        text: {
          primary: "#404040",
          secondary: "#797979",
        },
        background: {
          default: "#ffffff",
          paper: "#ffffff",
        },
      },
      typography,
      components: getComponents("light"),
    })
  );

// 다크 테마 생성 (VS Code Dark Modern 기반)
export const createDarkTheme = () =>
  responsiveFontSizes(
    createTheme({
      palette: {
        mode: "dark",
        ...commonPalette,
        secondary: {
          main: "#313131",
        },
        info: {
          main: "#2d2d2d",
        },
        black: {
          main: "#cccccc",
        },
        divider: "#454545",
        text: {
          primary: "#cccccc",
          secondary: "#9d9d9d",
        },
        background: {
          default: "#1f1f1f",
          paper: "#2d2d2d",
        },
      },
      typography,
      components: getComponents("dark"),
    })
  );

// 기본 내보내기 (라이트 테마) - 기존 코드 호환성 유지
export const theme = createTheme({
  colorSchemes: {
    light: createLightTheme(),
    dark: createDarkTheme(),
  },
});
