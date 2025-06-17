import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  TypographyProps,
  useTheme,
} from "@mui/material";
import MainImage1 from "../assets/images/main1.png";
import MainImage2 from "../assets/images/main2.png";
import { ReactNode, useCallback } from "react";
import { useNavigate } from "react-router";
import Marquee from "react-fast-marquee";
import MockupPhone from "../assets/images/mockup_phone.png";
import MockupTablet from "../assets/images/mockup_tablet.png";
import MockupPC from "../assets/images/mockup_pc.png";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import { motion } from "framer-motion";

// COMMUNITY 데이터
const communityData = [
  {
    icon: AutoAwesomeRoundedIcon,
    title: "인기 게시글",
    description:
      "요즘 인기 여행글, 궁금하시죠?\n다양한 여행 아이디어가 담긴 인기 게시글을 모아 보여드려요.",
  },
  {
    icon: QuestionAnswerRoundedIcon,
    title: "댓글 관리",
    description: "댓글을 한눈에 관리하고, 알림으로 소통을 이어나가세요.",
  },
  {
    icon: ShareRoundedIcon,
    title: "소식 공유",
    description:
      "여행 계획을 공유하며 새로운 아이디어와 다양한 템플릿을 함께 나눌 수 있어요.",
  },
];

// 스크롤 애니메이션 container
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.75,
      staggerDirection: 1,
    },
  },
};

const MotionContainer = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    variants={containerVariants}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
);

