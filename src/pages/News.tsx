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
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useAtomValue } from "jotai";
import { wannaTripLoginStateAtom, Permission } from "../state";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { useSnackbar } from "notistack";

// 공지사항 데이터 타입 정의
interface NewsItem {
    uuid: string;
    title: string;
    category: string;
    isImportant: boolean;
    authorName: string;
    createdAt: string;
}

// 페이지당 표시할 항목 수
const ITEMS_PER_PAGE = 10;

const News = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const loginState = useAtomValue(wannaTripLoginStateAtom);
    
    // 관리자 권한 확인 (user가 아닌 경우)
    const isAdmin = loginState.isLoggedIn && 
        loginState.permission !== undefined && 
        loginState.permission !== Permission.USER;

    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // 삭제 다이얼로그 상태
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetUuid, setDeleteTargetUuid] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);


    // 공지사항 데이터 불러오기
    const fetchNews = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 실제 API 호출
            const response = await axiosInstance.get("/news", {
                params: { page: currentPage, limit: ITEMS_PER_PAGE },
            });

            if (response.data.success) {
                setNewsItems(response.data.news);
                setTotalCount(response.data.pagination.total);
            } else {
                setError("공지사항을 불러오는데 실패했습니다.");
            }
        } catch (error) {
            console.error("공지사항 불러오기 실패:", error);
            setError("공지사항을 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    // 컴포넌트 마운트 시 공지사항 불러오기
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // 페이지네이션 계산
    const totalPages = useMemo(() => Math.ceil(totalCount / ITEMS_PER_PAGE), [totalCount]);

    // 공지사항 클릭 핸들러
    const handleNewsClick = useCallback((newsUuid: string) => {
        navigate(`/news/${newsUuid}`);
    }, [navigate]);

    // 페이지 변경 핸들러
    const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // 삭제 버튼 클릭 핸들러
    const handleDeleteClick = useCallback((e: React.MouseEvent, newsUuid: string) => {
        e.stopPropagation();
        setDeleteTargetUuid(newsUuid);
        setDeleteDialogOpen(true);
    }, []);

    // 삭제 확인 핸들러
    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteTargetUuid) return;

        try {
            setIsDeleting(true);
            const csrfToken = await getCsrfToken();
            const response = await axiosInstance.delete(`/news/${deleteTargetUuid}`, {
                headers: { "X-CSRF-Token": csrfToken },
            });

            if (response.data.success) {
                enqueueSnackbar("공지사항이 삭제되었습니다.", { variant: "success" });
                fetchNews();
            }
        } catch (error) {
            console.error("공지사항 삭제 실패:", error);
            enqueueSnackbar("공지사항 삭제에 실패했습니다.", { variant: "error" });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setDeleteTargetUuid(null);
        }
    }, [deleteTargetUuid, enqueueSnackbar, fetchNews]);

    // 수정 버튼 클릭 핸들러
    const handleEditClick = useCallback((e: React.MouseEvent, newsUuid: string) => {
        e.stopPropagation();
        navigate(`/news/edit/${newsUuid}`);
    }, [navigate]);

    // 작성 버튼 클릭 핸들러
    const handleCreateClick = useCallback(() => {
        navigate("/news/create");
    }, [navigate]);

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
                                        variant="h5"
                                        fontWeight={700}
                                        color="text.primary"
                                    >
                                        공지사항
                                    </Typography>
                                    <Chip
                                        label={`${totalCount}건`}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            fontWeight: 600,
                                            fontSize: 12,
                                        }}
                                    />
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
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
                            {newsItems.map((news, index) => (
                                <Box
                                    key={news.uuid}
                                    onClick={() => handleNewsClick(news.uuid)}
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
                                            {/* 제목과 배지 */}
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                {/* 중요 공지 표시 */}
                                                {news.isImportant && (
                                                    <Chip
                                                        label="중요"
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: theme.palette.warning.main,
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
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={news.isImportant ? 600 : 500}
                                                    color="text.primary"
                                                    sx={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {news.title}
                                                </Typography>
                                                {/* NEW 배지 - 3일 이내 */}
                                                {(() => {
                                                    const createdDate = new Date(news.createdAt);
                                                    const now = new Date();
                                                    const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                                                    return diffDays <= 3;
                                                })() && (
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

                                        {/* 관리자용 수정/삭제 버튼 */}
                                        {isAdmin ? (
                                            <Stack direction="row" gap={0.5}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleEditClick(e, news.uuid)}
                                                    sx={{
                                                        color: theme.palette.primary.main,
                                                        "&:hover": {
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                        },
                                                    }}
                                                >
                                                    <EditRoundedIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleDeleteClick(e, news.uuid)}
                                                    sx={{
                                                        color: theme.palette.error.main,
                                                        "&:hover": {
                                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                        },
                                                    }}
                                                >
                                                    <DeleteRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        ) : (
                                            <ChevronRightRoundedIcon 
                                                sx={{ 
                                                    color: "text.disabled",
                                                    flexShrink: 0,
                                                }} 
                                            />
                                        )}
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
                            총 {totalCount}개의 공지사항
                        </Typography>
                    </Stack>
                )}
            </Stack>

            {/* 삭제 확인 다이얼로그 */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        minWidth: 320,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    공지사항 삭제
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        이 공지사항을 삭제하시겠습니까?
                        <br />
                        삭제된 공지사항은 복구할 수 없습니다.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        color="inherit"
                        sx={{ borderRadius: 2 }}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                        sx={{ borderRadius: 2 }}
                    >
                        {isDeleting ? "삭제 중..." : "삭제"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 관리자용 플로팅 작성 버튼 */}
            {isAdmin && (
                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleCreateClick}
                    sx={{
                        position: "fixed",
                        right: 32,
                        bottom: 32,
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        zIndex: 1000,
                        "&:hover": {
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
                        },
                    }}
                >
                    공지사항 작성
                </Button>
            )}
        </Container>
    );
};

export default News;