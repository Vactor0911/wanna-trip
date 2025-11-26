import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  StackProps,
  Typography,
  useTheme,
} from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import Card from "./Card";
import { BoardInterface } from "../../state/template";
import { wannaTripLoginStateAtom } from "../../state";
import { useState, useCallback, memo } from "react";
import { useAtomValue } from "jotai";
import { useSnackbar } from "notistack";
import CopyToMyTemplateDialog from "../CopyToMyTemplateDialog";

interface BoardProps extends StackProps {
  day: number;
  boardData: BoardInterface; // 보드 데이터 직접 전달
  id?: string; // ID 속성 추가 (선택적 속성으로 설정)
  boardUuid?: string; // 보드 UUID
  templateUuid?: string; // 템플릿 UUID
}

const Board = (props: BoardProps) => {
  const {
    day,
    boardData,
    id, // ID 속성 추가 (선택적 속성으로 설정)
    boardUuid,
    templateUuid,
    ...others
  } = props;

  const theme = useTheme();
  const loginState = useAtomValue(wannaTripLoginStateAtom); // 로그인 상태
  const { enqueueSnackbar } = useSnackbar();
  
  // 보드 메뉴 상태
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  // 복사 다이얼로그 상태
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  }, []);
  
  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);
  
  const handleCopyBoard = useCallback(() => {
    // 로그인 상태 확인
    if (!loginState.isLoggedIn) {
      enqueueSnackbar("로그인이 필요한 기능입니다.", {
        variant: "warning",
      });
      handleMenuClose();
      return;
    }
    handleMenuClose();
    setCopyDialogOpen(true);
  }, [handleMenuClose, loginState.isLoggedIn, enqueueSnackbar]);
  
  const handleCopyDialogClose = useCallback(() => {
    setCopyDialogOpen(false);
  }, []);

  return (
    <Stack height="100%" id={id} {...others}>
      <Paper
        elevation={3}
        sx={{
          maxHeight: "100%",
          background: theme.palette.secondary.main,
          borderRadius: "8px",
        }}
      >
        <Stack py={1} px={1.5} width="300px" maxHeight="inherit" gap={1}>
          {/* 헤더 메뉴바 */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* 좌측 컨테이너 */}
            <Stack direction="row" alignItems="center" gap={0.5}>
              {/* 보드 날짜 */}
              <Typography variant="h6">Day {day}</Typography>
            </Stack>
            
            {/* 우측 컨테이너 - 더보기 메뉴 */}
            {boardUuid && templateUuid && (
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreHorizRoundedIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <Stack
            flex={1}
            gap={2}
            paddingBottom={0.5}
            sx={{
              overflowY: "auto",
            }}
          >
            {/* 카드 목록 렌더링 */}
            {(boardData?.cards || []).map((card) => (
              <Box
                key={`box-card-${card.uuid}`}
                id={`card-${card.uuid}`} // ID 속성 추가
                sx={{
                  borderRadius: "8px",
                }}
              >
                <Card
                  key={`card-${card.uuid}`}
                  cardUuid={card.uuid}
                  boardUuid={boardUuid}
                  templateUuid={templateUuid}
                  content={card.content || ""}
                  startTime={card.startTime}
                  endTime={card.endTime}
                  isLocked={card.locked}
                  location={card.location || undefined}
                />
              </Box>
            ))}
          </Stack>
        </Stack>
      </Paper>
      
      {/* 보드 더보기 메뉴 */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
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
        <MenuItem onClick={handleCopyBoard}>
          <ListItemIcon>
            <ContentCopyRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>내 템플릿으로 복사</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* 복사 다이얼로그 */}
      {boardUuid && templateUuid && (
        <CopyToMyTemplateDialog
          open={copyDialogOpen}
          onClose={handleCopyDialogClose}
          copyType="board"
          sourceUuid={boardUuid}
        />
      )}
    </Stack>
  );
};

export default memo(Board);
