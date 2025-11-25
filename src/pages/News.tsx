import {
    Box,
    Container,
    Stack,
    Typography,
    Skeleton,
    Alert,
    Chip,
    Paper,
    useTheme,
    alpha,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

// 공지사항 데이터 타입 정의
interface NewsItem {
    id: number;
    title: string;
    createdAt: string;
}

const News = () => {
    const navigate = useNavigate();
    const theme = useTheme();
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
        } catch {
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
                    createdAt: "2025-11-25",
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
        <Container maxWidth="md">
            <Stack minHeight="calc(100vh - 82px)" py={5} gap={4}>
                {/* 헤더 섹션 */}
                <Stack gap={1}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <CampaignRoundedIcon 
                            sx={{ 
                                fontSize: 36, 
                                color: theme.palette.primary.main 
                            }} 
                        />
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="text.primary"
                        >
                            공지사항
                        </Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary">
                        여행갈래의 새로운 소식을 확인하세요
                    </Typography>
                </Stack>

                {/* 공지사항 목록 */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        overflow: "hidden",
                    }}
                >
                    {isLoading ? (
                        // 로딩 상태
                        <Stack>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Box
                                    key={`news-skeleton-${index}`}
                                    sx={{
                                        p: 2.5,
                                        borderBottom: index < 5 ? `1px solid ${theme.palette.divider}` : "none",
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Stack gap={1} flex={1}>
                                            <Skeleton variant="text" width="70%" height={24} />
                                            <Skeleton variant="text" width={100} height={18} />
                                        </Stack>
                                        <Skeleton variant="circular" width={24} height={24} />
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    ) : error ? (
                        // 에러 상태
                        <Box p={3}>
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {error}
                            </Alert>
                        </Box>
                    ) : newsItems.length === 0 ? (
                        // 빈 상태
                        <Stack alignItems="center" justifyContent="center" gap={2} py={8}>
                            <CampaignRoundedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                            <Typography variant="body1" color="text.secondary">
                                공지사항이 없습니다
                            </Typography>
                        </Stack>
                    ) : (
                        // 공지사항 목록
                        <Stack>
                            {newsItems.map((news, index) => (
                                <Box
                                    key={news.id}
                                    onClick={() => handleNewsClick(news.id)}
                                    sx={{
                                        p: 2.5,
                                        cursor: "pointer",
                                        borderBottom: index < newsItems.length - 1 
                                            ? `1px solid ${theme.palette.divider}` 
                                            : "none",
                                        transition: "background-color 0.2s ease",
                                        "&:hover": {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                        },
                                    }}
                                >
                                    <Stack 
                                        direction="row" 
                                        alignItems="center" 
                                        justifyContent="space-between"
                                        gap={2}
                                    >
                                        <Stack gap={0.5} flex={1} minWidth={0}>
                                            {/* 제목과 NEW 배지 */}
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={500}
                                                    color="text.primary"
                                                    sx={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {news.title}
                                                </Typography>
                                                {isToday(news.createdAt) && (
                                                    <Chip
                                                        label="NEW"
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: theme.palette.error.main,
                                                            color: "white",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            height: 20,
                                                            minWidth: 40,
                                                            "& .MuiChip-label": {
                                                                px: 0.8,
                                                            },
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                            
                                            {/* 날짜 */}
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {new Date(news.createdAt).toLocaleDateString("ko-KR", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </Typography>
                                        </Stack>

                                        {/* 화살표 아이콘 */}
                                        <ChevronRightRoundedIcon 
                                            sx={{ 
                                                color: "text.disabled",
                                                flexShrink: 0,
                                            }} 
                                        />
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Paper>
            </Stack>
        </Container>
    );
};

export default News;