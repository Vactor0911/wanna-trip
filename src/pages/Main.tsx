import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import MainImage1 from "../assets/images/main1.png";
import MainImage2 from "../assets/images/main2.png";
import { theme } from "../utils/theme";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import Informations from "../components/Informations";

const PAGE_HEIGHT = "calc(100vh - 82px)";

const Main = () => {
  const navigate = useNavigate();

  // 시작하기 버튼 클릭
  const handleStartButtonClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <Box height={PAGE_HEIGHT} overflow="auto">
      <Container maxWidth="xl">
        <Stack>
          {/* 첫번째 장 */}
          <Stack
            height={PAGE_HEIGHT}
            py={5}
            gap={3}
            justifyContent="space-evenly"
            alignItems={{
              xs: "center",
              md: "flex-start",
            }}
            position="relative"
          >
            {/* 사진 */}
            <Box
              width={{
                xs: "200px",
                sm: "250px",
                md: "300px",
                lg: "400px",
              }}
              position={{
                xs: "relative",
                md: "absolute",
              }}
              bottom={{
                xs: 0,
                md: "10%",
              }}
              right={0}
              sx={{
                aspectRatio: "1/1",
              }}
            >
              {[MainImage1, MainImage2].map((image, index) => (
                <Paper
                  elevation={3}
                  key={`main-image-${index}`}
                  sx={{
                    width: "90%",
                    aspectRatio: "1/1",
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    borderRadius: 5,
                    position: "absolute",
                    bottom: index === 0 ? 0 : "10%",
                    left: index === 0 ? 0 : "10%",
                    zIndex: index === 0 ? 1 : 0,
                  }}
                />
              ))}
            </Box>

            {/* 슬로건 */}
            <Stack gap={1} alignItems="flex-start">
              {/* 첫번째 줄 */}
              <Typography
                variant="h2"
                sx={{
                  fontSize: {
                    xs: theme.typography.h6.fontSize,
                    sm: theme.typography.h3.fontSize,
                    md: theme.typography.h2.fontSize,
                    lg: theme.typography.h1.fontSize,
                  },
                }}
              >
                세상에서 제일{" "}
                <Box
                  component="span"
                  sx={{ color: theme.palette.primary.main }}
                >
                  간단한 계획서
                </Box>
                는
              </Typography>

              {/* 두번째 줄 */}
              <Typography
                variant="h2"
                sx={{
                  fontSize: {
                    xs: theme.typography.h6.fontSize,
                    sm: theme.typography.h3.fontSize,
                    md: theme.typography.h2.fontSize,
                    lg: theme.typography.h1.fontSize,
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{ color: theme.palette.primary.main }}
                >
                  여행갈래
                </Box>
                로 시작!
              </Typography>

              {/* 세번째 줄 */}
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
              >
                {["여행 계획을 더욱 빠르고 스마트하게", "만들어보세요 !"].map(
                  (text, index) => (
                    <Typography
                      variant="h5"
                      color="black"
                      display="inline-block"
                      whiteSpace="nowrap"
                      key={`main-slogan-${index}`}
                      sx={{
                        fontSize: {
                          xs: theme.typography.subtitle1.fontSize,
                          md: theme.typography.h6.fontSize,
                          lg: theme.typography.h5.fontSize,
                        },
                      }}
                    >
                      {text}
                    </Typography>
                  )
                )}
              </Stack>
            </Stack>

            {/* 시작하기 버튼 */}
            <Box>
              <Button
                variant="contained"
                onClick={handleStartButtonClick}
                sx={{
                  py: {
                    xs: 2,
                    md: 3,
                  },
                  px: {
                    xs: 5,
                    md: 9,
                  },
                  borderRadius: 3,
                }}
              >
                <Typography variant="h5" color="white">
                  바로 시작하기
                </Typography>
              </Button>
            </Box>
          </Stack>

          {/* 구분선 */}
          <Box my={4} height="100%" border="1px solid #D9D9D9" />

          {/* Informations 컴포넌트 예시 2개 */}
          <Stack gap={4} height={PAGE_HEIGHT}>
            {/* 두번째 장 */}
            <Informations
              subtitle="계획"
              title={`내 계획 관리,\n일정부터 준비물까지\n완벽하게`}
              rightContent={
                <Stack>
                  <Typography>필요한 준비물 자동 정리</Typography>
                  <Typography>친구와 계획 공유</Typography>
                </Stack>
              }
            />
            {/* 세번째 장 */}
            <Informations
              subtitle="추천"
              title={`여행지 추천,\n맞춤 일정 제안`}
              rightContent={
                <Stack>
                  <Typography>취향 기반 여행지 추천</Typography>
                  <Typography>AI가 짜주는 일정</Typography>
                </Stack>
              }
            />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Main;
