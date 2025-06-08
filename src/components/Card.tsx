import { Paper, Stack, Typography } from "@mui/material";
import { theme } from "../utils/theme";
import { Dayjs } from "dayjs";

interface CardProps {
  title?: string;
  content?: string;
  startTime?: Dayjs;
  endTime?: Dayjs;
  isLocked?: boolean; // 카드 잠금 여부
  onClick?: () => void;
}

const Card = (props: CardProps) => {
  const { title, content, startTime, endTime, isLocked, onClick } = props;

  // 시간 형식 설정
  const formatTime = (time?: Dayjs) => {
    return time ? time.format("HH:mm") : "";
  };

  // HTML 태그를 제거하고 일부 텍스트만 표시하는 함수
  const stripHtmlAndTruncate = (html: string, maxLength: number = 100) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
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
        border: isLocked
          ? `1px solid ${theme.palette.error.light}`
          : `2px solid transparent`,
        "&:hover": {
          border: `2px solid ${theme.palette.primary.main}`,
        },
      }}
    >
      <Stack gap={1}>
        {/* 카드 시간 */}
        {(startTime || endTime) && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            gutterBottom
          >
            {formatTime(startTime)} {endTime ? `- ${formatTime(endTime)}` : ""}
          </Typography>
        )}

        {/* 카드 제목 */}
        {title && (
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
        )}

        {/* 카드 내용 */}
        {content && (
          <Typography variant="body2">
            {stripHtmlAndTruncate(content)}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default Card;
