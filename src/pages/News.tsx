import {
    Box,
    Container,
    Stack,
    Typography,
    Skeleton,
    Alert,
    Divider,
    Chip,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

// 공지사항 데이터 타입 정의
interface NewsItem {
    id: number;
    title: string;
    createdAt: string;
}

const News = () => {
    const navigate = useNavigate();
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 오늘 날짜인지 확인하는 함수
    const isToday = useCallback((dateString: string) => {
        try {
            const today = new Date();
            const targetDate = new Date(dateString);
            
            return (
                today.getFullYear() === targetDate.getFullYear() &&
                today.getMonth() === targetDate.getMonth() &&
                today.getDate() === targetDate.getDate()
            );
        } catch (error) {
            return false;
        }
    }, []);

    // 공지사항 데이터 불러오기
    const fetchNews = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 실제 API 호출 (현재는 목업 데이터 사용)
            // const response = await axiosInstance.get("/news");

            // 토스 스타일 목업 데이터
            const mockNewsData: NewsItem[] = [
                {
                    id: 1,
                    title: "SRT 여객 운송약관 개정 안내 (~2025.12)",
                    createdAt: "2025-10-16",
                },
                {
                    id: 2,
                    title: "8월 대출신청 이벤트 당첨자 안내",
                    createdAt: "2025-01-15",
                },
                {
                    id: 3,
                    title: "정부서비스 일시 장애로 인한 일부 서비스 중단 안내",
                    createdAt: "2025-01-14",
                },
                {
                    id: 4,
                    title: "위치기반서비스 이용약관 변경 안내",
                    createdAt: "2025-01-13",
                },
                {
                    id: 5,
                    title: "여행갈래 서비스 이용약관 개정 안내",
                    createdAt: "2025-01-12",
                },
                {
                    id: 6,
                    title: "개인정보 처리방침 변경 안내",
                    createdAt: "2025-01-11",
                },
                {
                    id: 7,
                    title: "모바일 앱 업데이트 안내",
                    createdAt: "2025-01-10",
                },
                {
                    id: 8,
                    title: "서비스 정기 점검 안내",
                    createdAt: "2025-01-09",
                },
            ];

            // 실제 API 호출 시 사용할 코드
            // if (response.data.success) {
            //   setNewsItems(response.data.news);
            // } else {
            //   setError("공지사항을 불러오는데 실패했습니다.");
            // }

            setNewsItems(mockNewsData);
        } catch (error) {
            console.error("공지사항 불러오기 실패:", error);
            setError("공지사항을 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 컴포넌트 마운트 시 공지사항 불러오기
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // 공지사항 클릭 핸들러
    const handleNewsClick = useCallback((newsId: number) => {
        navigate(`/news/${newsId}`);
    }, [navigate]);

    return (
        <Container maxWidth="xl">
            <Stack minHeight="calc(100vh - 82px)" my={4} gap={8}>
                <Stack gap={2}>
                    {/* 페이지 제목 */}
                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: "32px",
                            fontWeight: 800,
                            color: "#191f28",
                            marginBottom: "8px",
                        }}
                    >
                        공지사항
                    </Typography>

                    {/* 공지사항 목록 */}
                    <Stack gap={0}>
                        {isLoading ? (
                             // 로딩 상태
                             Array.from({ length: 8 }).map((_, index) => (
                                 <Box key={`news-skeleton-${index}`} sx={{ py: 2 }}>
                                     <Stack gap={1}>
                                         <Stack direction="row" justifyContent="space-between" alignItems="center">
                                             <Skeleton variant="text" width="70%" height="24px" />
                                             <Skeleton variant="rounded" width="40px" height="20px" />
                                         </Stack>
                                         <Skeleton variant="text" width="80px" height="16px" />
                                     </Stack>
                                     {index < 7 && (
                                         <Divider sx={{ mt: 2, borderColor: "#f2f3f5" }} />
                                     )}
                                 </Box>
                             ))
                        ) : error ? (
                            // 에러 상태
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {error}
                            </Alert>
                        ) : (
                             // 공지사항 목록
                             newsItems.map((news, index) => (
                                 <Box key={news.id}>
                                     <Box
                                         sx={{
                                             py: 3,
                                             cursor: "pointer",
                                             "&:hover": {
                                                 backgroundColor: "#f8f9fa",
                                             },
                                         }}
                                         onClick={() => handleNewsClick(news.id)}
                                     >
                                         <Stack gap={1}>
                                             {/* 제목과 NEW 배지 */}
                                             <Stack direction="row" alignItems="center" gap={1}>
                                                 <Typography
                                                     variant="body1"
                                                     sx={{
                                                         fontSize: "16px",
                                                         fontWeight: 600,
                                                         color: "#191f28",
                                                         lineHeight: 1.5,
                                                     }}
                                                 >
                                                     {news.title}
                                                 </Typography>
                                                 {isToday(news.createdAt) && (
                                                     <Chip
                                                         label="NEW"
                                                         size="small"
                                                         sx={{
                                                             backgroundColor: "#ff4757",
                                                             color: "white",
                                                             fontSize: "11px",
                                                             fontWeight: 600,
                                                             height: "20px",
                                                             "& .MuiChip-label": {
                                                                 px: 1,
                                                             },
                                                         }}
                                                     />
                                                 )}
                                             </Stack>
                                             
                                             {/* 날짜 */}
                                             <Typography
                                                 variant="body2"
                                                 sx={{
                                                     fontSize: "14px",
                                                     fontWeight: 400,
                                                     color: "#8b95a1",
                                                 }}
                                             >
                                                 {new Date(news.createdAt).toLocaleDateString("ko-KR", {
                                                     year: "numeric",
                                                     month: "long",
                                                     day: "numeric",
                                                 })}
                                             </Typography>
                                         </Stack>
                                     </Box>
                                     {index < newsItems.length - 1 && (
                                         <Divider sx={{ borderColor: "#f2f3f5" }} />
                                     )}
                                 </Box>
                             ))
                        )}
                    </Stack>

                    {/* 빈 상태 */}
                    {!isLoading && !error && newsItems.length === 0 && (
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            gap={3}
                            py={8}
                        >
                            <Typography variant="h6" color="text.secondary">
                                공지사항이 없습니다
                            </Typography>
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </Container>
    );
};

export default News;