import {
  Box,
  Button,
  Container,
  keyframes,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlaneIcon from "../../assets/icons/plane.svg";
import { useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import { wannaTripLoginStateAtom } from "../../state";
import { useCallback, useEffect, useRef, useState } from "react";
import useThemeMode from "../../hooks/theme";

import Day1Light from "../../assets/images/day1_light.webp";
import Day2Light from "../../assets/images/day2_light.webp";
import Day1Dark from "../../assets/images/day1_dark.webp";
import Day2Dark from "../../assets/images/day2_dark.webp";

// 비행기 통통 튀는 애니메이션
const planeBounceAnimation = keyframes`
  0% {
    transform: translate(-50%, -70%);
  }
  50% {
    transform: translate(-50%, -30%);
  }
  100% {
    transform: translate(-50%, -70%);
  }
`;

const MainSection = () => {
  const theme = useTheme();
  const { themeMode } = useThemeMode();
  const navigate = useNavigate();

  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootHeight, setRootHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (rootRef.current) {
        setRootHeight(rootRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // 바로 시작하기 버튼 클릭
  const handleStartButtonClick = useCallback(() => {
    if (wannaTripLoginState.isLoggedIn) {
      navigate("/template");
      return;
    }

    navigate("/login");
  }, [navigate, wannaTripLoginState.isLoggedIn]);

  return (
    <>
      <Box ref={rootRef} width="100%" top={0} left={0} position="absolute">
        {/* 그라데이션 배경 */}
        {[
          "linear-gradient(180deg, #ffffff 0%, #A2C9FF 100%)",
          "linear-gradient(180deg, #1f1f1f 0%, #5A8DC9 100%)",
        ].map((background, index) => (
          <Box
            key={`main-section-background-${index}`}
            width="100%"
            height="100%"
            position="absolute"
            top={0}
            left={0}
            sx={{
              opacity: Math.abs(index - (themeMode === "light" ? 1 : 0)),
              background: background,
              borderBottomLeftRadius: "50% max(calc(20vh - 80px), 30px)",
              borderBottomRightRadius: "50% max(calc(20vh - 80px), 30px)",
              transition: "opacity 0.3s ease",
            }}
          />
        ))}

        {/* 메인 컨텐츠 */}
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 80px)",
            position: "sticky",
            top: "0",
            "@media (max-width: 900px) and (orientation: landscape)": {
              position: "relative",
            },
          }}
        >
          <Stack
            direction="row"
            gap={5}
            justifyContent="space-between"
            pt={25}
            pb={15}
            position="relative"
            sx={{
              "@media (max-width: 900px) and (orientation: landscape)": {
                pt: 15,
                pb: 0,
              },
            }}
          >
            {/* 좌측 컨테이너 */}
            <Stack alignItems="flex-start">
              {/* Trip AI 배지 */}
              <Stack
                direction="row"
                alignItems="center"
                border={`4px solid ${theme.palette.primary.main}`}
                borderRadius="50px"
                p={0.5}
                px={3}
                gap={1}
              >
                <AutoAwesomeRoundedIcon color="primary" />
                <Typography variant="h5" color="primary">
                  TRIP AI
                </Typography>
              </Stack>

              {/* 슬로건 */}
              <Typography
                variant="h2"
                mt={3}
                sx={{
                  "@media (max-width: 900px) and (orientation: landscape)": {
                    fontSize: "2rem",
                  },
                }}
              >
                세상에서 제일{" "}
                <span css={{ color: theme.palette.primary.main }}>
                  간단한 계획서
                </span>
                는
                <br />
                <span css={{ color: theme.palette.primary.main }}>
                  여행갈래
                </span>
                로 시작!
              </Typography>

              {/* 바로 시작하기 버튼 */}
              <Stack justifyContent="space-evenly" flex={1}>
                <Button
                  variant="contained"
                  sx={{
                    p: 2.5,
                    px: 4,
                    mt: {
                      xs: 7,
                      sm: 10,
                      md: 0,
                    },
                    borderRadius: 3,
                    "& .MuiSvgIcon-root": { fontSize: "32px !important" },
                  }}
                  endIcon={<ArrowForwardRoundedIcon fontSize="large" />}
                  onClick={handleStartButtonClick}
                >
                  <Typography
                    variant="h5"
                    mr={10}
                    sx={{
                      "@media (max-width: 900px) and (orientation: landscape)":
                        {
                          mr: 3,
                        },
                    }}
                  >
                    바로 시작하기
                  </Typography>
                </Button>

                {/* 여백용 요소 */}
                <Box />
              </Stack>
            </Stack>

            {/* 우측 컨테이너 */}
            <Stack
              display={{
                xs: "none",
                lg: "flex",
              }}
              direction="row"
              alignItems="center"
              gap={5}
            >
              {[
                [Day1Light, Day1Dark],
                [Day2Light, Day2Dark],
              ].map((imageSet, index) => (
                <Paper
                  key={`main-section-image-${index}`}
                  elevation={5}
                  sx={{
                    display: "flex",
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Box
                    component="img"
                    src={imageSet[0]}
                    width="280px"
                    sx={{
                      opacity: themeMode === "light" ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}
                  />
                  <Box
                    component="img"
                    src={imageSet[1]}
                    width="100%"
                    height="100%"
                    position="absolute"
                    top={0}
                    left={0}
                    sx={{
                      opacity: themeMode !== "light" ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}
                  />
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Container>

        {/* 아래로 볼록한 곡선 여백 */}
        <Box height="20vh" />

        {/* 비행기 아이콘 */}
        <Box
          component="img"
          src={PlaneIcon}
          draggable={false}
          width={{
            xs: "50px",
            md: "80px",
          }}
          position="sticky"
          bottom={0}
          left="50%"
          sx={{
            transform: "translateX(-50%)",
            color: "white",
            animation: `${planeBounceAnimation} 1s ease-in-out infinite`,
          }}
        />
      </Box>

      <Box height={rootHeight ?? "calc(100vh - 80px + 20vh)"} />
    </>
  );
};

export default MainSection;
