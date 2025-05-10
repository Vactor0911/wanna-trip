import { theme } from "../utils/index";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Intro = () => {
  const navigate = useNavigate();

  return (
    <Stack>
      <Stack
        direction={{ xs: "column", sm: "column" , md: "row" }}
        alignItems={{ xs: "start", sm: "start", md: "center" }}
        sx={{
          pt: { xs: 3, sm: 10, md: 13 },
        }}
      >
        <Stack gap={{ xs: 2, sm: 5, md: 8 }}>
          <Stack>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "7vw", sm: "2.8rem", md: "3.7rem" },
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              세상에서 제일{" "}
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                  fontSize: "inherit",
                }}
              >
                간단한 계획서
              </Box>
              는
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "7vw", sm: "3rem", md: "3.7rem" },
                fontWeight: 700,
                lineHeight: 1.3,
                whiteSpace: { xs: "normal", md: "nowrap" },
              }}
            >
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                  fontSize: "inherit",
                }}
              >
                여행갈래
              </Box>
              로 시작!
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "3.5vw", sm: "1.3rem", md: "1.4rem" },
                fontWeight: 600,
              }}
            >
              여행 계획을 더욱 빠르고 스마트하게 템플릿으로 만들어보세요!
            </Typography>
          </Stack>

          <Button
            variant="contained"
            sx={{
              width: { xs: "40vw", sm: "30vw", md: "25vw" },
              height: { xs: "3.5em", sm: "3.5em", md: "4em" },
              borderRadius: "15px",
              fontSize: { xs: "1.2em", sm: "1.5em", md: "1.8em" },
              fontWeight: "600",
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            바로 시작하기
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Intro;
