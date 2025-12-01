import {
  Box,
  ButtonBase,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

const TRANSITION_DURATION = "0.3s";

const PresentationSection = () => {
  const theme = useTheme();

  const [slide, setSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 자동 슬라이드 전환
  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % 5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 슬라이드 선택 버튼 클릭
  const handleSlideSelect = useCallback((index: number) => {
    setSlide(index);
  }, []);

  return (
    <Container maxWidth="xl">
      <Stack
        minHeight="100vh"
        py={10}
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems="flex-start"
        gap={5}
      >
        {/* 좌측 컨테이너 */}
        <Stack
          gap={3}
          width={{
            xs: "100%",
            md: "40%",
          }}
        >
          {/* 섹션 헤더 */}
          <Typography variant="h4" color="primary">
            나만의 AI 가이드
          </Typography>

          {/* 슬로건 */}
          <Typography variant="h3">검색보다 빠른 여행 준비</Typography>

          {/* 설명 */}
          <Typography variant="h5" color="text.secondary">
            어디 갈지, 뭘 먹을지 고민할 필요 없이,
            <br />
            AI 챗봇이 당신의 취향을 분석해 최적의 코스를 제안합니다.
          </Typography>

          {/* 전환 리스트 */}
          <Stack
            display={{
              xs: "none",
              md: "flex",
            }}
            gap={1.5}
            mt={5}
            divider={
              <Divider
                orientation="horizontal"
                flexItem
                sx={{
                  borderColor: "grey.300",
                  borderWidth: "1px",
                }}
              />
            }
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <ButtonBase
                key={`slide-${index}`}
                sx={{
                  borderRadius: 1,
                }}
                disabled={index === slide}
                onClick={() => handleSlideSelect(index)}
              >
                <Paper
                  elevation={index === slide ? 5 : 0}
                  sx={{
                    width: "100%",
                    borderRadius: 1,
                    overflow: "hidden",
                    position: "relative",
                    transition: `box-shadow ${TRANSITION_DURATION} ease-in-out`,
                    "&:before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "60%",
                      height: "4px",
                      bgcolor: theme.palette.primary.main,
                      borderRadius: "50px",
                      opacity: index === slide ? 1 : 0,
                      transition: `opacity ${TRANSITION_DURATION} ease-in-out`,
                    },
                  }}
                >
                  <Stack
                    width="100%"
                    gap={1}
                    alignItems="flex-start"
                    p={2}
                    px={3}
                  >
                    {/* 슬라이드 헤더 */}
                    <Typography variant="h5">챗봇 대화</Typography>

                    {/* 설명 */}
                    <Typography variant="body1">
                      AI와 소통을 통해 계획을 간단히 구성해보세요.
                    </Typography>
                  </Stack>
                </Paper>
              </ButtonBase>
            ))}
          </Stack>
        </Stack>

        {/* 우측 컨테이너 */}
        <Stack
          gap={3}
          position="sticky"
          top={`calc(50% - ${(videoRef.current?.clientHeight ?? 0) * 0.5}px)`}
        >
          {/* 비디오 뷰어 */}
          <Box
            component="video"
            ref={videoRef}
            width={{
              xs: "90vw",
              md: "40vw",
            }}
            borderRadius={5}
            boxShadow={5}
            autoPlay
            muted
            loop
          >
            <source
              src={`https://a.slack-edge.com/66e1519/marketing/img/homepage/revamped-24/value-props/hp-vp-ai.ko-KR@2x.webm`}
              type="video/webm"
            />
          </Box>

          {/* 페이지네이션 */}
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
            px={1.5}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <ButtonBase
                key={`pagination-${index}`}
                disabled={index === slide}
                sx={{
                  borderRadius: "50px",
                }}
                onClick={() => handleSlideSelect(index)}
              >
                <Box
                  width={index === slide ? "80px" : "16px"}
                  height="16px"
                  borderRadius="50px"
                  position="relative"
                  bgcolor={theme.palette.action.disabled}
                  overflow="hidden"
                  sx={{
                    "&:before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "60%",
                      height: "100%",
                      borderRadius: "50px",
                      bgcolor:
                        index === slide
                          ? theme.palette.primary.main
                          : "transparent",
                      transition: `background-color ${TRANSITION_DURATION} ease-in-out`,
                    },
                    transition: `width ${TRANSITION_DURATION} ease-in-out`,
                  }}
                />
              </ButtonBase>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default PresentationSection;
