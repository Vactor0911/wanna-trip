import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import parse from "html-react-parser";
import { CircularProgress } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// 공지사항 인터페이스
interface NewsPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isImportant: boolean;
  category: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  action?: React.ReactNode;
}

const NewsPost = () => {
  const { newsId } = useParams(); // 공지사항 ID
  const navigate = useNavigate(); // 네비게이션 훅

  const [isLoading, setIsLoading] = useState(false); // 공지사항 로딩 여부
  const [error, setError] = useState(""); // 에러 메시지
  const [newsPost, setNewsPost] = useState<NewsPost | null>(null); // 공지사항 데이터

  // 스낵바 상태
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });


  // 공지사항 데이터 가져오기
  const fetchNewsPostData = useCallback(async () => {
    if (!newsId) return;

    try {
      setIsLoading(true);
      setError("");

      // 실제 API 호출 (현재는 목업 데이터 사용)
      // const response = await axiosInstance.get(`/news/${newsId}`);
      
      // 목업 데이터 (실제로는 DB에서 가져올 데이터)
      const mockNewsPost: NewsPost = {
        id: parseInt(newsId),
        title: "SRT 여객 운송약관 개정 안내",
        content: `
          <h2>SRT 여객 운송약관 개정 안내</h2>
          <p>안녕하세요. SRT 고객 여러분께 중요한 안내 말씀을 드립니다.</p>
          
          <h3>1. 개정 사항</h3>
          <ul>
            <li>운임 체계 개선</li>
            <li>환불 정책 변경</li>
            <li>이용 약관 보완</li>
          </ul>
          
          <h3>2. 시행 일정</h3>
          <p>2025년 10월 1일부터 새로운 약관이 적용됩니다.</p>
          
          <h3>3. 주요 변경 내용</h3>
          <p>자세한 내용은 SRT 공식 홈페이지를 참고해 주시기 바랍니다.</p>
          
          <p>문의사항이 있으시면 고객센터로 연락해 주시기 바랍니다.</p>
        `,
        createdAt: "2025-10-16T10:00:00Z",
        isImportant: true,
        category: "서비스",
      };

      // 실제 API 호출 시 사용할 코드
      // if (response.data.success) {
      //   setNewsPost(response.data.news);
      // } else {
      //   setError("공지사항을 불러오는데 실패했습니다.");
      // }

      setNewsPost(mockNewsPost);
    } catch (err) {
      console.error("공지사항 로딩 실패:", err);
      setError("공지사항을 불러오는데 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [newsId]);

  // 컴포넌트 마운트 시 공지사항 데이터 로드
  useEffect(() => {
    fetchNewsPostData();
  }, [fetchNewsPostData]);

  // 상대 시간 포맷팅 함수
  const formatRelativeTime = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch (e) {
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
    } catch (e) {
      return dateString;
    }
  }, []);

  // 목록 버튼 클릭
  const handleReturnButtonClick = useCallback(() => {
    navigate("/news");
  }, [navigate]);

  // 스낵바 닫기
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <Container maxWidth="lg">
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
      <Container maxWidth="lg">
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
      <Container maxWidth="lg">
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
      <Container maxWidth="lg">
        <Stack
          minHeight="calc(100vh - 82px)"
          gap={4}
          py={5}
          pb={15}
        >
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
              
              return isToday && (
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
                {formatDate(newsPost.createdAt)} ({formatRelativeTime(newsPost.createdAt)})
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
          </Stack>
        </Stack>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
            action={snackbar.action}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default NewsPost;
