import {
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Container,
  Divider,
  InputBase,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PostEditor from "../components/text_editor/PostEditor";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useCallback, useRef, useState } from "react";
import { grey } from "@mui/material/colors";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

const MAX_TAGS = 5; // 최대 태그 개수

const CommunityPostEdit = () => {
  const [title, setTitle] = useState(""); // 게시글 제목
  const [content, setContent] = useState(""); // 게시글 내용
  const [tags, setTags] = useState<string[]>([]); // 게시글 태그
  const tagInputRef = useRef<HTMLInputElement>(null); // 태그 입력란 참조
  const [tagInput, setTagInput] = useState(""); // 태그 입력란 값
  const [isTagInputFocused, setIsTagInputFocused] = useState(false); // 태그 입력란 포커스 상태

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

  // 태그 입력
  const handleTagInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTagInput(event.target.value);

      tagInputRef.current?.style.setProperty("width", "0px");
      tagInputRef.current?.style.setProperty(
        "width",
        `${event.target.scrollWidth + 2}px`
      );
    },
    []
  );

  // 태그 추가
  const addTag = useCallback(() => {
    // 태그가 비어있거나 이미 존재하는 경우 종료
    if (!tagInput || tags.includes(tagInput) || tags.length >= MAX_TAGS) {
      return;
    }

    // 태그 추가
    const trimmedTag = tagInput.trim();
    setTags((prevTags) => [...prevTags, trimmedTag]);
    setTagInput(""); // 태그 입력란 초기화

    // 태그 개수가 최대 개수에 도달한 경우 입력란 블러
    if (tags.length + 1 >= MAX_TAGS) {
      setIsTagInputFocused(false);
      tagInputRef.current?.blur();
      tagInputRef.current?.style.setProperty("width", "0px"); // 입력란 너비 초기화
    }
  }, [tagInput, tags]);

  // 태그 제거
  const removeTag = useCallback((index: number) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  }, []);

  // 태그 입력란 스페이스 키 입력
  const handleTagInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === " ") {
        event.preventDefault(); // 스페이스 키 기본 동작 방지
        addTag(); // 현재 입력된 태그 추가
      }
    },
    [addTag]
  );

  // 태그 컨테이너 클릭
  const handleTagContainerClick = useCallback(() => {
    // 태그 입력란 참조가 존재하지 않으면 종료
    if (!tagInputRef.current) {
      return;
    }

    // 태그 개수가 최대 개수에 도달한 경우 종료
    if (tags.length >= MAX_TAGS) {
      return;
    }

    console.log("태그 입력란 클릭");

    // 태그 포커스 토클
    setIsTagInputFocused(true);
    tagInputRef.current.focus();

    // 커서를 맨 뒤로 이동
    const len = tagInput.length;

    // 대부분의 브라우저
    if (typeof tagInputRef.current.setSelectionRange === "function") {
      tagInputRef.current.setSelectionRange(len, len);
    } else {
      // 오래된 IE용
      tagInputRef.current.selectionStart = tagInputRef.current.selectionEnd =
        len;
    }
  }, [tagInput.length, tags.length]);

  // 태그 컨테이너 외부 클릭
  const handleTagContainerClickAway = useCallback(() => {
    // 태그 입력란 참조가 존재하지 않거나 이미 블러 상태면 종료
    if (!tagInputRef.current || !isTagInputFocused) {
      return;
    }

    // 태그 포커스 블러
    setIsTagInputFocused(false);
    tagInputRef.current.blur();
    addTag(); // 현재 입력된 태그 추가
  }, [addTag, isTagInputFocused]);

  return (
    <>
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
              borderColor: grey[300],
            }}
          >
            <Stack padding={3} paddingX={5} gap={1}>
              {/* 헤더 */}
              <Typography variant="h6" color="text.secondary">
                제목
              </Typography>

              {/* 제목 입력란 */}
              <TextField
                variant="outlined"
                placeholder="제목을 입력해 주세요."
                value={title}
                onChange={handleTitleChange}
                sx={{
                  backgroundColor: grey[100],
                }}
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
                  borderColor: grey[300],
                }}
              />

              {/* 태그 입력 컨테이너 */}
              <ClickAwayListener onClickAway={handleTagContainerClickAway}>
                <Stack
                  direction="row"
                  padding={"10px"}
                  paddingX={2}
                  alignItems="center"
                  gap={1}
                  onClick={handleTagContainerClick}
                  sx={{
                    cursor: "text",
                  }}
                >
                  {/* 태그 리스트 */}
                  {tags.map((tag, index) => (
                    <Chip
                      label={tag}
                      key={`tag-${index}`}
                      onDelete={() => removeTag(index)}
                    />
                  ))}

                  {/* 태그 입력란 플레이스 홀더 */}
                  {!isTagInputFocused && tags.length <= 0 && (
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      whiteSpace="nowrap"
                    >{`태그를 입력하세요. (최대 ${MAX_TAGS}개)`}</Typography>
                  )}

                  {/* 태그 입력란 */}
                  <Stack direction="row" alignItems="center" gap={0.25}>
                    {/* # 태그 */}
                    {isTagInputFocused && (
                      <Typography variant="subtitle1" color="text.secondary">
                        #
                      </Typography>
                    )}

                    {/* 태그 입력 필드 */}
                    <InputBase
                      inputRef={tagInputRef}
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagInputKeyDown}
                      sx={{
                        color: "text.secondary",
                      }}
                    />
                  </Stack>
                </Stack>
              </ClickAwayListener>
            </Stack>
          </Box>

          {/* 템플릿 선택기 */}
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, borderStyle: "dashed" }}
          >
            <Stack alignItems="center" padding={5} gap={2}>
              {/* 템플릿 아이콘 */}
              <CalendarMonthRoundedIcon
                sx={{
                  fontSize: "6rem",
                }}
              />

              {/* 템플릿 선택 버튼 */}
              <Button variant="outlined">
                <Typography variant="h6">템플릿 선택</Typography>
              </Button>
            </Stack>
          </Paper>

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
    </>
  );
};

export default CommunityPostEdit;
