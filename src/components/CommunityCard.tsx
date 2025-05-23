import { Paper, Typography, useTheme, Box, IconButton } from "@mui/material";
import { SxProps } from "@mui/system";
import { theme } from "../utils/theme";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface CommunityCardProps {
  title?: string;
  content?: string;
  color?: string;
  onClick?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
  sx?: SxProps;
  type?: "new" | "existing";
  id?: string | number;
}

const CARD_SIZE = 300; // 커뮤니티 카드는 더 크게 설정

const CommunityCard = ({
  title,
  content,
  color = theme.palette.info.main,
  onClick,
  onDelete,
  children,
  sx = {},
  type = "existing",
  id,
}: CommunityCardProps) => {
  const theme = useTheme();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <Box
      key={`community-${id}`}
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Paper
        elevation={2}
        onClick={onClick}
        sx={{
          width: CARD_SIZE,
          height: CARD_SIZE,
          borderRadius: 4,
          bgcolor: color,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: 2,
          cursor: onClick ? "pointer" : "default",
          transition: "box-shadow 0.2s",
          ":hover": onClick ? { boxShadow: 6 } : {},
          position: "relative",
          p: 2,
          ...sx,
        }}
      >
        {type !== "new" && onDelete && (
          <IconButton
            size="small"
            onClick={handleDeleteClick}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              opacity: 0,
              transition: "opacity 0.2s ease",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.9)",
              },
              zIndex: 1,
              ".MuiPaper-root:hover &": {
                opacity: 1,
              },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}

        {type === "new" ? (
          children
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              {content}
            </Typography>
          </>
        )}
      </Paper>
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
    </Box>
  );
};

export default CommunityCard;
