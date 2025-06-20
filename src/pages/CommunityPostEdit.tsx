import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PostEditor from "../components/text_editor/PostEditor";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useCallback, useState } from "react";

const CommunityPostEdit = () => {
  const [title, setTitle] = useState(""); // 게시글 제목
  const [content, setContent] = useState(""); // 게시글 내용

  // 제목 변경
  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    []
  );

  // 내용 변경
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  return (
    <Container maxWidth="lg">
      <Stack minHeight="calc(100vh - 82px)" gap={4} py={5} pb={15}>
        {/* 게시글 제목 */}
        <Typography variant="h4">게시판 글쓰기</Typography>

        {/* 구분선 */}
        <Divider />

        {/* 게시글 제목 입력란 */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
          }}
        >
          <Stack padding={3} paddingX={5} gap={1}>
            <Typography variant="h6" color="text.secondary">
              제목
            </Typography>
            <TextField
              variant="outlined"
              placeholder="제목을 입력해 주세요."
              value={title}
              onChange={handleTitleChange}
            />
          </Stack>
        </Paper>

        {/* 게시글 입력란 */}
        <Box
          position="relative"
          sx={{
            "& .ck-content": {
              minHeight: "300px",
              paddingBottom: "50px", // 버튼 영역을 위해 하단 패딩 추가
            },
          }}
        >
          {/* 텍스트 에디터 */}
          <PostEditor setContent={handleContentChange} />

          {/* 태그 입력란 */}
          <Stack position="absolute" bottom={0} left={0} width="100%">
            {/* 구분선 */}
            <Divider
              variant="middle"
              sx={{
                borderColor: "#ccced1",
              }}
            />

            {/* TODO: 태그 입력란으로 변경 필요 */}
            <Box width="100%" height="50px" />
          </Stack>
        </Box>

        {/* TODO: 템플릿 선택기 추가 필요 */}

        {/* 버튼 컨테이너 */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
        >
          {/* 취소 버튼 */}
          <Button
            variant="contained"
            color="secondary"
            sx={{
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              취소
            </Typography>
          </Button>

          {/* 등록 버튼 */}
          <Button
            variant="contained"
            endIcon={<SendRoundedIcon />}
            sx={{
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              등록
            </Typography>
          </Button>
        </Stack>
      </Stack>

      {/* 스크롤 상단 이동 버튼 */}
      <ScrollToTopButton />
    </Container>
  );
};

export default CommunityPostEdit;
