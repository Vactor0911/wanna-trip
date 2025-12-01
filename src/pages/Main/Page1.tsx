import {
  Box,
  Button,
  Container,
  keyframes,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlaneIcon from "../../assets/icons/plane.svg";

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

const Page1 = () => {
  const theme = useTheme();

  return (
    <>
      <Box
        width="100%"
        sx={{
          position: "absolute",
          top: "0",
          background: "linear-gradient(180deg, #FFFFFF 0%, #A2C9FF 100%)",
          borderBottomLeftRadius: "50% calc(20vh - 80px)",
          borderBottomRightRadius: "50% calc(20vh - 80px)",
        }}
      >
        {/* 메인 컨텐츠 */}
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 80px)",
            position: "sticky",
            top: "0",
          }}
        >
          <Stack
            direction="row"
            gap={5}
            justifyContent="space-between"
            pt={20}
            position="relative"
          >
            {/* 좌측 컨테이너 */}
            <Stack alignItems="flex-start" gap={2} py={5}>
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
              <Typography variant="h2">
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
              <Stack flex={1} justifyContent="space-around">
                <Button
                  variant="contained"
                  sx={{
                    p: 2.5,
                    px: 4,
                    borderRadius: 3,
                    "& .MuiSvgIcon-root": { fontSize: "1.75rem" },
                  }}
                  endIcon={<ArrowForwardRoundedIcon fontSize="large" />}
                >
                  <Typography variant="h5" mr={10}>
                    바로 시작하기
                  </Typography>
                </Button>

                {/* 여백용 요소 */}
                <Box />
              </Stack>
            </Stack>

            {/* 우측 컨테이너 */}
            <Stack direction="row" alignItems="center" gap={5}>
              {/* TODO: 샘플 이미지 요소를 실제 이미지로 교체 */}
              {Array.from({ length: 2 }).map((_, index) => (
                <Box
                  key={`page1-image-${index}`}
                  width="250px"
                  height="60vh"
                  bgcolor="blue"
                />
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
          width="80px"
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

      <Box height="calc(100vh - 80px + 20vh)" />
    </>
  );
};

export default Page1;
