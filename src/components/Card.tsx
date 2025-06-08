import { Paper, Stack, Typography } from "@mui/material";
import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { theme } from "../utils/theme";
import { cardEditDialogOpenAtom, CardInterface, selectedCardAtom } from "../state/template";

interface CardProps {
  card: CardInterface;
}

const Card = (props: CardProps) => {
  const { card } = props;

  const setCardEditDialogOpen = useSetAtom(cardEditDialogOpenAtom);
  const setSelectedCard = useSetAtom(selectedCardAtom);

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
          {`${card.startTime.format("HH:mm")} ~ ${card.endTime.format("HH:mm")}`}
        </Typography>

        {/* 내용 */}
        {card.content}
      </Stack>
    </Paper>
  );
};

export default Card;
