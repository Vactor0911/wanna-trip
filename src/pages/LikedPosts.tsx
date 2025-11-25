import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { getRandomColor } from "../utils";
import { useNavigate } from "react-router";
import axiosInstance, { SERVER_HOST } from "../utils/axiosInstance";
import { useAtomValue } from "jotai";
import { isAuthInitializedAtom, wannaTripLoginStateAtom } from "../state";
import { enqueueSnackbar } from "notistack";
import ScrollToTopButton from "../components/ScrollToTopButton";

interface LikedPostInterface {
  uuid: string;
  title: string;
  authorName: string;
  authorProfileImage?: string;
  content?: string;
  tags?: string[];
  liked: boolean;
  likes: number;
  shares: number;
  comments: number;
  thumbnail?: string;
  likedAt: string;
}

const LikedPosts = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<LikedPostInterface[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadedPages, setLoadedPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false); // 초기 로딩 완료 여부

  const loginState = useAtomValue(wannaTripLoginStateAtom);
  const isAuthInitialized = useAtomValue(isAuthInitializedAtom);

  // 접속시 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 로그인하지 않은 경우 리다이렉트
  useEffect(() => {
    if (isAuthInitialized && !loginState.isLoggedIn) {
      enqueueSnackbar("로그인이 필요합니다.", { variant: "info" });
      navigate("/login");
    }
  }, [isAuthInitialized, loginState.isLoggedIn, navigate]);

  // 좋아요 한 게시글 불러오기
  const fetchLikedPosts = useCallback(async (page: number) => {
    if (isLoading || !loginState.isLoggedIn) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosInstance.get(
        `/post/likes/posts?page=${page}`
      );

      if (response.data.success) {
        const responsePosts: LikedPostInterface[] = response.data.posts.map(
          (post: LikedPostInterface) => ({
            uuid: post.uuid,
            title: post.title,
            authorName: post.authorName,
            authorProfileImage: post.authorProfileImage,
            content: post.content,
            tags: post.tags || [],
            liked: post.liked,
            likes: post.likes,
            shares: post.shares,
            comments: post.comments,
            thumbnail: post.thumbnail,
            likedAt: post.likedAt,
          })
        );

        // 중복 게시글 제거
        setPosts((prev) => {
          const existingUuids = new Set(prev.map((p) => p.uuid));
          const newPosts = responsePosts.filter(
            (p) => !existingUuids.has(p.uuid)
          );
          return [...prev, ...newPosts];
        });

        // hasMore 상태 설정
        setHasNextPage(response.data.hasMore);

        // 페이지 증가
        setLoadedPages(page + 1);
        setIsInitialLoaded(true);
      }
    } catch (error) {
      console.error("좋아요 한 게시글 불러오기 실패:", error);
      setHasNextPage(false);
      setIsInitialLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, loginState.isLoggedIn]);

  // 초기 로딩
  useEffect(() => {
    if (isAuthInitialized && loginState.isLoggedIn && !isInitialLoaded && !isLoading) {
      fetchLikedPosts(loadedPages);
    }
  }, [isAuthInitialized, loginState.isLoggedIn, isInitialLoaded, isLoading, loadedPages, fetchLikedPosts]);

  // 더보기 버튼 클릭
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasNextPage) {
      fetchLikedPosts(loadedPages);
    }
  }, [isLoading, hasNextPage, loadedPages, fetchLikedPosts]);

  // 게시글 클릭
  const handlePostClick = useCallback(
    (postUuid: string) => {
      navigate(`/community/${postUuid}`);
    },
    [navigate]
  );

  // 썸네일 URL 가져오기
  const getThumbnailUrl = (post: LikedPostInterface): string | null => {
    if (post.thumbnail) {
      return post.thumbnail;
    }
    // 내용에서 이미지 추출
    if (!post.content) return null;
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = post.content.match(imgRegex);
    return match ? match[1] : null;
  };

  return (
    <Container maxWidth="xl">
      <Stack minHeight="calc(100vh - 82px)" my={8} gap={4}>
        {/* 좋아요 한 게시글 섹션 */}
        <Box
          sx={{
            position: "relative",
            borderRadius: 4,
            p: 3,
            background: "linear-gradient(135deg, rgba(244,63,94,0.06) 0%, rgba(251,113,133,0.06) 50%, rgba(253,164,175,0.06) 100%)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #f43f5e, #fb7185, #fda4af)",
            },
          }}
        >
          <Stack gap={3}>
            {/* 헤더 */}
            <Stack direction="row" alignItems="center" gap={1.5}>
              {/* 하트 아이콘 */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)",
                  boxShadow: "0 4px 12px rgba(244,63,94,0.4)",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>❤️</Typography>
              </Box>
              <Stack>
                <Typography variant="h5" fontWeight="bold">
                  좋아요 한 게시글
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  내가 좋아요 누른 여행 이야기
                </Typography>
              </Stack>
            </Stack>

            {/* 게시글 목록 */}
            {posts.length === 0 && !isLoading ? (
              <Stack
                justifyContent="center"
                alignItems="center"
                gap={2}
                py={8}
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 3,
                }}
              >
                <FavoriteBorderRoundedIcon
                  sx={{ fontSize: 64, color: "text.secondary" }}
                />
                <Typography variant="h6" color="text.secondary">
                  좋아요 한 게시글이 없습니다.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  게시판에서 마음에 드는 게시글에 좋아요를 눌러보세요!
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/community")}
                  sx={{
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)",
                    boxShadow: "0 4px 12px rgba(244,63,94,0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)",
                      boxShadow: "0 6px 16px rgba(244,63,94,0.4)",
                    },
                  }}
                >
                  게시판으로 이동
                </Button>
              </Stack>
            ) : (
              <Stack gap={2}>
                {posts.map((post) => (
                  <Paper
                    elevation={0}
                    key={`liked-post-${post.uuid}`}
                    sx={{
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateX(8px)",
                        boxShadow: "0 8px 24px rgba(244,63,94,0.12)",
                      },
                    }}
                  >
                    <ButtonBase
                      onClick={() => handlePostClick(post.uuid)}
                      sx={{
                        width: "100%",
                        "& .MuiTypography-root": {
                          textAlign: "left",
                        },
                      }}
                    >
                      <Stack
                        width="100%"
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        padding={2}
                        gap={2.5}
                      >
                        {/* 썸네일 이미지 */}
                        <Box
                          width={{
                            xs: "100%",
                            sm: 220,
                          }}
                          height={160}
                          borderRadius={2.5}
                          sx={{
                            flexShrink: 0,
                            background: getRandomColor(post.title.length),
                            backgroundImage: getThumbnailUrl(post)
                              ? `url(${getThumbnailUrl(post)})`
                              : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          }}
                        />

                        {/* 게시글 정보 */}
                        <Stack
                          flex={1}
                          py={0.5}
                          minWidth={0}
                        >
                          {/* 제목 */}
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            noWrap
                            sx={{ mb: 0.5 }}
                          >
                            {post.title}
                          </Typography>

                          {/* 작성자 정보 */}
                          <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                            <Avatar
                              src={
                                post.authorProfileImage
                                  ? `${SERVER_HOST}${post.authorProfileImage}`
                                  : undefined
                              }
                              sx={{ width: 24, height: 24 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {post.authorName}
                            </Typography>
                          </Stack>

                          {/* 태그 */}
                          {post.tags && post.tags.length > 0 && (
                            <Stack
                              direction="row"
                              gap={0.75}
                              sx={{
                                mt: 0.5,
                                flexWrap: "wrap",
                                overflow: "hidden",
                                maxHeight: 28,
                              }}
                            >
                              {post.tags.map((tag, index) => (
                                <Chip
                                  key={`tag-${index}`}
                                  label={`#${tag}`}
                                  size="small"
                                  sx={{
                                    height: 24,
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    bgcolor: "rgba(244,63,94,0.1)",
                                    color: "#f43f5e",
                                    border: "1px solid",
                                    borderColor: "rgba(244,63,94,0.2)",
                                    "& .MuiChip-label": {
                                      px: 1.25,
                                    },
                                  }}
                                />
                              ))}
                            </Stack>
                          )}

                          {/* 하단 정보 영역 */}
                          <Box mt="auto">
                            <Stack
                              direction="row"
                              justifyContent="flex-end"
                              alignItems="center"
                              gap={0.5}
                              mt={1.5}
                            >
                              {/* 좋아요 한 날짜 */}
                              {post.likedAt && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mr: "auto" }}
                                >
                                  {new Date(post.likedAt).toLocaleDateString(
                                    "ko-KR",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </Typography>
                              )}

                              {/* 좋아요 수 */}
                              <Stack direction="row" alignItems="center" gap={0.5}>
                                <FavoriteRoundedIcon
                                  color="error"
                                  sx={{ fontSize: 20 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {post.likes}
                                </Typography>
                              </Stack>

                              {/* 공유 수 */}
                              <Stack direction="row" alignItems="center" gap={0.5} ml={1}>
                                <IosShareRoundedIcon
                                  sx={{ fontSize: 20, color: "text.secondary" }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {post.shares}
                                </Typography>
                              </Stack>

                              {/* 댓글 수 */}
                              <Stack direction="row" alignItems="center" gap={0.5} ml={1}>
                                <ChatBubbleOutlineRoundedIcon
                                  sx={{ fontSize: 20, color: "text.secondary" }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {post.comments}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Box>
                        </Stack>
                      </Stack>
                    </ButtonBase>
                  </Paper>
                ))}

                {/* 로딩 스켈레톤 */}
                {isLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <Paper
                      elevation={0}
                      key={`liked-post-skeleton-${index}`}
                      sx={{
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        overflow: "hidden",
                      }}
                    >
                      <Stack
                        width="100%"
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        padding={2}
                        gap={2.5}
                      >
                        {/* 썸네일 이미지 */}
                        <Skeleton
                          variant="rectangular"
                          height={160}
                          sx={{
                            width: {
                              xs: "100%",
                              sm: 220,
                            },
                            borderRadius: 2.5,
                            flexShrink: 0,
                          }}
                          animation="wave"
                        />

                        {/* 게시글 정보 */}
                        <Stack flex={1} minWidth={0}>
                          {/* 제목 */}
                          <Skeleton
                            variant="text"
                            width="60%"
                            height="2rem"
                            animation="wave"
                          />

                          {/* 작성자 */}
                          <Stack direction="row" alignItems="center" gap={1} mt={0.5}>
                            <Skeleton
                              variant="circular"
                              width={24}
                              height={24}
                              animation="wave"
                            />
                            <Skeleton
                              variant="text"
                              width="80px"
                              animation="wave"
                            />
                          </Stack>

                          {/* 태그 */}
                          <Stack direction="row" gap={1} mt={1}>
                            <Skeleton
                              variant="rounded"
                              width={60}
                              height={24}
                              animation="wave"
                            />
                            <Skeleton
                              variant="rounded"
                              width={80}
                              height={24}
                              animation="wave"
                            />
                          </Stack>

                          {/* 게시글 정보 */}
                          <Box mt="auto">
                            <Stack
                              direction="row"
                              justifyContent="flex-end"
                              alignItems="center"
                              gap={2}
                              mt={2}
                            >
                              <Skeleton
                                variant="text"
                                width="100px"
                                animation="wave"
                                sx={{ mr: "auto" }}
                              />
                              <Skeleton variant="text" width="40px" animation="wave" />
                              <Skeleton variant="text" width="40px" animation="wave" />
                              <Skeleton variant="text" width="40px" animation="wave" />
                            </Stack>
                          </Box>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}

                {/* 더보기 버튼 */}
                {hasNextPage && !isLoading && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleLoadMore}
                    startIcon={<KeyboardArrowDownRoundedIcon />}
                    sx={{
                      alignSelf: "center",
                      px: 5,
                      py: 1.5,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)",
                      boxShadow: "0 4px 12px rgba(244,63,94,0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)",
                        boxShadow: "0 6px 16px rgba(244,63,94,0.4)",
                      },
                    }}
                  >
                    더보기
                  </Button>
                )}

                {/* 로딩 중 표시 */}
                {isLoading && posts.length > 0 && (
                  <Stack alignItems="center" py={2}>
                    <CircularProgress size={32} sx={{ color: "#f43f5e" }} />
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>

      {/* 최상단 이동 버튼 */}
      <ScrollToTopButton />
    </Container>
  );
};

export default LikedPosts;
