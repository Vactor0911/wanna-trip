import { Paper, PaperProps, Stack, Typography } from "@mui/material";
import { theme } from "../utils/theme";
import { Dayjs } from "dayjs";
import parse from "html-react-parser";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";

interface CardProps extends PaperProps {
  content?: string;
  startTime?: Dayjs;
  endTime?: Dayjs;
  isLocked?: boolean; // 카드 잠금 여부
  onClick?: () => void;
}

const Card = (props: CardProps) => {
  const { content, startTime, endTime, isLocked, onClick, ...others } = props;

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
