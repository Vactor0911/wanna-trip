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

const Main = () => {
  const navigate = useNavigate();

  // 시작하기 버튼 클릭
  const handleStartButtonClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <Container maxWidth="xl">
      <Stack height="calc(100vh - 82px)">
        {/* 첫번째 장 */}
        <Stack
          height="100%"
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
              <Box component="span" sx={{ color: theme.palette.primary.main }}>
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
              <Box component="span" sx={{ color: theme.palette.primary.main }}>
                여행갈래
              </Box>
              로 시작!
            </Typography>

            {/* 세번쨰 줄 */}
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
      </Stack>
    </Container>
  );
};

export default Main;
