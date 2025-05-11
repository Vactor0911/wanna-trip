import { createTheme, responsiveFontSizes } from "@mui/material";

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
      divider: "#9f9f9f",
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
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: "black",
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
