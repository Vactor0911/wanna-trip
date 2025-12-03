import {
  Box,
  ButtonBase,
  Container,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useRef, useState } from "react";

const TRANSITION_DURATION = "0.3s";

interface PresentationSectionProps {
  title: string;
  subTitle: string;
  description: string | React.ReactNode;
  options: Array<{
    title: string;
    description: string;
    videoSrc: string;
  }>;
}

const PresentationSection = (props: PresentationSectionProps) => {
  const { title, subTitle, description, options } = props;

  const theme = useTheme();

  const [slide, setSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  // 슬라이드 선택 버튼 클릭
  const handleSlideSelect = useCallback((index: number) => {
    setSlide(index);
  }, []);

  return (
    <Container maxWidth="xl">
      <Stack
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
            {title}
          </Typography>

          {/* 슬로건 */}
          <Typography variant="h3">{subTitle}</Typography>

          {/* 설명 */}
          <Typography variant="h5" color="text.secondary">
            {description}
          </Typography>

          {/* 전환 리스트 */}
          <Stack
            display={{
              xs: "none",
              md: "flex",
            }}
            gap={3}
            mt={5}
          >
            {options.map((option, index) => (
              <ButtonBase
                key={`${title}-slide-${index}`}
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
                    bgcolor:
                      index === slide ? "background.paper" : "transparent",
                    overflow: "hidden",
                    position: "relative",
                    transition: `box-shadow ${TRANSITION_DURATION} ease-in-out`,
                    "&:before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: `${index === slide ? videoProgress : 0}%`,
                      height: "4px",
                      bgcolor: theme.palette.primary.main,
                      borderRadius: "50px",
                      opacity: index === slide ? 1 : 0,
                      transition: `opacity ${TRANSITION_DURATION} ease-in-out, width 0.5s ease-out`,
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
                    <Typography variant="h5">{option.title}</Typography>

                    {/* 설명 */}
                    <Typography variant="body1">
                      {option.description}
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
            src={options[slide].videoSrc}
            ref={videoRef}
            width={{
              xs: "90vw",
              md: "40vw",
            }}
            height={{
              xs: "90vw",
              md: "40vw",
            }}
            maxWidth="60vh"
            maxHeight="60vh"
            autoPlay
            muted
            onEnded={() => {
              setTimeout(() => {
                handleSlideSelect((slide + 1) % options.length);
              }, 1000);
            }}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              setVideoProgress((video.currentTime / video.duration) * 100);
            }}
            borderRadius={5}
            css={{
              boxShadow: `0px 3px 5px -1px rgba(0,0,0,0.2),
                0px 5px 8px 0px rgba(0,0,0,0.14),
                0px 1px 14px 0px rgba(0,0,0,0.12)`,
            }}
          />

          {/* 페이지네이션 */}
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
            px={1.5}
          >
            {options.map((_, index) => (
              <ButtonBase
                key={`$${title}-pagination-${index}`}
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
                      width: `${index === slide ? videoProgress : 0}%`,
                      height: "100%",
                      borderRadius: "50px",
                      bgcolor:
                        index === slide
                          ? theme.palette.primary.main
                          : "transparent",
                      transition: `background-color ${TRANSITION_DURATION} ease-in-out, width 0.5s ease-out`,
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
