import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import HorizontalCarousel from "../components/HorizontalCarousel";
import { getRandomColor, stripHtml } from "../utils";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useNavigate } from "react-router";
import axiosInstance, { SERVER_HOST } from "../utils/axiosInstance";
import { useBreakpoint } from "../hooks";
import axios from "axios";
import { useAtomValue } from "jotai";
import { isAuthInitializedAtom, wannaTripLoginStateAtom } from "../state";
import { enqueueSnackbar } from "notistack";

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
  views: number; // 조회수
  comments: number; // 댓글 수
  thumbnail?: string; // 썸네일 URL (내용 이미지 또는 템플릿 썸네일)
  createdAt?: string; // 작성일
}

// 좋아요 상태 저장/조회 헬퍼 함수
const saveLikedStatus = (postUuid: string, liked: boolean) => {
  try {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
    likedPosts[postUuid] = liked;
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
  } catch (error) {
    console.error("좋아요 상태 저장 실패:", error);
  }
};

// 1. 좋아요 상태 가져오는 함수
const getLikedStatus = (postUuid: string): boolean => {
  try {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
    return !!likedPosts[postUuid];
  } catch (error) {
    console.error("좋아요 상태 가져오기 실패:", error);
    return false;
  }
};

const Community = () => {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();

  const [popularPosts, setPopularPosts] = useState<PostInterface[]>([]); // 인기 게시글 목록
  const [keyword, setKeyword] = useState(""); // 검색어
  const [searchKeyword, setSearchKeyword] = useState(""); // 실제 검색에 사용되는 검색어
  const [posts, setPosts] = useState<PostInterface[]>([]); // 일반 게시판 게시글 목록
  const [hasNextPage, setHasNextPage] = useState(true); // 다음 페이지 여부
  const [loadedPages, setLoadedPages] = useState(1); // 로드된 페이지 수
  const [isPostLoading, setIsPostLoading] = useState(false); // 게시글 로딩 상태
  const [isPopularPostsLoading, setIsPopularPostsLoading] = useState(false); // 인기 게시글 로딩 상태
  const [isInitialLoaded, setIsInitialLoaded] = useState(false); // 초기 로딩 완료 여부
  const fetchControllerRef = useRef<AbortController | null>(null); // API 요청을 취소하기 위한 AbortController

  // 로그인 상태 가져오기
  const loginState = useAtomValue(wannaTripLoginStateAtom);

  // 인증 초기화 상태 가져오기
  const isAuthInitialized = useAtomValue(isAuthInitializedAtom);

  // 컴포넌트 마운트 시 로컬 좋아요 상태 불러오기 (기존 useEffect 위에 추가)
  useEffect(() => {
    // 로컬 스토리지의 좋아요 상태 로드 (첫 렌더링에만)
    try {
      // 현재 표시된 인기 게시글에 로컬 스토리지 좋아요 상태 적용
      if (popularPosts.length > 0) {
        const updatedPosts = popularPosts.map((post) => ({
          ...post,
          liked: getLikedStatus(post.uuid), // 로컬 스토리지의 좋아요 상태 적용
        }));

        setPopularPosts(updatedPosts);
      }
    } catch (error) {
      console.error("좋아요 상태 불러오기 실패:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 접속시 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 게시글 불러오기 중지
  const cancelFetchPosts = useCallback(() => {
    fetchControllerRef.current?.abort();
    fetchControllerRef.current = null;
    setIsPostLoading(false);
  }, []);

  // 게시글 불러오기
  const fetchPosts = useCallback(
    async (page: number, keyword: string = searchKeyword) => {
      // 다음 페이지가 없으면 종료
      if (!hasNextPage) {
        return;
      }

      // 이전 요청 중지
      cancelFetchPosts();

      // AbortController 생성
      const controller = new AbortController();
      fetchControllerRef.current = controller;

      try {
        setIsPostLoading(true);

        // 로그인 상태에 따라 다른 엔드포인트 호출
        const endpoint = loginState.isLoggedIn
          ? "/post/auth/page"
          : "/post/page";

        // 게시글 목록 불러오기 API 호출
        const response = await axiosInstance.get(
          `${endpoint}/?${
            !keyword ? "" : `keyword=${keyword}&`
          }page=${page}`
        );

        // 게시글 목록 업데이트
        if (response.data.success) {
          // 수신된 게시글 목록이 비어있으면 더 이상 불러올 게시글이 없음을 표시
          if (response.data.post.length <= 0) {
            setHasNextPage(false);
            setIsInitialLoaded(true); // 빈 결과도 로딩 완료로 처리
            return;
          }

          const responsePosts: PostInterface[] = response.data.post.map(
            (post: PostInterface) => {
              // 로컬에 저장된 좋아요 상태 가져오기
              const localLiked = getLikedStatus(post.uuid);

              // 서버에서 받은 값 (로그인된 경우)
              const serverLiked = post.liked || false;

              // 서버 값 우선시하여 로컬 스토리지 업데이트
              saveLikedStatus(post.uuid, serverLiked);

              return {
                uuid: post.uuid,
                title: post.title,
                authorName: post.authorName,
                authorProfileImage: post.authorProfileImage,
                content: post.content,
                tags: post.tags || [],
                liked: serverLiked || localLiked, // 서버 또는 로컬 좋아요 상태 사용
                likes: post.likes,
                shares: post.shares,
                views: post.views,
                comments: post.comments,
                thumbnail: post.thumbnail, // 서버에서 전달받은 썸네일
                createdAt: post.createdAt, // 작성일
              };
            }
          );

          const newPosts = [...posts, ...responsePosts];
          setPosts(newPosts);

          // 수신된 게시글 목록이 10개 미만이면 더 이상 불러올 게시글이 없음을 표시
          if (response.data.post.length < 10) {
            setHasNextPage(false);
          }

          // 로드한 페이지 수 증가
          setLoadedPages(page + 1);
          setIsInitialLoaded(true);
        }
      } catch (error) {
        if (
          (typeof error === "object" &&
            error !== null &&
            "name" in error &&
            (error as { name?: string }).name === "CanceledError") ||
          axios.isCancel?.(error)
        ) {
          // 요청이 취소된 경우
        } else {
          console.error("게시글 불러오기 실패:", error);
          if (
            typeof error === "object" &&
            error !== null &&
            "response" in error &&
            (error as { response?: { status?: number } }).response?.status !==
              401
          ) {
            setHasNextPage(false);
          }
        }
      } finally {
        setIsPostLoading(false);
        fetchControllerRef.current = null;
      }
    },
    [cancelFetchPosts, hasNextPage, loginState.isLoggedIn, posts, searchKeyword]
  );

  // 컴포넌트 언마운트 시 요청 취소
  useEffect(() => {
    return () => {
      cancelFetchPosts();
    };
  }, [cancelFetchPosts]);

  // 검색어 입력 (입력만, 검색 실행하지 않음)
  const handleKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(event.target.value);
    },
    []
  );

  // 검색 실행
  const handleSearch = useCallback(() => {
    // 검색어 설정
    setSearchKeyword(keyword);

    // 게시글 다시 불러오기
    setPosts([]); // 기존 게시글 목록 초기화
    setHasNextPage(true); // 다음 페이지 여부 초기화
    setLoadedPages(1); // 로드된 페이지 수 초기화
    setIsInitialLoaded(false); // 초기 로딩 상태 초기화
  }, [keyword]);

  // 검색창 Enter 키 입력
  const handleKeywordKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // 더보기 버튼 클릭
  const handleLoadMore = useCallback(() => {
    if (!isPostLoading && hasNextPage) {
      fetchPosts(loadedPages);
    }
  }, [isPostLoading, hasNextPage, loadedPages, fetchPosts]);

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
      // 로그인 상태에 따라 다른 엔드포인트 호출
      const endpoint = loginState.isLoggedIn
        ? "/post/auth/popular"
        : "/post/popular";
      const response = await axiosInstance.get(endpoint);

      // 인기 게시글 목록 업데이트
      if (response.data.success) {
        // 인기 게시글 목록이 비어있으면 종료
        if (response.data.post.length <= 0) {
          setPopularPosts([]);
          throw new Error("인기 게시글이 없습니다.");
        }

        const newPopularPostsData: PostInterface[] = response.data.post.map(
          (post: PostInterface) => {
            // 로컬에 저장된 좋아요 상태 가져오기
            const localLiked = getLikedStatus(post.uuid);

            // 서버에서 받은 값 (로그인된 경우)
            const serverLiked = post.liked || false;

            // 서버 값 우선시하여 로컬 스토리지 업데이트
            saveLikedStatus(post.uuid, serverLiked);

            return {
              uuid: post.uuid,
              title: post.title,
              authorName: post.authorName,
              authorProfileImage: post.authorProfileImage,
              content: post.content,
              tags: post.tags || [],
              liked: serverLiked || localLiked, // 서버 또는 로컬 좋아요 상태 사용
              likes: post.likes,
              shares: post.shares,
              views: post.views,
              comments: post.comments,
              thumbnail: post.thumbnail, // 서버에서 전달받은 썸네일
              createdAt: post.createdAt, // 작성일
            };
          }
        );

        setPopularPosts(newPopularPostsData);
      }
    } catch (error) {
      console.error("인기 게시글 불러오기 실패:", error);
    } finally {
      // 인기 게시글 로딩 상태 해제
      setIsPopularPostsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 토큰 초기화 완료 시점에만 인기 게시글 호출
  useEffect(() => {
    if (isAuthInitialized) {
      // 인기 게시글 호출
      setTimeout(() => {
        fetchPopularPosts();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthInitialized]);

  // 초기 로딩 또는 검색어 변경 시 게시글 호출
  useEffect(() => {
    if (isAuthInitialized && !isInitialLoaded && !isPostLoading) {
      fetchPosts(loadedPages, searchKeyword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthInitialized, isInitialLoaded, searchKeyword]);

  // 글쓰기 버튼 클릭
  const handleCreatePostButtonClick = useCallback(() => {
    // 로그인 체크
    if (!loginState.isLoggedIn) {
      enqueueSnackbar("게시글 작성은 로그인 후 이용할 수 있습니다.", {
        variant: "info",
      });
      return;
    }

    navigate("/community/edit");
  }, [loginState.isLoggedIn, navigate]);

  // 게시글 클릭 핸들러 확장
  const handlePostClick = useCallback(
    (postUuid: string, liked: boolean) => {
      // 좋아요 상태 저장 (게시글로 이동하기 전에)
      saveLikedStatus(postUuid, liked);
      navigate(`/community/${postUuid}`);
    },
    [navigate]
  );

  // 게시글 내용에서 첫 번째 이미지 URL 추출 (서버에서 썸네일이 없을 때 폴백용)
  const extractFirstImageUrl = (htmlContent?: string): string | null => {
    if (!htmlContent) return null;

    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = htmlContent.match(imgRegex);

    return match ? match[1] : null;
  };

  // 게시글 썸네일 URL 가져오기 (서버 썸네일 > 내용 이미지)
  const getThumbnailUrl = (post: PostInterface): string | null => {
    // 서버에서 전달받은 썸네일이 있으면 우선 사용
    if (post.thumbnail) {
      return post.thumbnail;
    }
    // 없으면 내용에서 추출
    return extractFirstImageUrl(post.content);
  };

  return (
    <Container maxWidth="xl">
      <Stack minHeight="calc(100vh - 82px)" my={8} gap={12}>
        {/* 실시간 인기 게시글 */}
        <Box
          sx={{
            position: "relative",
            borderRadius: 4,
            p: 3,
            background: "linear-gradient(135deg, rgba(255,107,107,0.08) 0%, rgba(255,142,83,0.08) 50%, rgba(255,193,7,0.08) 100%)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #ff6b6b, #ff8e53, #ffc107)",
            },
          }}
        >
          <Stack gap={3}>
            {/* 헤더 */}
            <Stack direction="row" alignItems="center" gap={1.5}>
              {/* 불꽃 아이콘 with 펄스 애니메이션 */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
                  boxShadow: "0 4px 12px rgba(255,107,107,0.4)",
                  animation: "pulse 2s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": {
                      transform: "scale(1)",
                      boxShadow: "0 4px 12px rgba(255,107,107,0.4)",
                    },
                    "50%": {
                      transform: "scale(1.05)",
                      boxShadow: "0 6px 20px rgba(255,107,107,0.6)",
                    },
                  },
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>🔥</Typography>
              </Box>
              <Stack>
                <Typography variant="h5" fontWeight="bold">
                  실시간 인기 게시글
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  지금 가장 뜨거운 여행 이야기
                </Typography>
              </Stack>
            </Stack>

            {/* 인기 게시글 목록 */}
            {isPopularPostsLoading ? (
              <Stack
                direction="row"
                gap={3}
                sx={{
                  "& .MuiPaper-root:nth-of-type(2)": {
                    display: breakpoint === "xs" ? "none" : "block",
                  },
                  "& .MuiPaper-root:nth-of-type(3)": {
                    display:
                      breakpoint === "xs" || breakpoint === "sm"
                        ? "none"
                        : "block",
                  },
                }}
              >
                {Array.from({ length: 3 }).map((_, index) => (
                  <Paper
                    key={`popular-post-skeleton-${index}`}
                    elevation={0}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "50%",
                        md: "33.33%",
                      },
                      borderRadius: 3,
                      overflow: "hidden",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Stack width="100%" height={320}>
                      <Skeleton
                        variant="rectangular"
                        height="55%"
                        animation="wave"
                      />
                      <Stack gap={1} padding={2} pl={8} flex={1}>
                        <Stack position="relative">
                          <Skeleton variant="text" width="200px" animation="wave" />
                          <Skeleton variant="text" width="100px" animation="wave" />
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
                        <Skeleton variant="text" width="80%" animation="wave" />
                        <Stack direction="row" gap={1.5} justifyContent="flex-end" alignItems="center">
                          <Skeleton variant="text" width="60px" animation="wave" />
                          <Skeleton variant="text" width="60px" animation="wave" />
                          <Skeleton variant="text" width="60px" animation="wave" />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
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
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      bgcolor: "background.paper",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <ButtonBase
                      onClick={() => handlePostClick(post.uuid, post.liked)}
                      sx={{
                        width: "100%",
                        "& .MuiTypography-root": {
                          textAlign: "left",
                        },
                      }}
                    >
                      <Stack width="100%" height={320}>
                        {/* 썸네일 이미지 + 순위 배지 */}
                        <Box
                          height="55%"
                          sx={{
                            position: "relative",
                            bgcolor: getRandomColor(post.title.length),
                            backgroundImage: getThumbnailUrl(post)
                              ? `url(${getThumbnailUrl(post)})`
                              : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {/* 순위 배지 */}
                          {index < 3 && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                color: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                background:
                                  index === 0
                                    ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                                    : index === 1
                                    ? "linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)"
                                    : "linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)",
                              }}
                            >
                              {index + 1}
                            </Box>
                          )}
                        </Box>

                        {/* 게시글 정보 */}
                        <Stack gap={1} padding={2} pl={8} flex={1}>
                          <Stack position="relative">
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                              {post.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {post.authorName}
                            </Typography>
                            <Avatar
                              src={`${SERVER_HOST}${post.authorProfileImage}`}
                              sx={{
                                position: "absolute",
                                width: 42,
                                height: 42,
                                top: "50%",
                                left: -50,
                                transform: "translateY(-50%)",
                                border: "2px solid white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              }}
                            />
                          </Stack>

                          <Typography variant="body2" color="text.secondary" noWrap>
                            {stripHtml(post.content)}
                          </Typography>

                          {/* 통계 - 아이콘 먼저, 숫자 뒤 */}
                          <Stack
                            direction="row"
                            gap={2}
                            justifyContent="flex-end"
                            alignItems="center"
                            mt="auto"
                          >
                            <Stack direction="row" alignItems="center" gap={0.5}>
                              {post.liked ? (
                                <FavoriteRoundedIcon color="error" sx={{ fontSize: 18 }} />
                              ) : (
                                <FavoriteBorderRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {post.likes}
                              </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" gap={0.5}>
                              <IosShareRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary">
                                {post.shares}
                              </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" gap={0.5}>
                              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary">
                                {post.comments}
                              </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" gap={0.5}>
                              <VisibilityOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary">
                                {post.views}
                              </Typography>
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
        </Box>

        {/* 일반 게시판 */}
        <Box
          sx={{
            position: "relative",
            borderRadius: 4,
            p: 3,
            background: "linear-gradient(135deg, rgba(25,118,210,0.06) 0%, rgba(33,150,243,0.06) 50%, rgba(66,165,245,0.06) 100%)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #1976d2, #2196f3, #42a5f5)",
            },
          }}
        >
          <Stack gap={3}>
            {/* 헤더 */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={2}
            >
              <Stack direction="row" alignItems="center" gap={1.5}>
                {/* 아이콘 */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                    boxShadow: "0 4px 12px rgba(25,118,210,0.4)",
                  }}
                >
                  <Typography sx={{ fontSize: "1.5rem" }}>📝</Typography>
                </Box>
                <Stack>
                  <Typography variant="h5" fontWeight="bold">
                    일반 게시판
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    여행자들의 다양한 이야기
                  </Typography>
                </Stack>
              </Stack>

              {/* 검색창 */}
              <Box
                sx={{
                  width: { xs: "100%", sm: "280px", md: "320px" },
                  ml: { xs: 0, sm: "auto" },
                }}
              >
                <OutlinedInput
                  fullWidth
                  value={keyword}
                  onChange={handleKeywordChange}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder="제목, 태그, 내용 검색"
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{
                          color: "text.secondary",
                          fontSize: 22,
                        }}
                      />
                    </InputAdornment>
                  }
                  endAdornment={
                    keyword && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSearch}
                          title="검색"
                          size="small"
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            "&:hover": {
                              bgcolor: "primary.dark",
                            },
                          }}
                        >
                          <SearchRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                  sx={{
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                    "&.Mui-focused": {
                      bgcolor: "background.paper",
                      boxShadow: "0 4px 12px rgba(25,118,210,0.15)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "2px solid",
                        borderColor: "primary.main",
                      },
                    },
                    "& input": {
                      py: 1.25,
                    },
                    "& input::placeholder": {
                      color: "text.secondary",
                      opacity: 0.8,
                    },
                  }}
                />
              </Box>
            </Stack>

            {/* 게시글 목록 */}
            <Stack gap={2}>
              {posts?.map((post) => (
                <Paper
                  elevation={0}
                  key={`post-${post.uuid}`}
                  sx={{
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateX(8px)",
                      boxShadow: "0 8px 24px rgba(25,118,210,0.12)",
                    },
                  }}
                >
                  <ButtonBase
                    onClick={() => handlePostClick(post.uuid, post.liked)}
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
                          sx={{
                            mb: 0.5,
                          }}
                        >
                          {post.title}
                        </Typography>

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
                                  bgcolor: "rgba(25,118,210,0.1)",
                                  color: "primary.main",
                                  border: "1px solid",
                                  borderColor: "rgba(25,118,210,0.2)",
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
                            {/* 작성일 */}
                            {post.createdAt && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mr: "auto" }}
                              >
                                {new Date(post.createdAt).toLocaleDateString(
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
                              {post.liked ? (
                                <FavoriteRoundedIcon
                                  color="error"
                                  sx={{ fontSize: 20 }}
                                />
                              ) : (
                                <FavoriteBorderRoundedIcon
                                  sx={{ fontSize: 20, color: "text.secondary" }}
                                />
                              )}
                              <Typography variant="body2" color="text.secondary">
                                {post.likes}
                              </Typography>
                            </Stack>

                            {/* 공유 수 */}
                            <Stack direction="row" alignItems="center" gap={0.5} ml={1}>
                              <IosShareRoundedIcon
                                sx={{
                                  fontSize: 20,
                                  color: "text.secondary",
                                }}
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

                            {/* 조회수 */}
                            <Stack direction="row" alignItems="center" gap={0.5} ml={1}>
                              <VisibilityOutlinedIcon
                                sx={{ fontSize: 20, color: "text.secondary" }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {post.views}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      </Stack>
                    </Stack>
                  </ButtonBase>
                </Paper>
              ))}

              {/* 게시글이 없는 경우 */}
              {!isPostLoading && posts.length === 0 && isInitialLoaded && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    py: 8,
                    px: 4,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: "rgba(25,118,210,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                    }}
                  >
                    <Typography sx={{ fontSize: "2.5rem" }}>📭</Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {searchKeyword ? "검색 결과가 없습니다" : "아직 게시글이 없습니다"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {searchKeyword 
                      ? `"${searchKeyword}"에 대한 검색 결과를 찾을 수 없어요.`
                      : "첫 번째 여행 이야기를 공유해보세요!"}
                  </Typography>
                  {!searchKeyword && (
                    <Button
                      variant="contained"
                      startIcon={<CreateRoundedIcon />}
                      onClick={handleCreatePostButtonClick}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.25,
                        background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                        boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                          boxShadow: "0 6px 16px rgba(25,118,210,0.4)",
                        },
                      }}
                    >
                      글쓰기
                    </Button>
                  )}
                  {searchKeyword && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setKeyword("");
                        setSearchKeyword("");
                        setPosts([]);
                        setHasNextPage(true);
                        setLoadedPages(1);
                        setIsInitialLoaded(false);
                      }}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.25,
                        borderColor: "#1976d2",
                        color: "#1976d2",
                        "&:hover": {
                          borderColor: "#1565c0",
                          bgcolor: "rgba(25,118,210,0.08)",
                        },
                      }}
                    >
                      전체 게시글 보기
                    </Button>
                  )}
                </Paper>
              )}

          {/* 게시글 로딩 중 */}
              {isPostLoading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <Paper
                    elevation={0}
                    key={`post-skeleton-${index}`}
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
                            <Skeleton variant="text" width="40px" animation="wave" />
                          </Stack>
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}

              {/* 더보기 버튼 */}
              {hasNextPage && !isPostLoading && posts.length > 0 && (
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
                    background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                    boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                      boxShadow: "0 6px 16px rgba(25,118,210,0.4)",
                    },
                  }}
                >
                  더보기
                </Button>
              )}

              {/* 로딩 중 표시 */}
              {isPostLoading && posts.length > 0 && (
                <Stack alignItems="center" py={2}>
                  <CircularProgress size={32} sx={{ color: "#1976d2" }} />
                </Stack>
              )}
            </Stack>
          </Stack>
        </Box>
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
