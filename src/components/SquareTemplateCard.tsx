import { Paper, Typography, useTheme, Box, IconButton } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { SxProps } from "@mui/system";
import { theme } from "../utils/theme";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface TemplateCardProps {
  title?: string;
  color?: string;
  onClick?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
  sx?: SxProps;
  type?: "new" | "existing";
  id?: string | number;
}

const CARD_SIZE = 200;

const SquareTemplateCard = ({
  title,
  color = theme.palette.info.main,
  onClick,
  onDelete,
  children,
  sx = {},
  type = "existing",
  id,
}: TemplateCardProps) => {
  const theme = useTheme();

  // 삭제 버튼 클릭 시 이벤트 전파 방지 (카드 클릭 이벤트 실행 방지)
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <Box
      key={`template-${id}`}
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* 박스 스타일 */}
      <Paper
        elevation={2}
        onClick={onClick}
        sx={{
          width: CARD_SIZE,
          height: CARD_SIZE,
          borderRadius: 4,
          bgcolor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: 2,
          cursor: onClick ? "pointer" : "default",
          transition: "box-shadow 0.2s",
          ":hover": onClick ? { boxShadow: 6 } : {},
          position: "relative",
          ...sx,
        }}
      >
        {/* 삭제 버튼 - 새 템플릿이 아닐 때만 표시 */}
        {type !== "new" && onDelete && (
          <IconButton
            size="small"
            onClick={handleDeleteClick}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              opacity: 0, // 기본적으로 투명하게 시작
              transition: "opacity 0.2s ease", // 부드러운 페이드 효과
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.9)",
              },
              zIndex: 1,
              // 부모 요소(:hover)에 의해 제어되는 스타일
              ".MuiPaper-root:hover &": {
                opacity: 1, // 부모에 마우스 오버 시 보이게 함
              },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}

        {/* 새 템플릿 아이콘 */}
        {type === "new" ? (
          <AddRoundedIcon
            sx={{ fontSize: "40px", color: theme.palette.black.main }}
          />
        ) : (
          children
        )}
      </Paper>
      {/* 내 템플릿 스타일 */}
      {title && (
        <Typography
          variant="body2"
          fontWeight={300}
          align="left"
          sx={{
            width: CARD_SIZE,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            mt: 1,
            pl: 0.5,
          }}
          noWrap
        >
          {title}
        </Typography>
      )}
      {/* 새 템플릿 스타일 */}
      {type === "new" && !title && (
        <Typography
          variant="body2"
          fontWeight={300}
          align="left"
          sx={{
            width: CARD_SIZE,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            mt: 1,
            pl: 0.5,
          }}
          noWrap
        >
          새 템플릿
        </Typography>
      )}
    </Box>
  );
};

export default SquareTemplateCard;
