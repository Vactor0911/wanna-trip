import {
  Box,
  Paper,
  PaperProps,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
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
  isNowEditing: boolean;
  onClick?: () => void;
  location?: LocationInfo; // 위치 정보 추가
  isOwner?: boolean; // 소유자 여부 추가
  isTimeOverlapping?: boolean; // 시간 중복 여부 prop 추가
}

const Card = (props: CardProps) => {
  const {
    content,
    startTime,
    endTime,
    isLocked,
    isNowEditing,
    onClick,
    location,
    isOwner: hasPermission = true, // 기본값은 true로 설정
    isTimeOverlapping = false, // 기본값은 false
    ...others
  } = props;

  const theme = useTheme();

  // 소유자 여부에 따른 클릭 핸들러
  const handleClick = (e: React.MouseEvent) => {
    // 편집 권한이 없거나 편집 중이면 클릭 이벤트 무시
    if (!hasPermission || isNowEditing) {
      e.preventDefault();
      return;
    }

    // 소유자면 onClick 함수 실행
    if (onClick) {
      onClick();
    }
  };

  // 시간 형식 설정
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTime = (time: any) => {
    // time이 dayjs 객체인지 확인
    if (time && typeof time.format === "function") {
      return time.format("HH:mm");
    }
    // 문자열이면 dayjs로 변환 시도
    else if (typeof time === "string") {
      return dayjs(time).format("HH:mm");
    }
    // 다른 타입이면 기본값 반환
    return "--:--";
  };

  return (
    <Paper
      onClick={handleClick} // // 소유자 여부에 따라 처리하는 핸들러로 변경
      elevation={2}
      sx={{
        width: "100%",
        px: 1,
        cursor: hasPermission ? "pointer" : "default",
        border: "2px solid transparent",
        borderColor: isNowEditing
          ? "#ba68c8"
          : isTimeOverlapping
          ? theme.palette.error.main
          : "transparent",
        filter: isNowEditing ? "brightness(0.85)" : "none",
        transition: "border-color 0.3s, filter 0.3s",
        "&:hover": {
          borderColor: isNowEditing
            ? "#ba68c8"
            : hasPermission
            ? theme.palette.primary.main
            : isTimeOverlapping
            ? theme.palette.error.main
            : "transparent",
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
              variant="subtitle1"
              color="text.secondary"
              display="block"
            >
              {formatTime(startTime)}{" "}
              {endTime ? `- ${formatTime(endTime)}` : ""}
            </Typography>
          )}

          {/* 잠금 여부 아이콘 */}
          <LockOutlineRoundedIcon
            fontSize="small"
            color="primary"
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
                    bottom: "3px",
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
