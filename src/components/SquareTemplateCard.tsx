import { Paper, Typography, Box, IconButton, useTheme, Menu, MenuItem, Divider, Checkbox, alpha } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { SxProps } from "@mui/system";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useState } from "react";

interface TemplateCardProps {
  title?: string;
  color?: string;
  thumbnailUrl?: string;
  date?: string; // 날짜 추가
  onClick?: () => void;
  onDelete?: () => void;
  onCopy?: () => void; // 복사 콜백 추가
  children?: React.ReactNode;
  sx?: SxProps;
  type?: "new" | "existing";
  cardSize?: number;
  // 선택 모드 관련 props
  selectable?: boolean; // 선택 가능 여부
  selected?: boolean; // 선택 상태
  onSelect?: (selected: boolean) => void; // 선택 상태 변경 콜백
}

const DEFAULT_CARD_SIZE = 200;

const SquareTemplateCard = ({
  title,
  color,
  thumbnailUrl,
  date,
  onClick,
  onDelete,
  onCopy,
  children,
  sx = {},
  type = "existing",
  cardSize = DEFAULT_CARD_SIZE,
  selectable = false,
  selected = false,
  onSelect,
}: TemplateCardProps) => {
  const theme = useTheme();
  const bgColor = color || theme.palette.info.main;
  
  // 호버 상태
  const [isHovered, setIsHovered] = useState(false);
  
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

  // 메뉴에서 복사 클릭
  const handleMenuCopy = () => {
    handleMenuClose();
    if (onCopy) onCopy();
  };

  // 체크박스 클릭 핸들러
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(!selected);
    }
  };

  // 카드 클릭 핸들러 (체크박스 영역이 아닌 곳 클릭 시 onClick 실행)
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "flex-start",
        p: 1,
        borderRadius: 3,
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.1)
          : theme.palette.mode === "dark" 
            ? "rgba(255, 255, 255, 0.05)" 
            : "rgba(0, 0, 0, 0.02)",
        transition: "background-color 0.2s",
        border: selected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
        ":hover": {
          bgcolor: selected
            ? alpha(theme.palette.primary.main, 0.15)
            : theme.palette.mode === "dark" 
              ? "rgba(255, 255, 255, 0.08)" 
              : "rgba(0, 0, 0, 0.04)",
        },
        position: "relative",
        ...sx,
      }}
    >
      {/* 선택 체크박스 (hover 시 또는 선택된 상태에서 표시) */}
      {selectable && type !== "new" && (isHovered || selected) && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 10,
          }}
        >
          <Checkbox
            checked={selected}
            onClick={handleCheckboxClick}
            sx={{
              p: 0.5,
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              borderRadius: 1,
              boxShadow: 2,
              "&:hover": {
                bgcolor: theme.palette.background.paper,
              },
              "& .MuiSvgIcon-root": {
                fontSize: 24,
              },
            }}
          />
        </Box>
      )}

      {/* 박스 스타일 */}
      <Paper
        elevation={type === "new" ? 0 : 2}
        onClick={handleCardClick}
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
            {(onDelete || onCopy) && (
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
                  {onCopy && (
                    <MenuItem onClick={handleMenuCopy}>
                      <ContentCopyRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                      복사
                    </MenuItem>
                  )}
                  {onCopy && onDelete && <Divider />}
                  {onDelete && (
                    <MenuItem onClick={handleMenuDelete} sx={{ color: "error.main" }}>
                      <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                      삭제
                    </MenuItem>
                  )}
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