// 스크롤 애니메이션 wrapper
const MotionWrapper = ({
  children,
  direction,
  initialOffset,
}: {
  children: ReactNode;
  direction?: "x" | "y";
  initialOffset?: number;
}) => (
  <motion.div
    variants={{
      hidden: { [direction || "y"]: [initialOffset || -50], opacity: 0 },
      show: {
        [direction || "y"]: 0,
        opacity: 1,
      },
    }}
    transition={{
      duration: 1,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

// 반응형 타이포그래피 컴포넌트
interface ResponsiveTypographyProps extends TypographyProps {
  step?: number;
}

const ResponsiveTypography = (props: ResponsiveTypographyProps) => {
  const { variant, sx, step = 1, ...others } = props;
  const theme = useTheme();

  const dictVariant: Record<string, number> = {
    h1: 7,
    h2: 6,
    h3: 5,
    h4: 4,
    h5: 3,
    h6: 2,
    subtitle1: 1,
    subtitle2: 0,
  };

  const getSmallerVariant = (variant: string | undefined, step: number) => {
    const variantIndex = dictVariant[variant || "subtitle2"];
    const smallerIndex = Math.max(variantIndex - step, 0);
    return Object.keys(dictVariant).find(
      (key) => dictVariant[key] === smallerIndex
    );
  };

  const getVariantFontSize = (variant: string | undefined) => {
    switch (variant) {
      case "h1":
        return theme.typography.h1.fontSize;
      case "h2":
        return theme.typography.h2.fontSize;
      case "h3":
        return theme.typography.h3.fontSize;
      case "h4":
        return theme.typography.h4.fontSize;
      case "h5":
        return theme.typography.h5.fontSize;
      case "h6":
        return theme.typography.h6.fontSize;
      case "subtitle1":
        return theme.typography.subtitle1.fontSize;
      case "subtitle2":
        return theme.typography.subtitle2.fontSize;
      default:
        return undefined;
    }
  };

  return (
    <Typography
      variant={variant}
      sx={{
        fontSize: {
          xs: getVariantFontSize(getSmallerVariant(variant, step)),
          md: getVariantFontSize(variant),
        },
        ...sx,
      }}
      {...others}
    />
  );
};

const Main = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // 시작하기 버튼 클릭
  const handleStartButtonClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <Container maxWidth="xl">
      <Stack
        sx={{
          "& .MuiTypography-root": {
            textWrap: "pretty",
          },
        }}
        gap="20vh"
      >
        {/* 첫번째 장 */}
        <MotionContainer>
          <Stack
            minHeight="calc(100vh - 82px)"
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
              <MotionWrapper direction="x">
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
              </MotionWrapper>

              {/* 내용 */}
              <MotionWrapper direction="x">
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
              </MotionWrapper>
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
        </MotionContainer>

        {/* 구분선 */}
        <Divider />

        {/* 두번째 장 */}
        <MotionContainer>
          <Stack minHeight="100vh" py={5} pb={10} gap={10}>
            <MotionWrapper>
              {/* 슬로건 */}
              <Stack>
                <ResponsiveTypography color="primary" variant="h4" mb={1}>
                  PLAN
                </ResponsiveTypography>
                <ResponsiveTypography variant="h3">
                  여행의 설렘을 그리는 계획에서
                </ResponsiveTypography>
                <ResponsiveTypography variant="h3">
                  새로운 세상을 만나는 여행까지
                </ResponsiveTypography>
              </Stack>
            </MotionWrapper>

            {/* 목업 이미지 */}
            <Marquee autoFill={true}>
              <Stack
                direction="row"
                alignItems="center"
                gap={{
                  xs: 4,
                  md: 15,
                }}
                mx={{
                  xs: 2,
                  md: 7.5,
                }}
              >
                {/* 모바일 사진 */}
                <Box
                  component="img"
                  src={MockupPhone}
                  alt="스마트폰 목업"
                  height="40vh"
                />
                {/* 태블릿 사진 */}
                <Box
                  component="img"
                  src={MockupTablet}
                  alt="태블릿 목업"
                  height="40vh"
                />
                {/* PC 사진 */}
                <Box
                  component="img"
                  src={MockupPC}
                  alt="PC 목업"
                  height="40vh"
                />
              </Stack>
            </Marquee>

            <Box my="auto" py={3}>
              <MotionWrapper>
                <ResponsiveTypography variant="h2" textAlign="center">
                  여러 환경에서 계획을{" "}
                  <span style={{ color: theme.palette.primary.main }}>
                    쉽고 스마트
                  </span>
                  하게
                </ResponsiveTypography>
              </MotionWrapper>
            </Box>
          </Stack>
        </MotionContainer>

        {/* 구분선 */}
        <Divider />

        {/* 세번째 장 */}
        <MotionContainer>
          <Stack
            minHeight="100vh"
            py={5}
            pb={10}
            gap={10}
            justifyContent={"space-between"}
          >
            {/* 슬로건 */}
            <MotionWrapper>
              <Stack>
                <ResponsiveTypography color="primary" variant="h4" mb={1}>
                  COMMUNITY
                </ResponsiveTypography>
                <ResponsiveTypography variant="h3">
                  재밌었던 나만의 경험을
                </ResponsiveTypography>
                <ResponsiveTypography variant="h3">
                  다른 사람과의 소통으로
                </ResponsiveTypography>
              </Stack>
            </MotionWrapper>

            {/* 인기 게시글 */}
            <Container maxWidth="md">
              <Stack
                justifyContent="space-between"
                gap={{
                  xs: 3,
                  sm: 0,
                }}
              >
                {communityData.map((item, index) => (
                  <Box
                    key={`community-${index}`}
                    width={{
                      xs: "75%",
                      sm: "50%",
                      md: "30%",
                    }}
                    alignSelf={index % 2 === 0 ? "flex-start" : "flex-end"}
                  >
                    <MotionWrapper
                      direction="x"
                      initialOffset={index % 2 === 0 ? -50 : 50}
                    >
                      <Stack
                        alignItems={index % 2 === 0 ? "flex-start" : "flex-end"}
                        gap={1}
                      >
                        <item.icon
                          color="primary"
                          sx={{
                            fontSize: "8rem",
                          }}
                        />
                        <ResponsiveTypography variant="h3">
                          {item.title}
                        </ResponsiveTypography>
                        <ResponsiveTypography
                          variant="h5"
                          color="text.secondary"
                          textAlign={index % 2 === 0 ? "left" : "right"}
                        >
                          {item.description.split("\n").map((line, i) => (
                            <span key={`description-${index}-${i}`}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </ResponsiveTypography>
                      </Stack>
                    </MotionWrapper>
                  </Box>
                ))}
              </Stack>
            </Container>
          </Stack>
        </MotionContainer>

        {/* 구분선 */}
        <Divider />

        {/* 네번째 장 */}
        <MotionContainer>
          <Stack
            minHeight="100vh"
            py={10}
            gap={10}
            justifyContent="center"
            alignItems="center"
          >
            {/* 슬로건 */}
            <MotionWrapper>
              <ResponsiveTypography variant="h2">
                여행은{" "}
                <span style={{ color: theme.palette.primary.main }}>
                  여행갈래
                </span>
                와 같이
              </ResponsiveTypography>
            </MotionWrapper>

            {/* 내용 */}
            <MotionWrapper>
              <Stack gap={0.5}>
                <ResponsiveTypography
                  variant="h4"
                  textAlign="center"
                  color="text.secondary"
                >
                  계획, 혼자 막막하시죠?
                </ResponsiveTypography>
                <ResponsiveTypography
                  variant="h4"
                  textAlign="center"
                  color="text.secondary"
                >
                  계획부터 관리까지
                </ResponsiveTypography>
                <ResponsiveTypography
                  variant="h4"
                  textAlign="center"
                  color="text.secondary"
                >
                  <span style={{ color: theme.palette.primary.main }}>
                    여행갈래
                  </span>
                  로 시작하세요.
                </ResponsiveTypography>
              </Stack>
            </MotionWrapper>

            {/* 시작하기 버튼 */}
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
          </Stack>
        </MotionContainer>
      </Stack>
    </Container>
  );
};

export default Main;
