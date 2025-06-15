import { createTheme, responsiveFontSizes } from "@mui/material";

// MUI Palette 확장
declare module "@mui/material/styles" {
  interface Palette {
    black: Palette["primary"];
  }
  interface PaletteOptions {
    black?: PaletteOptions["primary"];
  }
}

// SVG 아이콘 색상 확장
declare module "@mui/material/SvgIcon" {
  interface SvgIconPropsColorOverrides {
    black: true;
  }
}

// MUI 테마
export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#3288ff",
      },
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
      success: {
        main: "#19df79",
      },
    },
    typography: {
      fontFamily: ["Pretendard-Regular", "Noto Sans KR", "sans-serif"].join(
        ","
      ),
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 700,
      },
    },
    components: {
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
            wordBreak: "keep-all",
          },
        },
      },
    },
  })
);
