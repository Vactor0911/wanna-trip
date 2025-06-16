import { Box, Paper, PaperProps, Stack, Typography } from "@mui/material";
import { theme } from "../utils/theme";
import { Dayjs } from "dayjs";
import parse from "html-react-parser";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";

// 위치 정보 인터페이스 추가
interface LocationInfo {
  title: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  thumbnailUrl?: string;
}

interface CardProps extends PaperProps {
  content?: string;
  startTime?: Dayjs;
  endTime?: Dayjs;
  isLocked?: boolean; // 카드 잠금 여부
  onClick?: () => void;
  location?: LocationInfo; // 위치 정보 추가
}

const Card = (props: CardProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    content,
    startTime,
    endTime,
    isLocked,
    onClick,
    location,
    ...others
  } = props;

  // 시간 형식 설정
  const formatTime = (time?: Dayjs) => {
    return time ? time.format("HH:mm") : "";
  };

  return (
    <Paper
      onClick={onClick}
      elevation={2}
      sx={{
        width: "100%",
        px: 1,
        cursor: "pointer",
        // 잠금 상태에 따라 테두리 스타일 변경
        border: `2px solid transparent`,
        "&:hover": {
          border: `2px solid ${theme.palette.primary.main}`,
        },
      }}
      {...others}
    >
      <Stack gap={1}>
        {/* 카드 제목 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* 카드 시간 */}
          {(startTime || endTime) && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {formatTime(startTime)}{" "}
              {endTime ? `- ${formatTime(endTime)}` : ""}
            </Typography>
          )}

          {/* 잠금 여부 */}
          <LockOutlineRoundedIcon
            fontSize="small"
            color="black"
            sx={{
              visibility: isLocked ? "visible" : "hidden",
            }}
          />
        </Stack>

        {/* 위치 정보와 썸네일 */}
        {location && (
          <Box sx={{ position: "relative" }}>
            {location.thumbnailUrl && (
              <>
                <Box
                  component="img"
                  src={location.thumbnailUrl}
                  sx={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    maxWidth: "90%",
                    background: "#D9D9D9",
                    borderRadius: 2,
                    padding: "3px 12px 3px 12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ color: "black" }}
                  >
                    {location.title}
                  </Typography>
                </Box>
              </>
            )}

            {/* 썸네일이 없을 경우에만 타이틀 일반 표시 */}
            {!location.thumbnailUrl && (
              <Typography variant="subtitle2" fontWeight="bold">
                {location.title}
              </Typography>
            )}
          </Box>
        )}

        {/* 카드 내용 */}
        <Stack
          gap={0.5}
          sx={{
            "& p, & ol, & ul": {
              margin: 0,
              padding: 0,
              boxSizing: "border-box",
            },
            "& ol, & ul": {
              paddingLeft: "1em",
            },
          }}
        >
          {content && parse(content)}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default Card;
