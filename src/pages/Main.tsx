import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  TypographyProps,
  useMediaQuery,
} from "@mui/material";
import MainImage1 from "../assets/images/main1.png";
import MainImage2 from "../assets/images/main2.png";
import { theme } from "../utils/theme";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

interface ImagePaperProps {
  src: string;
}

const ImagePaper = ({ src }: ImagePaperProps) => {
  return (
    <Paper
      elevation={3}
      sx={{
        width: {
          xs: "250px",
          sm: "300px",
          lg: "350px",
          xl: "400px",
        },
        aspectRatio: "1/1",
        borderRadius: "30px",
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        position: "absolute",
        top: "0",
        right: "0",
        transform: {
          xs: "none",
          md: "translateY(-100%)",
        },
      }}
    />
  );
};

const Main = () => {
  const navigate = useNavigate();

  const isMobileScreen = useMediaQuery(theme.breakpoints.down("sm")); // 모바일 화면 여부
  const isTabletScreen = useMediaQuery(theme.breakpoints.down("md")); // 태블릿 화면 여부

  // 슬로건 타이포그래피 variant 속성값
  const titleTypographyVariant = isMobileScreen // 제목 타이포그래피
    ? "h5"
    : isTabletScreen
    ? "h3"
    : "h2";
  const subtitleTypographyVariant = isMobileScreen // 부제목 타이포그래피
    ? "subtitle2"
    : isTabletScreen
    ? "h6"
    : "h5";

  // 슬로건 타이포그래피
  const SloganTypography = useMemo(() => {
    return (props: TypographyProps, isSubtitle = false) => {
      const { children, ...others } = props;

      const variant = isSubtitle
        ? subtitleTypographyVariant
        : titleTypographyVariant;

      return (
        <Typography
          variant={variant}
          {...others}
          sx={{
            wordBreak: "keep-all",
            whiteSpace: "nowrap",
          }}
        >
          {children}
        </Typography>
      );
    };
  }, [subtitleTypographyVariant, titleTypographyVariant]);

  // 시작하기 버튼 클릭
  const handleStartButtonClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <Stack
      height="calc(100vh - 82px)"
      paddingTop={{
        xs: "40px",
        md: "0",
      }}
      justifyContent="space-evenly"
      alignItems={{
        xs: "center",
        md: "flex-start",
      }}
      position="relative"
    >
      {/* 사진 */}
      {isMobileScreen || isTabletScreen ? (
        <Stack
          height={{
            xs: "250px",
            sm: "300px",
          }}
          alignItems="center"
          position="relative"
        >
          <Box
            width={{
              xs: "250px",
              sm: "300px",
            }}
            position="relative"
          >
            <ImagePaper src={MainImage1} />
            <Box position="absolute" bottom="40px" right="-40px" zIndex={-1}>
              <ImagePaper src={MainImage2} />
            </Box>
          </Box>
        </Stack>
      ) : (
        <Box position="absolute" bottom="100px" right="40px" zIndex={-1}>
          <ImagePaper src={MainImage1} />
          <Box position="absolute" bottom="40px" right="-40px" zIndex={-1}>
            <ImagePaper src={MainImage2} />
          </Box>
        </Box>
      )}

      {/* 슬로건 */}
      <Stack gap={1}>
        {/* 첫번째 줄 */}
        <Stack direction="row" flexWrap="wrap">
          <SloganTypography>세상에서 제일</SloganTypography>
          <Stack direction="row">
            <SloganTypography color="primary" ml="0.25em">
              간단한 계획서
            </SloganTypography>
            <SloganTypography>는</SloganTypography>
          </Stack>
        </Stack>

        {/* 두번째 줄 */}
        <Stack direction="row" flexWrap="wrap">
          <SloganTypography color="primary">여행갈래</SloganTypography>
          <SloganTypography>로 시작!</SloganTypography>
        </Stack>

        {/* 세번째 줄 */}
        <Stack direction="row">
          <Typography
            variant={subtitleTypographyVariant}
            sx={{
              color: theme.palette.black.main,
            }}
          >
            여행 계획을 더욱 빠르고 스마트하게 템플릿으로 만들어보세요!
          </Typography>
        </Stack>
      </Stack>

      {/* 시작하기 버튼 */}
      <Box>
        <Button
          variant="contained"
          size="large"
          onClick={handleStartButtonClick}
          sx={{
            paddingX: 8,
            paddingY: 3,
            borderRadius: "20px",
          }}
        >
          <Typography variant="h5">
            바로 시작하기
          </Typography>
        </Button>
      </Box>
    </Stack>
  );
};

export default Main;
