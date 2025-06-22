import {
  Box,
  Button,
  CircularProgress,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useCallback, useEffect, useState } from "react";

interface CommentInputProps {
  onCommentSubmit: (content: string) => void;
  onCommentCancel?: () => void;
  disabled?: boolean;
  defaultValue?: string;
}

const CommentInput = (props: CommentInputProps) => {
  const {
    onCommentSubmit,
    onCommentCancel,
    disabled = false,
    defaultValue,
  } = props;

  const [value, setValue] = useState(""); // 입력값

  // 입력값 변경
  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    []
  );

  // 기본값 변경
  useEffect(() => {
    // 기본값이 주어지면 초기화
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  // 댓글 제출
  const handleSubmit = useCallback(() => {
    if (value.trim() && !disabled) {
      onCommentSubmit(value);
      setValue("");
    }
  }, [value, disabled, onCommentSubmit]);

  return (
    <Box position="relative">
      <OutlinedInput
        fullWidth
        multiline
        placeholder="댓글을 남겨보세요"
        value={value}
        onChange={handleValueChange}
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
          endIcon={
            disabled ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SendRoundedIcon />
            )
          }
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
