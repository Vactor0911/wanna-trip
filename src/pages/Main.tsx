import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import MainImage1 from "../assets/images/main1.png";
import MainImage2 from "../assets/images/main2.png";
import { theme } from "../utils/theme";
import { useCallback } from "react";
import { useNavigate } from "react-router";

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
          <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

          {/* 소개 */}
          <Stack gap={10} mt={7}>


            {/* 두번째 장 */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={{ xs: 8, md: 3 }}
              sx={{
                position: 'relative',
                minHeight: { xs: 'auto', md: PAGE_HEIGHT },
              }}
            >
              {/* 왼쪽: 소제목, 제목 */}
              <Box
                flex={{ xs: "none", md: 1.2 }}
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                minWidth={200}
              >
                <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 600, mb: 1 }}>
                  계획
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, whiteSpace: "pre-line" }}>
                  {`내 계획 관리,\n일정부터 준비물까지\n완벽하게`}
                </Typography>
              </Box>
              {/* 가운데: 이미지 한 장 (Stack 기준 수직 중앙) */}
              <Box
                flex={{ xs: "none", md: 2 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                alignSelf="center"
              >
                <Box
                  component="img"
                  src={MainImage1}
                  alt="계획 카드 예시"
                  sx={{
                    width: { xs: '100%', md: '90%' },
                  }}
                />
              </Box>
              {/* 오른쪽: 설명 리스트 */}
              <Box
                flex={{ xs: "none", md: 1 }}
                display="flex"
                alignItems={{ xs: "flex-start", md: "flex-end" }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>1. 이번 주 일정 한눈에</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>여행, 약속, 해야 할 일까지 하루하루의 계획을 깔끔하게 정리해보세요.</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>2. 다가오는 일정 미리 알림</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>중요한 계획을 깜빡하지 않게! 날짜가 가까워질수록 알림으로 챙겨드려요.</Typography>
                </Box>
              </Box>
            </Stack>

            {/* 세번째 장 */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={{ xs: 10, md: 3 }}
              sx={{
                position: 'relative',
                minHeight: { xs: 'auto', md: PAGE_HEIGHT },
              }}
            >
              {/* 왼쪽: 소제목, 제목 */}
              <Box
                flex={{ xs: "none", md: 1.2 }}
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                minWidth={200}
              >
                <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 600, mb: 1 }}>
                  계획
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, whiteSpace: "pre-line" }}>
                  {`내 계획 관리,\n일정부터 준비물까지\n완벽하게`}
                </Typography>
              </Box>
              {/* 가운데: 이미지 한 장 (Stack 기준 수직 중앙) */}
              <Box
                flex={{ xs: "none", md: 2 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                alignSelf="center"
              >
                <Box
                  component="img"
                  src={MainImage1}
                  alt="계획 카드 예시"
                  sx={{
                    width: { xs: '100%', md: '90%' },
                  }}
                />
              </Box>
              {/* 오른쪽: 설명 리스트 */}
              <Box
                flex={{ xs: "none", md: 1 }}
                display="flex"
                alignItems={{ xs: "flex-start", md: "flex-end" }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>1. 이번 주 일정 한눈에</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>여행, 약속, 해야 할 일까지 하루하루의 계획을 깔끔하게 정리해보세요.</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>2. 다가오는 일정 미리 알림</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>중요한 계획을 깜빡하지 않게! 날짜가 가까워질수록 알림으로 챙겨드려요.</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>1. 이번 주 일정 한눈에</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>여행, 약속, 해야 할 일까지 하루하루의 계획을 깔끔하게 정리해보세요.</Typography>
                </Box>
              </Box>
            </Stack>

          </Stack>

        </Stack>
      </Container>
    </Box>
  );
};

export default Main;
