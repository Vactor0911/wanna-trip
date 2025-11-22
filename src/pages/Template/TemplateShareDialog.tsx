import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";

const TemplateShareDialog = () => {
  return (
    <Dialog
      open={true}
      onClose={() => {}}
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: "450px",
          },
        },
      }}
    >
      {/* 헤더 */}
      <Stack direction="row" spacing={1} alignItems="center" m={1} ml={2}>
        {/* 헤더 */}
        <Typography variant="h6" flex={1}>
          템플릿 공유하기
        </Typography>

        {/* 링크 복사 버튼 */}
        <Button startIcon={<LinkRoundedIcon />}>링크 복사</Button>

        {/* 닫기 버튼 */}
        <IconButton size="small">
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
          {Array.from({ length: 4 }).map((_, index) => (
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
                ㅁㄴㅇㅁㅇㅁㅇㅁㅁaaaaaaaaaaaaaaaaaaaaaaaaㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ
                {index}
              </Typography>

              {/* 공동 작업자 제외 버튼 */}
              <IconButton size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          ))}

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
              <Select value="private">
                <MenuItem value="private">비공개</MenuItem>
                <MenuItem value="public">전체 공개</MenuItem>
                <MenuItem value="public">링크가 있는 사용자</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateShareDialog;
