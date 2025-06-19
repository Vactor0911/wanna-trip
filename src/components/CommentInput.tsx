import { Box, Button, OutlinedInput, Stack, Typography } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useCallback, useState } from "react";

interface CommentInputProps {
  onCommentSubmit: () => void;
  onCommentCancel?: () => void;
}

const CommentInput = (props: CommentInputProps) => {
  const { onCommentSubmit, onCommentCancel } = props;

  const [comment, setComment] = useState("");

  // 댓글 입력
  const handleCommentChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setComment(event.target.value);
    },
    []
  );

  return (
    <Box position="relative">
      <OutlinedInput
        fullWidth
        multiline
        placeholder="댓글을 남겨보세요"
        value={comment}
        onChange={handleCommentChange}
        sx={{
          pb: 7.5,
        }}
      />

      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        position="absolute"
        bottom={8}
        right={8}
      >
        {/* 취소 버튼 */}
        {onCommentCancel && (
          <Button
            variant="contained"
            size="small"
            color="secondary"
            onClick={onCommentCancel}
            sx={{
              borderRadius: "50px",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              취소
            </Typography>
          </Button>
        )}

        {/* 등록 버튼 */}
        <Button
          variant="contained"
          endIcon={<SendRoundedIcon />}
          size="small"
          onClick={onCommentSubmit}
          sx={{
            borderRadius: "50px",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            등록
          </Typography>
        </Button>
      </Stack>
    </Box>
  );
};

export default CommentInput;
