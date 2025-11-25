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
    Pagination,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

// 공지사항 데이터 타입 정의
interface NewsItem {
    id: number;
    title: string;
    createdAt: string;
}

// 페이지당 표시할 항목 수
const ITEMS_PER_PAGE = 10;

const News = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);


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
                    title: "11월 신규 가입 이벤트 당첨자 발표",
                    createdAt: "2025-11-25",
                },
                {
                    id: 3,
                    title: "8월 대출신청 이벤트 당첨자 안내",
                    createdAt: "2025-01-15",
                },
                {
                    id: 4,
                    title: "정부서비스 일시 장애로 인한 일부 서비스 중단 안내",
                    createdAt: "2025-01-14",
                },
                {
                    id: 5,
                    title: "위치기반서비스 이용약관 변경 안내",
                    createdAt: "2025-01-13",
                },
                {
                    id: 6,
                    title: "여행갈래 서비스 이용약관 개정 안내",
                    createdAt: "2025-01-12",
                },
                {
                    id: 7,
                    title: "개인정보 처리방침 변경 안내",
                    createdAt: "2025-01-11",
                },
                {
                    id: 8,
                    title: "모바일 앱 업데이트 안내 (v2.5.0)",
                    createdAt: "2025-01-10",
                },
                {
                    id: 9,
                    title: "서비스 정기 점검 안내 (01/09 02:00~06:00)",
                    createdAt: "2025-01-09",
                },
                {
                    id: 10,
                    title: "제주도 여행 특가 프로모션 안내",
                    createdAt: "2025-01-08",
                },
                {
                    id: 11,
                    title: "2025년 새해 맞이 이벤트 안내",
                    createdAt: "2025-01-07",
                },
                {
                    id: 12,
                    title: "연말 시스템 점검 완료 공지",
                    createdAt: "2025-01-06",
                },
                {
                    id: 13,
                    title: "여행 보험 서비스 제휴 안내",
                    createdAt: "2025-01-05",
                },
                {
                    id: 14,
                    title: "고객센터 운영시간 변경 안내",
                    createdAt: "2025-01-04",
                },
                {
                    id: 15,
                    title: "부산 해운대 숙소 예약 서비스 오픈",
                    createdAt: "2025-01-03",
                },
                {
                    id: 16,
                    title: "일본 여행 비자 면제 재개 안내",
                    createdAt: "2025-01-02",
                },
                {
                    id: 17,
                    title: "KTX 연동 서비스 일시 중단 안내",
                    createdAt: "2025-01-01",
                },
                {
                    id: 18,
                    title: "2024년 연간 인기 여행지 TOP 10 발표",
                    createdAt: "2024-12-31",
                },
                {
                    id: 19,
                    title: "크리스마스 시즌 특별 할인 이벤트",
                    createdAt: "2024-12-25",
                },
                {
                    id: 20,
                    title: "동계 여행 안전 가이드라인 안내",
                    createdAt: "2024-12-20",
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

    // 페이지네이션 계산
    const totalPages = useMemo(() => Math.ceil(newsItems.length / ITEMS_PER_PAGE), [newsItems.length]);
    
    const paginatedNews = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return newsItems.slice(startIndex, endIndex);
    }, [newsItems, currentPage]);

    // 공지사항 클릭 핸들러
    const handleNewsClick = useCallback((newsId: number) => {
        navigate(`/news/${newsId}`);
    }, [navigate]);

    // 페이지 변경 핸들러
    const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <Container maxWidth="md">
            <Stack minHeight="calc(100vh - 82px)" py={5} gap={4}>
                {/* 헤더 섹션 */}
                <Box
                    sx={{
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 100%)`,
                        borderRadius: 4,
                        p: 4,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* 배경 장식 */}
                    <NotificationsActiveRoundedIcon
                        sx={{
                            position: "absolute",
                            right: -20,
                            top: -20,
                            fontSize: 180,
                            color: alpha(theme.palette.primary.main, 0.06),
                            transform: "rotate(15deg)",
                        }}
                    />
                    
                    <Stack gap={1.5} position="relative" zIndex={1}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 48,
                                    height: 48,
                                    borderRadius: 3,
                                    bgcolor: theme.palette.primary.main,
                                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                }}
                            >
                                <CampaignRoundedIcon 
                                    sx={{ 
                                        fontSize: 28, 
                                        color: "white",
                                    }} 
                                />
                            </Box>
                            <Box>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                        color="text.primary"
                                    >
                                        공지사항
                                    </Typography>
                                    <Chip
                                        label={`${newsItems.length}건`}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            fontWeight: 600,
                                            fontSize: 12,
                                        }}
                                    />
                                </Stack>
                                <Typography variant="body2" color="text.secondary" mt={0.5}>
                                    여행갈래의 새로운 소식을 확인하세요
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>

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
                            {paginatedNews.map((news, index) => (
                                <Box
                                    key={news.id}
                                    onClick={() => handleNewsClick(news.id)}
                                    sx={{
                                        p: 2.5,
                                        cursor: "pointer",
                                        borderBottom: index < paginatedNews.length - 1 
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
                                                {/* 임시: 처음 2개 항목에 NEW 표시 */}
                                                {currentPage === 1 && index < 2 && (
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
                                                                px: 1,
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

                {/* 페이지네이션 */}
                {!isLoading && !error && newsItems.length > 0 && totalPages > 1 && (
                    <Stack alignItems="center" mt={2}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                            sx={{
                                "& .MuiPaginationItem-root": {
                                    color: theme.palette.text.secondary,
                                    borderRadius: 2,
                                    "&:hover": {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                    },
                                    "&.Mui-selected": {
                                        backgroundColor: theme.palette.primary.main,
                                        color: "white",
                                        "&:hover": {
                                            backgroundColor: theme.palette.primary.dark,
                                        },
                                    },
                                },
                            }}
                        />
                        <Typography variant="body2" color="text.secondary" mt={1}>
                            총 {newsItems.length}개의 공지사항
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </Container>
    );
};

export default News;