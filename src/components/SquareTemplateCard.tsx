import { Paper, Typography, Box, IconButton, useTheme, Menu, MenuItem } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { SxProps } from "@mui/system";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { useState } from "react";

interface TemplateCardProps {
  title?: string;
  color?: string;
  thumbnailUrl?: string;
  date?: string; // 날짜 추가
  onClick?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
  sx?: SxProps;
  type?: "new" | "existing";
  cardSize?: number;
}

const DEFAULT_CARD_SIZE = 200;

const SquareTemplateCard = ({
  title,
  color,
  thumbnailUrl,
  date,
  onClick,
  onDelete,
  children,
  sx = {},
  type = "existing",
  cardSize = DEFAULT_CARD_SIZE,
}: TemplateCardProps) => {
  const theme = useTheme();
  const bgColor = color || theme.palette.info.main;
  
  // 더보기 메뉴 상태
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  // 더보기 버튼 클릭
  const handleMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  
  // 메뉴 닫기
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // 메뉴에서 삭제 클릭
  const handleMenuDelete = () => {
    handleMenuClose();
    if (onDelete) onDelete();
  };

  return (
    <Box
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "flex-start",
        p: 1,
        borderRadius: 3,
        bgcolor: theme.palette.mode === "dark" 
          ? "rgba(255, 255, 255, 0.05)" 
          : "rgba(0, 0, 0, 0.02)",
        transition: "background-color 0.2s",
        ":hover": {
          bgcolor: theme.palette.mode === "dark" 
            ? "rgba(255, 255, 255, 0.08)" 
            : "rgba(0, 0, 0, 0.04)",
        },
        ...sx,
      }}
    >
      {/* 박스 스타일 */}
      <Paper
        elevation={type === "new" ? 0 : 2}
        onClick={onClick}
        sx={{
          width: cardSize,
          height: type === "new" ? cardSize + 60 : cardSize, // 새 템플릿은 하단 텍스트 영역만큼 더 높게
          borderRadius: 3,
          background: type === "new" ? theme.palette.background.paper : bgColor,
          backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          boxShadow: type === "new" ? 0 : 2,
          border: type === "new" ? `2px dashed ${theme.palette.divider}` : "none",
          cursor: onClick ? "pointer" : "default",
          transition: "box-shadow 0.2s, border-color 0.2s",
          ":hover": onClick ? { 
            boxShadow: type === "new" ? 0 : 6,
            borderColor: type === "new" ? theme.palette.primary.main : undefined,
          } : {},
          position: "relative",
        }}
      >
        {/* 새 템플릿 콘텐츠 */}
        {type === "new" ? (
          <>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 28, color: "white" }} />
            </Box>
            <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
              새 템플릿
            </Typography>
            <Typography variant="caption" color="text.secondary">
              새로운 여행 계획하기
            </Typography>
          </>
        ) : (
          children
        )}
      </Paper>
      {/* 내 템플릿 스타일 - 제목, 날짜, 더보기 버튼 */}
      {type !== "new" && title && (
        <Box sx={{ width: cardSize, mt: 1.5 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              color: theme.palette.text.primary,
            }}
            noWrap
          >
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 12 }}
            >
              {date || ""}
            </Typography>
            {onDelete && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMoreClick}
                  sx={{ 
                    p: 0.25,
                    color: theme.palette.text.secondary,
                    ":hover": {
                      color: theme.palette.text.primary,
                    }
                  }}
                >
                  <MoreHorizRoundedIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <MenuItem onClick={handleMenuDelete} sx={{ color: "error.main" }}>
                    삭제
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SquareTemplateCard;
