import { Box, Button, CircularProgress, OutlinedInput, Stack, Typography } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useCallback, useState } from "react";

interface CommentInputProps {
  onCommentSubmit: (content: string) => void;
  onCommentCancel?: () => void;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CommentInput = (props: CommentInputProps) => {
  const { onCommentSubmit, onCommentCancel, disabled = false, value: externalValue, onChange } = props;


  // 내부 상태 관리
  const [internalValue, setInternalValue] = useState("");
  const isControlled = externalValue !== undefined;
  const value = isControlled ? externalValue : internalValue;

  // 댓글 입력
  const handleCommentChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event);
      } else {
        setInternalValue(event.target.value);
      }
    },
    [onChange]
  );

  // 댓글 제출
  const handleSubmit = useCallback(() => {
    if (value.trim() && !disabled) {
      onCommentSubmit(value);
      if (!isControlled) {
        setInternalValue("");
      }
    }
  }, [value, disabled, onCommentSubmit, isControlled]);

  return (
    <Box position="relative">
      <OutlinedInput
        fullWidth
        multiline
        placeholder="댓글을 남겨보세요"
        value={value}
        onChange={handleCommentChange}
        disabled={disabled}
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
            disabled={disabled}
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
          endIcon={disabled ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
          size="small"
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          sx={{
            borderRadius: "50px",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {disabled ? "등록 중..." : "등록"}
          </Typography>
        </Button>
      </Stack>
    </Box>
  );
};

export default CommentInput;
