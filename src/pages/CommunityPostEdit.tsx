import {
  Alert,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Container,
  Divider,
  InputBase,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import PostEditor from "../components/text_editor/PostEditor";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useCallback, useEffect, useRef, useState } from "react";
import { grey, red } from "@mui/material/colors";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import TemplateSelectDialog from "../components/TemplateSelectDialog";
import Template from "./Template";
import { useNavigate, useParams } from "react-router";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";

const MAX_TAGS = 5; // 최대 태그 개수

const CommunityPostEdit = () => {
  const theme = useTheme(); // MUI 테마
  const navigate = useNavigate(); // 네비게이션 훅
  const postId = useParams().postUuid; // URL 파라미터에서 게시글 ID 가져오기

  const [title, setTitle] = useState(""); // 게시글 제목
  const [titleErrorText, setTitleErrorText] = useState(""); // 제목 입력 오류 메시지]
  const titleTextFieldRef = useRef<HTMLInputElement>(null); // 제목 입력란 참조
  const [content, setContent] = useState(""); // 게시글 내용
  const [contentErrorText, setContentErrorText] = useState(""); // 게시글 내용 오류 메시지
  const contentEditorContainerRef = useRef<HTMLDivElement>(null); // 내용 입력란 컨테이너 참조
  const [tags, setTags] = useState<string[]>([]); // 게시글 태그
  const tagInputRef = useRef<HTMLInputElement>(null); // 태그 입력란 참조
  const [tagInput, setTagInput] = useState(""); // 태그 입력란 값
  const [isTagInputFocused, setIsTagInputFocused] = useState(false); // 태그 입력란 포커스 상태
  const [isTemplateSelectDialogOpen, setIsTemplateSelectDialogOpen] =
    useState(false); // 템플릿 선택 대화상자 열림 상태
  const [templateUuid, setTemplateUuid] = useState<string | null>(null); // 선택된 템플릿
  const [errorMessage, setErrorMessage] = useState<string>(""); // 오류 메시지

  const fetchPostData = useCallback(async () => {
    if (!postId) {
      return; // 게시글 ID가 없으면 종료
    }

    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 게시글 정보 가져오기
      const response = await axiosInstance.get(`/post/${postId}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        const postData = response.data.post;

        // 게시글 정보 설정
        setTitle(postData.title);
        setContent(postData.content);
        setTags(postData.tags || []);
        setTemplateUuid(postData.templateUuid || null);
      } else {
        setErrorMessage("게시글 정보를 가져오지 못했습니다.");
      }
    } catch (error) {
      console.error("게시글 정보 가져오기 실패:", error);
      setErrorMessage("게시글 정보를 가져오지 못했습니다.");
    }
  }, [postId]);

  useEffect(() => {
    // 컴포넌트 마운트 시 태그 입력란 너비 초기화
    if (tagInputRef.current) {
      tagInputRef.current.style.setProperty("width", "1px");
    }

    // 스크롤 제일 상단으로 이동
    window.scrollTo(0, 0);

    // UUID가 있으면 게시글 정보 가져오기
    if (postId) {
      fetchPostData();
    }
  }, [fetchPostData, navigate, postId]);

  // 제목 변경
  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);

      // 제목이 변경되면 오류 메시지 초기화
      if (titleErrorText) {
        setTitleErrorText("");
      }
    },
    [titleErrorText]
  );

  // 내용 변경
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);

      if (contentErrorText) {
        setContentErrorText(""); // 내용 입력란 포커스 시 오류 메시지 초기화
      }
    },
    [contentErrorText]
  );

  // 태그 입력
  const handleTagInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTagInput(event.target.value);

      tagInputRef.current?.style.setProperty("width", "1px");
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
    tagInputRef.current?.style.setProperty("width", "1px"); // 입력란 너비 초기화

    // 태그 개수가 최대 개수에 도달한 경우 입력란 블러
    if (tags.length + 1 >= MAX_TAGS) {
      setIsTagInputFocused(false);
      tagInputRef.current?.blur();
    }
  }, [tagInput, tags]);

  // 태그 제거
  const removeTag = useCallback((index: number) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  }, []);

  // 태그 입력란 키 입력
  const handleTagInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case " ":
          // 스페이스 키
          event.preventDefault(); // 스페이스 키 기본 동작 방지
          addTag(); // 현재 입력된 태그 추가
          break;
        case "Backspace":
          if (tagInput.length <= 0 && tags.length > 0) {
            // 백스페이스 키
            event.preventDefault(); // 백스페이스 키 기본 동작 방지
            removeTag(tags.length - 1); // 마지막 태그 제거
          }
          break;
      }
    },
    [addTag, removeTag, tagInput.length, tags.length]
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

  // 템플릿 선택 대화상자 열기
  const handleTemplateSelectDialogOpen = useCallback(() => {
    setIsTemplateSelectDialogOpen(true);
  }, []);

  // 템플릿 선택 대화상자 닫기
  const handleTemplateSelectDialogClose = useCallback(() => {
    setIsTemplateSelectDialogOpen(false);
  }, []);

  // 템플릿 선택 해제
  const handleTemplateUnselect = useCallback(() => {
    setTemplateUuid(null);
  }, []);

  // 오류 메시지 초기화
  const handleClearErrorMessage = useCallback(() => {
    setErrorMessage("");
  }, []);

  // 취소 버튼 클릭
  const handleCancelButtonClick = useCallback(() => {
    // 게시글 ID가 존재하지 않으면 커뮤니티 페이지로 이동
    if (!postId) {
      navigate("/community");
    } else {
      navigate(`/community/${postId}`);
    }
  }, [navigate, postId]);

  // 등록 버튼 클릭
  const handleConfirmButtonClick = useCallback(async () => {
    // 제목이 비어있으면 오류 출력
    if (!title.trim()) {
      setTitleErrorText("제목을 입력해 주세요.");
      if (titleTextFieldRef.current) {
        titleTextFieldRef.current.focus(); // 제목 입력란 포커스
        titleTextFieldRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    // 내용이 비어있으면 오류 출력
    if (!content.trim()) {
      setContentErrorText("내용을 입력해 주세요.");
      if (contentEditorContainerRef.current) {
        contentEditorContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    // 요청 데이터 생성
    const requestData = {
      title: title.trim(),
      content: content.trim(),
      tags: tags.map((tag) => tag.trim()),
      templateUuid: templateUuid,
    };

    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      if (postId) {
        // 게시글 수정 API 호출
        const response = await axiosInstance.put(
          `/post/${postId}`,
          requestData,
          {
            headers: { "X-CSRF-Token": csrfToken },
          }
        );

        // API 호출 성공 시
        if (response.data.success) {
          const updatedPostId = response.data.post.uuid; // 응답에서 게시글 ID 가져오기

          // 게시글 ID가 존재하면 해당 게시글로 이동
          if (updatedPostId) {
            navigate(`/community/${updatedPostId}`);
          } else {
            setErrorMessage("게시글을 수정하지 못했습니다.");
          }
        }
      } else {
        // 게시글 등록 API 호출
        const response = await axiosInstance.post("/post/add", requestData, {
          headers: { "X-CSRF-Token": csrfToken },
        });

        // API 호출 성공 시
        if (response.data.success) {
          const postId = response.data.post.uuid; // 응답에서 게시글 ID 가져오기

          // 게시글 ID가 존재하면 해당 게시글로 이동
          if (postId) {
            navigate(`/community/${postId}`);
          } else {
            setErrorMessage("게시글을 등록하지 못했습니다.");
          }
        }
      }
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      setErrorMessage("게시글을 등록하지 못했습니다.");
    }
  }, [content, navigate, postId, tags, templateUuid, title]);

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
                ref={titleTextFieldRef}
                variant="outlined"
                placeholder="제목을 입력해 주세요."
                value={title}
                onChange={handleTitleChange}
                error={!!titleErrorText}
                helperText={titleErrorText}
                sx={{
                  "& input": {
                    backgroundColor: grey[100],
                  },
                }}
              />
            </Stack>
          </Paper>

          {/* 게시글 입력란 */}
          <Box ref={contentEditorContainerRef}>
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
              <PostEditor
                content={content}
                setContent={handleContentChange}
                error={!!contentErrorText}
              />

              {/* 태그 입력란 */}
              <Stack position="absolute" bottom={0} left={0} width="100%">
                {/* 구분선 */}
                <Divider
                  variant="middle"
                  sx={{
                    borderColor: contentErrorText ? red[500] : grey[300],
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
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={0.25}
                      sx={
                        isTagInputFocused
                          ? {
                              backgroundColor: grey[200],
                              borderRadius: "50px",
                              paddingX: 1.5,
                              minWidth: "50px",
                            }
                          : null
                      }
                    >
                      {/* # 태그 */}
                      {isTagInputFocused && (
                        <Typography variant="subtitle2" color="black">
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
                          color: "black",
                          fontSize: theme.typography.subtitle2.fontSize,
                        }}
                      />
                    </Stack>
                  </Stack>
                </ClickAwayListener>
              </Stack>
            </Box>

            {/* 에러 메시지 */}
            <Typography variant="subtitle2" color="error" ml={2} mt={0.5}>
              {contentErrorText}
            </Typography>
          </Box>

          {/* 템플릿 선택기 */}
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderStyle: "dashed",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {templateUuid ? (
              <>
                <Template uuid={templateUuid} height="80vh" paddgingX="24px" />

                <Stack
                  direction="row"
                  position="absolute"
                  bottom={24}
                  right={16}
                  gap={2}
                >
                  {/* 템플릿 선택 해제 버튼 */}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleTemplateUnselect}
                  >
                    <Typography variant="h6">선택 해제</Typography>
                  </Button>

                  {/* 템플릿 선택 버튼 */}
                  <Button
                    variant="contained"
                    onClick={handleTemplateSelectDialogOpen}
                  >
                    <Typography variant="h6">템플릿 선택</Typography>
                  </Button>
                </Stack>
              </>
            ) : (
              <Stack alignItems="center" padding={5} gap={2}>
                {/* 템플릿 아이콘 */}
                <CalendarMonthRoundedIcon
                  sx={{
                    fontSize: "6rem",
                  }}
                />

                {/* 템플릿 선택 버튼 */}
                <Button
                  variant="outlined"
                  onClick={handleTemplateSelectDialogOpen}
                >
                  <Typography variant="h6">템플릿 선택</Typography>
                </Button>
              </Stack>
            )}
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
              onClick={handleCancelButtonClick}
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
              onClick={handleConfirmButtonClick}
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

      {/* 템플릿 선택 대화상자 */}
      <TemplateSelectDialog
        open={isTemplateSelectDialogOpen}
        onClose={handleTemplateSelectDialogClose}
        onSelect={setTemplateUuid}
      />

      {/* 오류 스낵바 */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleClearErrorMessage}
      >
        <Alert
          onClose={handleClearErrorMessage}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CommunityPostEdit;
