import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useState } from "react";
import parse from "html-react-parser";
import { CircularProgress } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useAtomValue } from "jotai";
import { wannaTripLoginStateAtom, Permission } from "../state";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { useSnackbar } from "notistack";

// 공지사항 인터페이스
interface NewsPost {
  uuid: string;
  title: string;
  content: string;
  createdAt: string;
  isImportant: boolean;
  category: string;
  authorName: string;
}

const NewsPost = () => {
  const { newsUuid } = useParams(); // 공지사항 UUID
  const navigate = useNavigate(); // 네비게이션 훅
  const { enqueueSnackbar } = useSnackbar();
  const loginState = useAtomValue(wannaTripLoginStateAtom);
  
  // 관리자 권한 확인 (user가 아닌 경우)
  const isAdmin = loginState.isLoggedIn && 
      loginState.permission !== undefined && 
      loginState.permission !== Permission.USER;

  const [isLoading, setIsLoading] = useState(false); // 공지사항 로딩 여부
  const [error, setError] = useState(""); // 에러 메시지
  const [newsPost, setNewsPost] = useState<NewsPost | null>(null); // 공지사항 데이터

  // 삭제 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 공지사항 데이터 가져오기
  const fetchNewsPostData = useCallback(async () => {
    if (!newsUuid) return;

    try {
      setIsLoading(true);
      setError("");

      // 실제 API 호출
      const response = await axiosInstance.get(`/news/${newsUuid}`);

      if (response.data.success) {
        const news = response.data.news;
        setNewsPost({
          uuid: news.uuid,
          title: news.title,
          content: news.content,
          createdAt: news.createdAt,
          isImportant: news.isImportant,
          category: news.category,
          authorName: news.authorName,
        });
      } else {
        setError("공지사항을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("공지사항 로딩 실패:", err);
      setError("공지사항을 불러오는데 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [newsUuid]);

  // 컴포넌트 마운트 시 공지사항 데이터 로드
  useEffect(() => {
    fetchNewsPostData();
  }, [fetchNewsPostData]);

  // 상대 시간 포맷팅 함수
  const formatRelativeTime = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch {
      return dateString;
    }
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  }, []);

  // 목록 버튼 클릭
  const handleReturnButtonClick = useCallback(() => {
    navigate("/news");
  }, [navigate]);

  // 수정 버튼 클릭
  const handleEditButtonClick = useCallback(() => {
    navigate(`/news/edit/${newsUuid}`);
  }, [navigate, newsUuid]);

  // 삭제 확인 핸들러
  const handleDeleteConfirm = useCallback(async () => {
    if (!newsUuid) return;

    try {
      setIsDeleting(true);
      const csrfToken = await getCsrfToken();
      const response = await axiosInstance.delete(`/news/${newsUuid}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        enqueueSnackbar("공지사항이 삭제되었습니다.", { variant: "success" });
        navigate("/news");
      }
    } catch (error) {
      console.error("공지사항 삭제 실패:", error);
      enqueueSnackbar("공지사항 삭제에 실패했습니다.", { variant: "error" });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [newsUuid, enqueueSnackbar, navigate]);

  // 로딩 중 표시
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

  // 에러 표시
  if (error) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  // 공지사항이 없는 경우
  if (!newsPost) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Typography>공지사항을 찾을 수 없습니다.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md">
        <Stack minHeight="calc(100vh - 82px)" gap={4} py={5} pb={15}>
          {/* 공지사항 제목 */}
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h4" fontWeight={700} color="#191f28">
              {newsPost.title}
            </Typography>
            {(() => {
              const today = new Date();
              const postDate = new Date(newsPost.createdAt);
              const isToday =
                today.getFullYear() === postDate.getFullYear() &&
                today.getMonth() === postDate.getMonth() &&
                today.getDate() === postDate.getDate();

              return (
                isToday && (
                  <Box
                    sx={{
                      backgroundColor: "#ff4757",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: 600,
                      height: "20px",
                      px: 1,
                      py: 0,
                      borderRadius: "10px", // 둥근 직사각형
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "32px",
                    }}
                  >
                    NEW
                  </Box>
                )
              );
            })()}
          </Stack>

          {/* 작성 정보 */}
          <Stack direction="row" alignItems="center" gap={2}>
            <Stack>
              {/* 카테고리 */}
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                {newsPost.category}
              </Typography>

              {/* 작성일 */}
              <Typography variant="subtitle2" color="text.secondary">
                {formatDate(newsPost.createdAt)} (
                {formatRelativeTime(newsPost.createdAt)})
              </Typography>
            </Stack>
          </Stack>

          {/* 구분선 */}
          <Divider />

          {/* 공지사항 내용 */}
          <Stack
            py={5}
            gap={0.5}
            sx={{
              "& p, & ol, & ul": {
                margin: 0,
                padding: 0,
                boxSizing: "border-box",
              },
              "& ol, & ul": {
                paddingLeft: "1em",
              },
              "& table, & table th, & table td": {
                border: "1px solid #bfbfbf",
                borderCollapse: "collapse",
              },
              "& table th, & table td": {
                padding: "6.4px",
              },
              "& table thead": {
                background: "rgba(0, 0, 0, 0.05)",
              },
              "& figure.image > img": {
                width: "100%",
                height: "auto",
              },
              "& figure.image, & figure.image.image-style-block-align-center": {
                marginX: "auto",
              },
              "& figure.image.image-style-block-align-left": {
                marginX: 0,
                marginRight: "auto",
              },
              "& figure.image.image-style-block-align-right": {
                marginX: 0,
                marginLeft: "auto",
              },
            }}
          >
            {newsPost.content && parse(newsPost.content)}
          </Stack>

          {/* 버튼 컨테이너 */}
          <Stack
            direction="row"
            gap={3}
            justifyContent="flex-end"
            alignItems="center"
            flexWrap="wrap"
          >
            {/* 목록 버튼 */}
            <Button
              variant="outlined"
              color="black"
              onClick={handleReturnButtonClick}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                목록
              </Typography>
            </Button>

            {/* 관리자 전용 버튼 */}
            {isAdmin && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleEditButtonClick}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    수정
                  </Typography>
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    삭제
                  </Typography>
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Container>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>공지사항 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            "{newsPost?.title}" 공지사항을 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            삭제된 공지사항은 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} /> : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewsPost;
