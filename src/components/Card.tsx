import { Paper, Stack, Typography } from "@mui/material";
import { cardEditDialogOpenAtom } from "../state";
import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { theme } from "../utils/theme";

const Card = () => {
  const setCardEditDialogOpen = useSetAtom(cardEditDialogOpenAtom);

  // 카드 편집 다이얼로그 열기
  const handleCardEditDialogOpen = useCallback(() => {
    setCardEditDialogOpen(true);
  }, [setCardEditDialogOpen]);

  return (
    <Paper
      onClick={handleCardEditDialogOpen}
      elevation={2}
      sx={{
        width: "100%",
        px: 1,
        cursor: "pointer",
        border: `2px solid transparent`,
        "&:hover": {
          border: `2px solid ${theme.palette.primary.main}`,
        },
      }}
    >
      <Stack gap={1}>
        {/* 시간 */}
        <Typography variant="subtitle1" fontWeight="bold">
          01:00 ~ 03:00
        </Typography>

        {/* 내용 */}
        <Typography>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Harum id
          molestias molestiae, aperiam iste soluta nostrum magnam blanditiis...
        </Typography>
      </Stack>
    </Paper>
  );
};

export default Card;
