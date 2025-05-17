import { Paper, Typography, useTheme, Box } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { SxProps } from "@mui/system";
import { theme } from "../utils/theme";

interface TemplateCardProps {
  title?: string;
  color?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  sx?: SxProps;
  type?: 'new' | 'existing';
  id?: string | number;
}

const CARD_SIZE = 200;

const SquareTemplateCard = ({
  title,
  color = theme.palette.info.main,
  onClick,
  children,
  sx = {},
  type = 'existing',
  id,
}: TemplateCardProps) => {
  const theme = useTheme();
  
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
          ':hover': onClick ? { boxShadow: 6 } : {},
          position: 'relative',
          ...sx,
        }}
      >
        {/* 새 템플릿 아이콘 */}
        {type === 'new' ? (
          <AddRoundedIcon sx={{ fontSize: "40px", color: theme.palette.black.main }} />
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
      {type === 'new' && !title && (
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