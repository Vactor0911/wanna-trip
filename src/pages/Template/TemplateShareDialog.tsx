import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { useCallback, useEffect, useState } from "react";
import axiosInstance, { getCsrfToken } from "../../utils/axiosInstance";
import { useAtomValue } from "jotai";
import { templateAtom } from "../../state/template";
import { enqueueSnackbar } from "notistack";

const TemplateShareDialog = (props: DialogProps) => {
  const { open, onClose, ...other } = props;

  const template = useAtomValue(templateAtom);

  const [linkCopied, setLinkCopied] = useState(false);
  const [privacy, setPrivacy] = useState("private");

  // 링크 복사 버튼 클릭
  const handleLinkCopyButtonClick = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
  }, []);

  // 템플릿 공개 설정 불러오기
  const fetchTemplatePrivacy = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      const response = await axiosInstance.get(
        `/template/privacy/${template.uuid}`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );
      const { privacy } = response.data;
      setPrivacy(privacy);
    } catch {
      enqueueSnackbar("템플릿 공개 설정을 불러오지 못했습니다.", {
        variant: "error",
      });
    }
  }, [template.uuid]);

  useEffect(() => {
    // 대화상자가 닫히면 상태 초기화
    if (!open) {
      setLinkCopied(false);
      return;
    }

    // 대화상자가 열리면 공동 작업자 목록과 권한 설정 불러오기
    fetchTemplatePrivacy();
  }, [fetchTemplatePrivacy, open]);

  // 권한 설정 변경
  const handlePrivacyChange = useCallback(
    async (event: SelectChangeEvent<string>) => {
      const privacy = event.target.value;
      setPrivacy(privacy);

      // 템플릿 권한 설정 변경 API 호출
      try {
        const csrfToken = await getCsrfToken();

        axiosInstance.put(
          `/template/privacy/${template.uuid}`,
          { privacy: privacy },
          {
            headers: { "X-CSRF-Token": csrfToken },
          }
        );
      } catch {
        enqueueSnackbar("템플릿 공개 설정을 변경하지 못했습니다.", {
          variant: "error",
        });
      }
    },
    [template.uuid]
  );

  return (
    <Dialog
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: "450px",
            maxHeight: "80vh",
          },
        },
      }}
      open={open}
      onClose={onClose}
      {...other}
    >
      {/* 헤더 */}
      <Stack direction="row" spacing={1} alignItems="center" m={1} ml={2}>
        {/* 헤더 */}
        <Typography variant="h6" flex={1}>
          템플릿 공유하기
        </Typography>

        {/* 링크 복사 버튼 */}
        <Button
          startIcon={linkCopied ? null : <LinkRoundedIcon />}
          onClick={handleLinkCopyButtonClick}
        >
          {linkCopied ? "복사 완료!" : "링크 복사"}
        </Button>

        {/* 닫기 버튼 */}
        <IconButton size="small" onClick={() => onClose?.({}, "backdropClick")}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <DialogContent dividers>
        <Stack gap={1.5}>
          {/* 헤더 */}
          <Typography variant="body2" color="text.secondary">
            공동 작업자
          </Typography>

          {/* 검색어 입력란 */}
          <TextField
            placeholder="이메일 / 닉네임"
            fullWidth
            slotProps={{
              htmlInput: {
                sx: {
                  padding: 1,
                  px: 1.5,
                },
              },
            }}
          />

          {/* 공동 작업자 목록 */}
          <Stack gap={1.5} mt={1}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Stack
                key={`collaborator-${index}`}
                direction="row"
                alignItems="center"
                gap={1}
              >
                {/* 공동 작업자 프로필 아이콘 */}
                <Avatar
                  src={undefined}
                  alt={`c${index}`}
                  sx={{
                    width: 32,
                    height: 32,
                  }}
                />

                {/* 공동 작업자 닉네임 */}
                <Typography
                  mr="auto"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  공동 작업자{" " + (index + 1)}
                </Typography>

                {/* 공동 작업자 제외 버튼 */}
                <IconButton size="small">
                  <CloseRoundedIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          {/* 권한 설정 */}
          <Typography variant="body2" color="text.secondary" mt={3}>
            권한 설정
          </Typography>

          {/* 전체 권한 설정 */}
          <Stack direction="row" alignItems="center" gap={1}>
            <PublicRoundedIcon />
            <Typography mr="auto">아무 사용자</Typography>

            {/* 전체 권한 콤보박스 */}
            <FormControl
              sx={{
                "& .MuiSelect-select": {
                  py: 1,
                },
              }}
            >
              <Select value={privacy} onChange={handlePrivacyChange}>
                <MenuItem value="private">비공개</MenuItem>
                <MenuItem value="public">전체 공개</MenuItem>
                <MenuItem value="link">링크가 있는 사용자</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateShareDialog;
