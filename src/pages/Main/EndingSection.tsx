import { Button, Stack, Typography, useTheme } from "@mui/material";
import Pages from "../../assets/images/pages.webp";

const EndingSection = () => {
  const theme = useTheme();

  return (
    <Stack height="100vh" justifyContent="center">
      <Stack
        height="70vh"
        position="relative"
        overflow="hidden"
        justifyContent="center"
        alignItems="center"
        gap={3}
        sx={{
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url(${Pages}) no-repeat center center`,
            backgroundSize: "cover",
            filter: "blur(6px) brightness(0.6)",
            zIndex: -1,
          },
        }}
      >
        <Typography variant="h3" color="white">
          <span css={{ color: theme.palette.primary.main }}>여행갈래</span>의
          새로운 계획 시작
        </Typography>

        <Typography variant="h5" mt={2} color="white">
          다양한 서비스와 함께 여러 계획들도 같이 확인해보세요.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{
            p: 3,
            px: 7,
            my: 5,
            borderRadius: 3,
          }}
        >
          <Typography variant="h4">바로 시작하기</Typography>
        </Button>
      </Stack>
    </Stack>
  );
};

export default EndingSection;
