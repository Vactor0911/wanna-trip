import {
  Avatar,
  Box,
  ButtonBase,
  Container,
  Fab,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import HorizontalCarousel from "../components/HorizontalCarousel";
import { getRandomColor, stripHtml } from "../utils";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { useNavigate } from "react-router";
import axiosInstance, { SERVER_HOST } from "../utils/axiosInstance";
import { useBreakpoint } from "../hooks";

interface PostInterface {
  uuid: string; // 게시글 UUID
  title: string; // 게시글 제목
  authorName: string; // 작성자 이름
  authorProfileImage?: string; // 프로필 이미지 URL
  content?: string; // 게시글 내용
  tags?: string[]; // 게시글 태그 목록
  liked: boolean; // 좋아요 여부
  likes: number; // 좋아요 수
  shares: number; // 공유 수
  comments: number; // 댓글 수
}

const TEST_TAGS: string[] = [
  "서울",
  "여름",
  "시원한",
  "계곡",
  "테스트",
  "방학",
  "시골",
  "산",
  "바다",
];

const Community = () => {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();

  const [popularPosts, setPopularPosts] = useState<PostInterface[]>([]); // 인기 게시글 목록
  const [tags, setTags] = useState<string[]>(TEST_TAGS); // 태그 목록
  const [keyword, setKeyword] = useState(""); // 검색어
  const [posts, setPosts] = useState<PostInterface[]>([]); // 일반 게시판 게시글 목록
  const [hasNextPage, setHasNextPage] = useState(true); // 무한 스크롤을 위한 다음 페이지 여부
  const [loadedPages, setLoadedPages] = useState(1); // 로드된 페이지 수
  const sentinelRef = useRef<HTMLDivElement>(null); // 무한 스크롤을 위한 센티넬
  const [isPostLoading, setIsPostLoading] = useState(false); // 게시글 로딩 상태
  const [isPopularPostsLoading, setIsPopularPostsLoading] = useState(false); // 인기 게시글 로딩 상태

  // 검색어 입력
  const handleKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(event.target.value);
    },
    []
  );

  // 게시글 불러오기
  const fetchPosts = useCallback(async () => {
    // 이미 로딩 중이거나 다음 페이지가 없으면 종료
    if (isPostLoading || !hasNextPage) {
      return;
    }

    try {
      setIsPostLoading(true);

      // 게시글 목록 불러오기 API 호출
      const response = await axiosInstance.get(`/post/page/${loadedPages}`);

      // 게시글 목록 업데이트
      if (response.data.success) {
        // 수신된 게시글 목록이 비어있으면 더 이상 불러올 게시글이 없음을 표시
        if (response.data.post.length <= 0) {
          setHasNextPage(false);
          return;
        }

        const responsePosts: PostInterface[] = response.data.post.map(
          (post: PostInterface) => ({
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
          })
        );

        const newPosts = [...posts, ...responsePosts];
        setPosts(newPosts);

        // 수신된 게시글 목록이 10개 미만이면 더 이상 불러올 게시글이 없음을 표시
        if (response.data.post.length < 10) {
          setHasNextPage(false);
        }

        // 로드한 페이지 수 증가
        setLoadedPages((prev) => prev + 1);
      }
    } catch (error) {
      console.error("게시글 불러오기 실패:", error);
      // 에러 처리 로직 추가 가능
      setHasNextPage(false); // 더 이상 불러올 게시글이 없음을 표시
    } finally {
      setIsPostLoading(false);
    }
  }, [hasNextPage, isPostLoading, loadedPages, posts]);

  // 인기 게시글 불러오기
  const fetchPopularPosts = useCallback(async () => {
    try {
      // 이미 로딩 중이면 종료
      if (isPopularPostsLoading) {
        return;
      }

      // 인기 게시글 로딩 상태 설정
      setIsPopularPostsLoading(true);

      // 인기 게시글 목록 불러오기 API 호출
      const response = await axiosInstance.get("/post/popular");

      // 인기 게시글 목록 업데이트
      if (response.data.success) {
        // 인기 게시글 목록이 비어있으면 종료
        if (response.data.post.length <= 0) {
          setPopularPosts([]);
          throw new Error("인기 게시글이 없습니다.");
        }

        const newPopularPostsData: PostInterface[] = response.data.post.map(
          (post: PostInterface) => ({
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
          })
        );
        setPopularPosts(newPopularPostsData);
      }
    } catch (error) {
      console.error("인기 게시글 불러오기 실패:", error);
      // TODO: 에러 처리 로직 추가 가능
    } finally {
      // 인기 게시글 로딩 상태 해제
      setIsPopularPostsLoading(false);
    }
  }, [isPopularPostsLoading]);

  // 컴포넌트 마운트 시 게시글과 인기 게시글 불러오기
  useEffect(() => {
    fetchPosts();
    fetchPopularPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스크롤 내리면 게시글 불러오기
  useEffect(() => {
    // 더 불러올 게시글이 없으면 종료
    if (!hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          //TODO: 게시글 더 불러오기
          console.log("더 불러오기");
        }
      },
      { rootMargin: `${window.innerHeight}px` } // rootMargin만큼 위에서 미리 트리거
    );

    const node = sentinelRef.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasNextPage]);

  // 글쓰기 버튼 클릭
  const handleCreatePostButtonClick = useCallback(() => {
    navigate("/community/edit");
  }, [navigate]);

  // 게시글 클릭
  const handlePostClick = useCallback(
    (postUuid: string) => {
      navigate(`/community/${postUuid}`);
    },
    [navigate]
  );

  return (
    <Container maxWidth="xl">
      <Stack minHeight="calc(100vh - 82px)" my={8} gap={12}>
        {/* 실시간 인기 게시글 */}
        <Stack gap={2}>
          {/* 헤더 */}
          <Typography variant="h5">실시간 인기 게시글</Typography>

          {/* 인기 게시글 목록 */}
          {isPopularPostsLoading ? (
            <Stack
              direction="row"
              gap={3}
              sx={{
                "& .MuiPaper-root:nth-of-type(2)": {
                  display: breakpoint === "xs" ? "none" : "block", // 두 번째 아이템은 숨김 처리
                },
                "& .MuiPaper-root:nth-of-type(3)": {
                  display:
                    breakpoint === "xs" || breakpoint === "sm"
                      ? "none"
                      : "block", // 두 번째 아이템은 숨김 처리
                },
              }}
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <Paper
                  key={`popular-post-skeleton-${index}`}
                  elevation={3}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "50%",
                      md: "33.33%",
                    },
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Stack width="100%" height={320}>
                    {/* 썸네일 이미지 */}
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height="55%"
                      animation="wave"
                    />

                    {/* 게시글 정보 */}
                    <Stack gap={1} padding={2} pl={8} flex={1}>
                      {/* 헤더 */}
                      <Stack position="relative">
                        {/* 제목 */}
                        <Skeleton
                          variant="text"
                          width="200px"
                          animation="wave"
                        />

                        {/* 작성자 */}
                        <Skeleton
                          variant="text"
                          width="100px"
                          animation="wave"
                        />

                        {/* 작성자 프로필 이미지 */}
                        <Skeleton
                          variant="circular"
                          width={42}
                          height={42}
                          animation="wave"
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: -50,
                            transform: "translateY(-50%)",
                          }}
                        />
                      </Stack>

                      {/* 내용 */}
                      <Skeleton variant="text" width="80%" animation="wave" />

                      <Stack
                        direction="row"
                        gap={1.5}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        {/* 좋아요 */}
                        <Stack direction="row" alignItems="center" gap={0.5}>
                          {/* 좋아요 수 */}
                          <Skeleton
                            variant="text"
                            width="30px"
                            animation="wave"
                          />

                          {/* 좋아요 아이콘 */}
                          <FavoriteBorderRoundedIcon />
                        </Stack>

                        {/* 공유 */}
                        <Stack direction="row" alignItems="center" gap={0.5}>
                          {/* 공유 수 */}
                          <Skeleton
                            variant="text"
                            width="30px"
                            animation="wave"
                          />

                          {/* 공유 아이콘 */}
                          <IosShareRoundedIcon
                            sx={{
                              transform: "translateY(-2px)",
                            }}
                          />
                        </Stack>

                        {/* 댓글 */}
                        <Stack direction="row" alignItems="center" gap={0.5}>
                          {/* 댓글 수 */}
                          <Skeleton
                            variant="text"
                            width="30px"
                            animation="wave"
                          />

                          {/* 댓글 아이콘 */}
                          <ChatBubbleOutlineRoundedIcon />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            // 인기 게시글 목록
            <HorizontalCarousel
              visibleCount={{
                xs: 1,
                sm: 2,
                md: 3,
              }}
            >
              {popularPosts.map((post, index) => (
                <Paper
                  key={`popular-post-${index}`}
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
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
                    <Stack width="100%" height={320}>
                      {/* 썸네일 이미지 */}
                      <Box
                        height="55%"
                        sx={{ bgcolor: getRandomColor(parseInt(post.uuid)) }}
                      />

                      {/* 게시글 정보 */}
                      <Stack gap={1} padding={2} pl={8} flex={1}>
                        {/* 헤더 */}
                        <Stack position="relative">
                          {/* 제목 */}
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            noWrap
                          >
                            {post.title}
                          </Typography>

                          {/* 작성자 */}
                          <Typography variant="subtitle2">
                            {post.authorName}
                          </Typography>

                          {/* 작성자 프로필 이미지 */}
                          <Avatar
                            src={`${SERVER_HOST}${post.authorProfileImage}`}
                            sx={{
                              position: "absolute",
                              width: 42,
                              height: 42,
                              top: "50%",
                              left: -50,
                              transform: "translateY(-50%)",
                            }}
                          />
                        </Stack>

                        {/* 내용 */}
                        <Typography variant="subtitle2" noWrap>
                          {stripHtml(post.content)}
                        </Typography>

                        <Stack
                          direction="row"
                          gap={1.5}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          {/* 좋아요 */}
                          <Stack direction="row" alignItems="center" gap={0.5}>
                            {/* 좋아요 수 */}
                            <Typography variant="subtitle2">
                              {post.likes}
                            </Typography>

                            {/* 좋아요 아이콘 */}
                            {post.liked ? (
                              <FavoriteRoundedIcon color="error" />
                            ) : (
                              <FavoriteBorderRoundedIcon />
                            )}
                          </Stack>

                          {/* 공유 */}
                          <Stack direction="row" alignItems="center" gap={0.5}>
                            {/* 공유 수 */}
                            <Typography variant="subtitle2">
                              {post.shares}
                            </Typography>

                            {/* 공유 아이콘 */}
                            <IosShareRoundedIcon
                              sx={{
                                transform: "translateY(-2px)",
                              }}
                            />
                          </Stack>

                          {/* 댓글 */}
                          <Stack direction="row" alignItems="center" gap={0.5}>
                            {/* 댓글 수 */}
                            <Typography variant="subtitle2">
                              {post.comments}
                            </Typography>

                            {/* 댓글 아이콘 */}
                            <ChatBubbleOutlineRoundedIcon />
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </ButtonBase>
                </Paper>
              ))}
            </HorizontalCarousel>
          )}
        </Stack>

        {/* 인기 태그 */}
        <Stack gap={2}>
          {/* 헤더 */}
          <Typography variant="h5">인기 태그</Typography>

          {/* 인기 게시글 목록 */}
          <HorizontalCarousel
            visibleCount={{
              xs: 2,
              sm: 3,
              md: 5,
            }}
          >
            {tags.map((tag, index) => (
              <Paper
                key={`tag-${index}`}
                sx={{
                  background: getRandomColor(index),
                }}
              >
                <Stack justifyContent="center" alignItems="center" height={150}>
                  <Typography
                    variant="h4"
                    width="100%"
                    textAlign="center"
                    noWrap
                  >
                    {tag}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </HorizontalCarousel>
        </Stack>

        {/* 일반 게시판 */}
        <Stack gap={2}>
          {/* 헤더 */}
          <Stack direction="row" alignItems="center">
            <Typography variant="h5">일반 게시판</Typography>

            {/* 검색창 */}
            <Paper
              elevation={2}
              sx={{
                width: "300px",
                ml: "auto",
              }}
            >
              <OutlinedInput
                fullWidth
                value={keyword}
                onChange={handleKeywordChange}
                placeholder="제목, 작성자, 태그 검색"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchRoundedIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Paper>
          </Stack>

          {/* 게시글 로딩 중 */}
          {isPostLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Paper
                elevation={2}
                key={`post-skeleton-${index}`}
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

                    {/* 태그 */}
                    <Skeleton
                      variant="text"
                      width="100px"
                      height="2rem"
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
                        {/* 좋아요 수 */}
                        <Skeleton
                          variant="text"
                          width="30px"
                          animation="wave"
                        />
                        <FavoriteBorderRoundedIcon />

                        {/* 공유 수 */}
                        <Skeleton
                          variant="text"
                          width="30px"
                          animation="wave"
                        />
                        <IosShareRoundedIcon
                          sx={{
                            transform: "translateY(-2px)",
                          }}
                        />

                        {/* 댓글 수 */}
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

          {/* 게시글 */}
          {posts?.map((post) => (
            <Paper
              elevation={2}
              key={`post-${post.uuid}`}
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
                      background: getRandomColor(parseInt(post.uuid)),
                    }}
                  />

                  {/* 게시글 정보 */}
                  <Stack
                    width={{
                      xs: "100%",
                      sm: "calc(100% - 200px)",
                    }}
                  >
                    {/* 제목 */}
                    <Typography variant="h5" noWrap>
                      {post.title}
                    </Typography>

                    {/* 태그 */}
                    {post.tags && post.tags.length > 0 && (
                      <Typography variant="subtitle1" noWrap>
                        #{post.tags?.join(" #")}
                      </Typography>
                    )}

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
                        {post.liked ? (
                          <FavoriteRoundedIcon color="error" />
                        ) : (
                          <FavoriteBorderRoundedIcon />
                        )}

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

          {/* 스크롤 감지 센티넬 */}
          <Box ref={sentinelRef} />
        </Stack>
      </Stack>

      {/* 글쓰기 버튼 */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 40,
          right: 40,
        }}
        onClick={handleCreatePostButtonClick}
      >
        <CreateRoundedIcon
          sx={{
            fontSize: "1.75rem",
          }}
        />
      </Fab>
    </Container>
  );
};

export default Community;
