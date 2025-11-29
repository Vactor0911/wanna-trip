import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import PostEditor from "../components/text_editor/PostEditor";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useCallback, useEffect, useRef, useState } from "react";
import { grey, blue } from "@mui/material/colors";
import { useNavigate, useParams } from "react-router";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { useSnackbar } from "notistack";
import { useAtomValue } from "jotai";
import { wannaTripLoginStateAtom, Permission } from "../state";

// 카테고리 목록
const CATEGORIES = [
  "공지",
  "업데이트",
  "이벤트",
  "점검",
  "기타",
];

const NewsEdit = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { newsUuid } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const loginState = useAtomValue(wannaTripLoginStateAtom);
  
  // 관리자 권한 확인 (user가 아닌 경우)
  const isAdmin = loginState.isLoggedIn && 
      loginState.permission !== undefined && 
      loginState.permission !== Permission.USER;

  const [title, setTitle] = useState("");
  const [titleErrorText, setTitleErrorText] = useState("");
  const titleTextFieldRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [contentErrorText, setContentErrorText] = useState("");
  const contentEditorContainerRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState("공지");
  const [isImportant, setIsImportant] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 수정 모드인 경우 기존 데이터 불러오기
  const fetchNewsData = useCallback(async () => {
    if (!newsUuid) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/news/${newsUuid}`);

      if (response.data.success) {
        const news = response.data.news;
        setTitle(news.title);
        setContent(news.content);
        setCategory(news.category || "공지");
        setIsImportant(news.isImportant || false);
      } else {
        enqueueSnackbar("공지사항 정보를 가져오지 못했습니다.", {
          variant: "error",
        });
        navigate("/news");
      }
    } catch (error) {
      console.error("공지사항 정보 가져오기 실패:", error);
      enqueueSnackbar("공지사항 정보를 가져오지 못했습니다.", {
        variant: "error",
      });
      navigate("/news");
    } finally {
      setIsLoading(false);
    }
  }, [newsUuid, enqueueSnackbar, navigate]);

  useEffect(() => {
    // 관리자가 아니면 접근 불가
    if (!isAdmin) {
      enqueueSnackbar("관리자만 접근할 수 있습니다.", { variant: "error" });
      navigate("/news");
      return;
    }

    // 스크롤 제일 상단으로 이동
    window.scrollTo(0, 0);

    // newsUuid가 있으면 수정 모드
    if (newsUuid) {
      fetchNewsData();
    }
  }, [fetchNewsData, isAdmin, navigate, newsUuid, enqueueSnackbar]);

  // 제목 변경
  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
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
        setContentErrorText("");
      }
    },
    [contentErrorText]
  );

  // 카테고리 변경
  const handleCategoryChange = useCallback((event: SelectChangeEvent) => {
    setCategory(event.target.value);
  }, []);

  // 중요 공지 변경
  const handleIsImportantChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsImportant(event.target.checked);
    },
    []
  );

  // 취소 버튼 클릭
  const handleCancelButtonClick = useCallback(() => {
    if (newsUuid) {
      navigate(`/news/${newsUuid}`);
    } else {
      navigate("/news");
    }
  }, [navigate, newsUuid]);

  // 등록/수정 버튼 클릭
  const handleConfirmButtonClick = useCallback(async () => {
    // 제목 검증
    if (!title.trim()) {
      setTitleErrorText("제목을 입력해 주세요.");
      if (titleTextFieldRef.current) {
        titleTextFieldRef.current.focus();
        titleTextFieldRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    // 내용 검증
    if (!content.trim()) {
      setContentErrorText("내용을 입력해 주세요.");
      if (contentEditorContainerRef.current) {
        contentEditorContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    // 요청 데이터 생성
    const requestData = {
      title: title.trim(),
      content: content.trim(),
      category,
      isImportant,
    };

    try {
      setIsSubmitting(true);
      const csrfToken = await getCsrfToken();

      if (newsUuid) {
        // 수정 API 호출
        const response = await axiosInstance.put(
          `/news/${newsUuid}`,
          requestData,
          {
            headers: { "X-CSRF-Token": csrfToken },
          }
        );

        if (response.data.success) {
          enqueueSnackbar("공지사항이 수정되었습니다.", { variant: "success" });
          navigate(`/news/${newsUuid}`);
        }
      } else {
        // 등록 API 호출
        const response = await axiosInstance.post("/news", requestData, {
          headers: { "X-CSRF-Token": csrfToken },
        });

        if (response.data.success) {
          enqueueSnackbar("공지사항이 등록되었습니다.", { variant: "success" });
          const newNewsUuid = response.data.newsUuid;
          navigate(`/news/${newNewsUuid}`);
        }
      }
    } catch (error) {
      console.error("공지사항 저장 실패:", error);
      enqueueSnackbar(
        newsUuid
          ? "공지사항 수정에 실패했습니다."
          : "공지사항 등록에 실패했습니다.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title,
    content,
    category,
    isImportant,
    newsUuid,
    enqueueSnackbar,
    navigate,
  ]);

  // 로딩 중
  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md">
        <Stack minHeight="calc(100vh - 82px)" gap={4} py={5} pb={15}>
          {/* 페이지 헤더 */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 3,
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(33,150,243,0.05) 100%)"
                  : "linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(33,150,243,0.03) 100%)",
              border: `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(144,202,249,0.2)"
                  : "rgba(25,118,210,0.12)"
              }`,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)"
                    : "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {newsUuid ? "공지사항 수정" : "공지사항 작성"}
            </Typography>
          </Paper>

          {/* 제목 입력란 */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(144,202,249,0.2)"
                  : "rgba(25,118,210,0.12)"
              }`,
              overflow: "hidden",
            }}
          >
            <Stack padding={3} paddingX={4} gap={2}>
              {/* 헤더 */}
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 24,
                    borderRadius: 1,
                    background:
                      "linear-gradient(180deg, #1976d2 0%, #2196f3 100%)",
                  }}
                />
                <Typography variant="h6" fontWeight="bold">
                  제목
                </Typography>
              </Stack>

              <TextField
                ref={titleTextFieldRef}
                variant="outlined"
                placeholder="제목을 입력해 주세요."
                value={title}
                onChange={handleTitleChange}
                error={!!titleErrorText}
                helperText={titleErrorText}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : grey[50],
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: blue[300],
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: blue[500],
                    },
                  },
                }}
              />
            </Stack>
          </Paper>

          {/* 카테고리 및 중요 공지 설정 */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(144,202,249,0.2)"
                  : "rgba(25,118,210,0.12)"
              }`,
              overflow: "hidden",
            }}
          >
            <Stack padding={3} paddingX={4} gap={2}>
              {/* 헤더 */}
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 24,
                    borderRadius: 1,
                    background:
                      "linear-gradient(180deg, #1976d2 0%, #2196f3 100%)",
                  }}
                />
                <Typography variant="h6" fontWeight="bold">
                  설정
                </Typography>
              </Stack>

              <Stack direction="row" gap={3} flexWrap="wrap" alignItems="center">
                {/* 카테고리 선택 */}
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>카테고리</InputLabel>
                  <Select
                    value={category}
                    label="카테고리"
                    onChange={handleCategoryChange}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 중요 공지 스위치 */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={isImportant}
                      onChange={handleIsImportantChange}
                      color="error"
                    />
                  }
                  label={
                    <Typography fontWeight={isImportant ? "bold" : "normal"}>
                      중요 공지
                    </Typography>
                  }
                />
              </Stack>
            </Stack>
          </Paper>

          {/* 내용 입력란 */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(144,202,249,0.2)"
                  : "rgba(25,118,210,0.12)"
              }`,
              overflow: "hidden",
            }}
          >
            <Stack padding={3} paddingX={4} gap={2}>
              {/* 헤더 */}
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 24,
                    borderRadius: 1,
                    background:
                      "linear-gradient(180deg, #1976d2 0%, #2196f3 100%)",
                  }}
                />
                <Typography variant="h6" fontWeight="bold">
                  내용
                </Typography>
              </Stack>

              <Box ref={contentEditorContainerRef}>
                <Box
                  position="relative"
                  sx={{
                    "& .ck-content": {
                      minHeight: "300px",
                    },
                  }}
                >
                  <PostEditor
                    content={content}
                    setContent={handleContentChange}
                    error={!!contentErrorText}
                  />
                </Box>

                {/* 에러 메시지 */}
                {contentErrorText && (
                  <Typography variant="subtitle2" color="error" ml={2} mt={0.5}>
                    {contentErrorText}
                  </Typography>
                )}
              </Box>
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
              variant="outlined"
              onClick={handleCancelButtonClick}
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                px: 4,
                borderColor: grey[400],
                color: "text.secondary",
                "&:hover": {
                  borderColor: grey[500],
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : grey[100],
                },
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                취소
              </Typography>
            </Button>

            {/* 등록/수정 버튼 */}
            <Button
              variant="contained"
              endIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendRoundedIcon />
                )
              }
              onClick={handleConfirmButtonClick}
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                px: 4,
                background:
                  "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                },
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {newsUuid ? "수정" : "등록"}
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

export default NewsEdit;
