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
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import HorizontalCarousel from "../components/HorizontalCarousel";
import { getRandomColor } from "../utils";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { useNavigate } from "react-router";

interface PostInterface {
  id: string;
  title: string;
  authorName: string;
  content?: string;
  tags?: string[];
  likes: number;
  shares: number;
  comments: number;
}

const TEST_POPULAR_POSTS: PostInterface[] = [
  {
    id: "1",
    title: "파워 J를 위한 일본 여행 완벽 플래너",
    authorName: "고뮤르",
    content:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["일본", "여행", "플래너"],
    likes: 400,
    shares: 0,
    comments: 40,
  },
  {
    id: "2",
    title: "파워 J를 위한 일본 여행 완벽 플래너",
    authorName: "고뮤르",
    content:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["일본", "여행", "플래너"],
    likes: 400,
    shares: 0,
    comments: 40,
  },
  {
    id: "3",
    title: "파워 J를 위한 일본 여행 완벽 플래너",
    authorName: "고뮤르",
    content:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["일본", "여행", "플래너"],
    likes: 400,
    shares: 0,
    comments: 40,
  },
  {
    id: "4",
    title: "파워 J를 위한 일본 여행 완벽 플래너",
    authorName: "고뮤르",
    content:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["일본", "여행", "플래너"],
    likes: 400,
    shares: 0,
    comments: 40,
  },
  {
    id: "5",
    title: "파워 J를 위한 일본 여행 완벽 플래너",
    authorName: "고뮤르",
    content:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    likes: 400,
    shares: 0,
    comments: 40,
  },
  {
    id: "6",
    title: "파워 J를 위한 일본 여행 완벽 플래너",
    authorName: "고뮤르",
    content:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    likes: 400,
    shares: 0,
    comments: 40,
  },
  {
    id: "7",
    title: "파워 J를 위한 일본 여행 완벽 플래너",
    authorName: "고뮤르",
    content:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    likes: 400,
    shares: 0,
    comments: 40,
  },
  {
    id: "8",
    title: "파워 J를 위한 일본 여행 완벽 플래너",
    authorName: "고뮤르",
    content:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    likes: 400,
    shares: 0,
    comments: 40,
  },
];

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [popularPosts, setPopularPosts] =
    useState<PostInterface[]>(TEST_POPULAR_POSTS); // 인기 게시글 목록
  const [tags, setTags] = useState<string[]>(TEST_TAGS); // 태그 목록
  const [keyword, setKeyword] = useState(""); // 검색어
  const [posts, setPosts] = useState<PostInterface[] | null>(
    TEST_POPULAR_POSTS
  ); // 일반 게시판 게시글 목록
  const hasNextPage = useRef(true); // 무한 스크롤을 위한 다음 페이지 여부
  const loadedPages = useState(1); // 로드된 페이지 수
  const sentinelRef = useRef<HTMLDivElement>(null); // 무한 스크롤을 위한 센티넬

  // 검색어 입력
  const handleKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(event.target.value);
    },
    []
  );

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

  return (
    <Container maxWidth="xl">
      <Stack minHeight="calc(100vh - 82px)" my={8} gap={12}>
        {/* 실시간 인기 게시글 */}
        <Stack gap={2}>
          {/* 헤더 */}
          <Typography variant="h5">실시간 인기 게시글</Typography>

          {/* 인기 게시글 목록 */}
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
                      sx={{ bgcolor: getRandomColor(parseInt(post.id)) }}
                    />

                    {/* 게시글 정보 */}
                    <Stack gap={1} padding={2} pl={8} flex={1}>
                      {/* 헤더 */}
                      <Stack position="relative">
                        {/* 제목 */}
                        <Typography variant="subtitle1" fontWeight="bold">
                          {post.title}
                        </Typography>

                        {/* 작성자 */}
                        <Typography variant="subtitle2">
                          {post.authorName}
                        </Typography>

                        {/* 작성자 프로필 이미지 */}
                        <Avatar
                          src=""
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
                        {post.content}
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
                          <FavoriteRoundedIcon color="error" />
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
        </Stack>

        {/* 여행 카테고리 */}
        <Stack gap={2}>
          {/* 헤더 */}
          <Typography variant="h5">인기 카테고리</Typography>

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

          {/* 게시글 */}
          {posts?.map((post) => (
            <Paper
              elevation={2}
              key={`post-${post.id}`}
              sx={{
                borderRadius: 2,
              }}
            >
              <ButtonBase
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
                      background: getRandomColor(parseInt(post.id)),
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
                      <Typography variant="subtitle1">
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
