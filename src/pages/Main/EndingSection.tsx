import { Button, Container, Stack, Typography, useTheme } from "@mui/material";
import Pages from "../../assets/images/pages.webp";
import { useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { wannaTripLoginStateAtom } from "../../state";

const EndingSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);

  // 바로 시작하기 버튼 클릭
  const handleStartButtonClick = useCallback(() => {
    if (wannaTripLoginState.isLoggedIn) {
      navigate("/template");
      return;
    }

    navigate("/login");
  }, [navigate, wannaTripLoginState.isLoggedIn]);

  return (
    <Stack minHeight="100vh" justifyContent="center" py={7}>
      <Stack
        minHeight="70vh"
        position="relative"
        overflow="hidden"
        py={3}
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
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: 3,
          }}
        >
          <Typography variant="h3" color="white">
            <span
              css={{
              color: theme.palette.primary.light,
              textShadow:
                "0 0 30px rgba(0, 0, 0, 1), 0 4px 8px rgba(0, 0, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.8)",
              }}
            >
              여행갈래
            </span>
            로 계획하는 완벽한 여행
          </Typography>

          <Typography variant="h5" mt={2} color="white">
            당신의 특별한 여정을 지금 시작해 보세요
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
            onClick={handleStartButtonClick}
          >
            <Typography variant="h5">바로 시작하기</Typography>
          </Button>
        </Container>
      </Stack>
    </Stack>
  );
};

export default EndingSection;
