import {
  Avatar,
  Box,
  Button,
  ButtonBase,
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
import { getRandomColor, stripHtml } from "../utils";
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
        {/* 헤더 */}
        <Typography variant="h4" fontWeight="bold">
          좋아요 한 게시글
        </Typography>

        {/* 게시글 목록 */}
        {posts.length === 0 && !isLoading ? (
          <Stack
            flex={1}
            justifyContent="center"
            alignItems="center"
            gap={2}
            py={8}
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
            <ButtonBase
              onClick={() => navigate("/community")}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                게시판으로 이동
              </Typography>
            </ButtonBase>
          </Stack>
        ) : (
          <Stack gap={2}>
            {posts.map((post) => (
              <Paper
                elevation={2}
                key={`liked-post-${post.uuid}`}
                sx={{
                  borderRadius: 2,
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
                    padding={1}
                    gap={2}
                  >
                    {/* 썸네일 이미지 */}
                    <Box
                      width={{
                        xs: "100%",
                        sm: 200,
                      }}
                      height={150}
                      borderRadius={2}
                      sx={{
                        background: getRandomColor(post.title.length),
                        backgroundImage: getThumbnailUrl(post)
                          ? `url(${getThumbnailUrl(post)})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    {/* 게시글 정보 */}
                    <Stack
                      width={{
                        xs: "100%",
                        sm: "calc(100% - 200px)",
                      }}
                      gap={0.5}
                    >
                      {/* 제목 */}
                      <Typography variant="h5" noWrap>
                        {post.title}
                      </Typography>

                      {/* 작성자 정보 */}
                      <Stack direction="row" alignItems="center" gap={1}>
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
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          noWrap
                        >
                          #{post.tags.join(" #")}
                        </Typography>
                      )}

                      {/* 내용 미리보기 */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ flex: 1 }}
                      >
                        {stripHtml(post.content)}
                      </Typography>

                      {/* 게시글 정보 */}
                      <Box mt="auto">
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          alignItems="center"
                          gap={1}
                          mt={1}
                        >
                          {/* 좋아요 수 */}
                          <Typography variant="subtitle2">
                            {post.likes}
                          </Typography>
                          <FavoriteRoundedIcon color="error" />

                          {/* 공유 수 */}
                          <Typography variant="subtitle2">
                            {post.shares}
                          </Typography>
                          <IosShareRoundedIcon
                            sx={{
                              transform: "translateY(-2px)",
                            }}
                          />

                          {/* 댓글 수 */}
                          <Typography variant="subtitle2">
                            {post.comments}
                          </Typography>
                          <ChatBubbleOutlineRoundedIcon />
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
                  elevation={2}
                  key={`liked-post-skeleton-${index}`}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <Stack
                    width="100%"
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    padding={1}
                    gap={2}
                  >
                    {/* 썸네일 이미지 */}
                    <Skeleton
                      variant="rectangular"
                      height={150}
                      sx={{
                        width: {
                          xs: "100%",
                          sm: 200,
                        },
                        borderRadius: 2,
                      }}
                      animation="wave"
                    />

                    {/* 게시글 정보 */}
                    <Stack
                      width={{
                        xs: "100%",
                        sm: "calc(100% - 200px)",
                      }}
                    >
                      {/* 제목 */}
                      <Skeleton
                        variant="text"
                        width="200px"
                        height="3rem"
                        animation="wave"
                      />

                      {/* 작성자 */}
                      <Stack direction="row" alignItems="center" gap={1}>
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
                      <Skeleton
                        variant="text"
                        width="100px"
                        height="1.5rem"
                        animation="wave"
                      />

                      {/* 게시글 정보 */}
                      <Box mt="auto">
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          alignItems="center"
                          gap={1}
                          mt={1}
                        >
                          <Skeleton
                            variant="text"
                            width="30px"
                            animation="wave"
                          />
                          <FavoriteRoundedIcon color="error" />
                          <Skeleton
                            variant="text"
                            width="30px"
                            animation="wave"
                          />
                          <IosShareRoundedIcon
                            sx={{ transform: "translateY(-2px)" }}
                          />
                          <Skeleton
                            variant="text"
                            width="30px"
                            animation="wave"
                          />
                          <ChatBubbleOutlineRoundedIcon />
                        </Stack>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              ))}

            {/* 더보기 버튼 */}
            {hasNextPage && !isLoading && (
              <Button
                variant="outlined"
                size="large"
                onClick={handleLoadMore}
                startIcon={<KeyboardArrowDownRoundedIcon />}
                sx={{
                  alignSelf: "center",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                더보기
              </Button>
            )}

            {/* 로딩 중 표시 */}
            {isLoading && posts.length > 0 && (
              <Stack alignItems="center" py={2}>
                <CircularProgress size={32} />
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      {/* 최상단 이동 버튼 */}
      <ScrollToTopButton />
    </Container>
  );
};

export default LikedPosts;
