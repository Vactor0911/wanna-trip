import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import parse from "html-react-parser";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CommentInput from "../components/CommentInput";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ShareIcon from "@mui/icons-material/Share";
import Template from "./Template";
import { CircularProgress } from "@mui/material"; // 로딩 표시용
import axiosInstance, {
  getCsrfToken,
  SERVER_HOST,
} from "../utils/axiosInstance";
import { wannaTripLoginStateAtom } from "../state";
import { useAtomValue } from "jotai";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import React from "react";

// 댓글 인터페이스
interface Comment {
  id: number;
  uuid: string;
  authorUuid: string;
  authorName: string;
  authorProfile?: string;
  content: string;
  createdAt: string;
  likes: number;
  parentUuid?: string | null;
  liked: boolean;
  isAuthor?: boolean;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  action?: React.ReactNode;
}

const CommunityPost = () => {
  const { postUuid } = useParams(); // 게시글 UUID
  const navigate = useNavigate(); // 네비게이션 훅

  const [isLoading, setIsLoading] = useState(false); // 게시글 로딩 여부
  const [error, setError] = useState(""); // 에러 메시지
  const [title, setTitle] = useState(""); // 게시글 제목
  const [templateUuid, setTemplateUuid] = useState(""); // 템플릿 UUID
  const [, setAuthorUuid] = useState(""); // 작성자 UUID
  const [authorName, setAuthorName] = useState(""); // 작성자 이름
  const [authorProfileImage, setAuthorProfileImage] = useState(""); // 작성자 프로필 이미지 URL
  const [createdAt, setCreatedAt] = useState(""); // 작성일
  const [content, setContent] = useState(""); // 게시글 내용 (HTML 형식)
  const [tags, setTags] = useState<string[]>([]); // 게시글 태그 목록
  const [likes, setLikes] = useState(0); // 좋아요 수
  const [isLiked, setIsLiked] = useState(false); // 좋아요 상태
  const [shares, setShares] = useState(0); // 공유수

  const [comments, setComments] = useState<Comment[]>([]); // 댓글 목록
  const [commentText, setCommentText] = useState(""); // 댓글 입력 텍스트
  const [isCommentLoading, setIsCommentLoading] = useState(false); // 댓글 로딩 상태
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false); // 댓글 제출 중 상태

  const [replyParentId, setReplyParentId] = useState<string | null>(null); // 댓글 부모 ID
  const moreButtonRef = useRef<HTMLButtonElement>(null); // 더보기 버튼 참조
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false); // 더보기 메뉴 열림 상태
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false); // 템플릿 드로어 열림 상태

  // 로그인 상태 확인 추가
  const loginState = useAtomValue(wannaTripLoginStateAtom);
  // 현재 사용자가 작성자인지 여부를 판단하는 상태 추가
  const [isAuthor, setIsAuthor] = useState(false);
  const [currentUserUuid, setCurrentUserUuid] = useState(""); // 현재 사용자 UUID

  // 게시글 삭제 확인 다이얼로그 상태 추가
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // 게시글 삭제 확인 다이얼로그
  const [isDeleting, setIsDeleting] = useState(false); // 게시글 삭제 중 상태

  // 댓글 삭제 관련 상태 추가
  const [isCommentDeleteDialogOpen, setIsCommentDeleteDialogOpen] =
    useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  // 스낵바 상태 추가
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  // 현재 사용자 정보 가져오기
  const fetchCurrentUserInfo = useCallback(async () => {
    if (!loginState.isLoggedIn) {
      return;
    }

    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 사용자 정보 조회 API 호출
      const response = await axiosInstance.get("/auth/me", {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        // 현재 사용자의 UUID 저장
        setCurrentUserUuid(response.data.data.userUuid);
      }
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err);
    }
  }, [loginState.isLoggedIn]);

  // 컴포넌트 마운트 시 현재 사용자 정보 가져오기
  useEffect(() => {
    fetchCurrentUserInfo();
  }, [fetchCurrentUserInfo]);

  // 게시글 데이터 가져오기
  const fetchPostData = useCallback(async () => {
    if (!postUuid) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await axiosInstance.get(`/post/${postUuid}`);

      if (response.data.success) {
        const postData = response.data.post;
        setTitle(postData.title);

        // 작성자 UUID 설정
        const authorId = postData.authorUuid;
        setAuthorUuid(authorId);

        // 현재 사용자와 작성자 비교
        setIsAuthor(currentUserUuid !== "" && currentUserUuid === authorId);

        setAuthorName(postData.authorName);
        setTemplateUuid(postData.templateUuid);

        // 프로필 이미지 URL 설정 방식 수정
        if (postData.authorProfile) {
          setAuthorProfileImage(`${SERVER_HOST}${postData.authorProfile}`);
        } else {
          setAuthorProfileImage("");
        }

        // 날짜 형식 변환 (YYYY-MM-DD)
        const date = new Date(postData.createdAt);
        setCreatedAt(
          date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        );

        setContent(postData.content);
        setTags(postData.tags || []); // 태그 정보 설정
        setShares(postData.shares || 0);

        // 좋아요 정보 설정
        setLikes(postData.likes || 0);
        setIsLiked(postData.liked || false);

        // 뷰 카운트는 백엔드에서 자동으로 증가
      } else {
        setError("게시글을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("게시글 로딩 실패:", err);
      setError("게시글을 불러오는데 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserUuid, postUuid]);

  // 컴포넌트 마운트 시 게시글 데이터 로드
  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  // 삭제 확인 및 처리
  const handleDeletePost = useCallback(async () => {
    if (!postUuid) return;

    try {
      setIsDeleting(true);

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 게시글 삭제 API 호출
      const response = await axiosInstance.delete(`/post/${postUuid}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        // 삭제 성공 시 목록 페이지로 이동
        navigate("/community");
      } else {
        // 실패 시 에러 메시지 표시
        setError("게시글 삭제에 실패했습니다.");
        setIsDeleteDialogOpen(false);
      }
    } catch (err) {
      console.error("게시글 삭제 중 오류 발생:", err);
      setError("게시글 삭제 중 오류가 발생했습니다.");
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }, [navigate, postUuid]);

  // 댓글 로드 함수
  const loadComments = useCallback(async () => {
    if (!postUuid) return;

    try {
      setIsCommentLoading(true);
      const response = await axiosInstance.get(`/post/comments/${postUuid}`);

      if (response.data.success) {
        // 댓글 데이터 가공
        const formattedComments = response.data.comments.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (comment: any) => ({
            id: comment.id,
            uuid: comment.uuid,
            authorUuid: comment.authorUuid,
            authorName: comment.authorName,
            authorProfile: comment.authorProfile
              ? `${SERVER_HOST}${comment.authorProfile}`
              : undefined,
            content: comment.content,
            tags: comment.tags || [], // 태그 정보 추가
            createdAt: comment.createdAt,
            likes: comment.likes,
            parentUuid: comment.parentUuid,
            liked: comment.liked,
            isAuthor: currentUserUuid === comment.authorUuid, // 작성자 여부 확인
          })
        );

        setComments(formattedComments);
      }
    } catch (err) {
      console.error("댓글 로드 실패:", err);
    } finally {
      setIsCommentLoading(false);
    }
  }, [postUuid, currentUserUuid]);

  // 컴포넌트 마운트 시 댓글 로드
  useEffect(() => {
    if (postUuid) {
      loadComments();
    }
  }, [loadComments, postUuid]);

  // 댓글 작성 함수
  const handleCommentSubmit = useCallback(
    async (content: string, parentUuid?: string) => {
      if (!postUuid || !content.trim() || isCommentSubmitting) return;

      try {
        setIsCommentSubmitting(true);

        // CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();

        const response = await axiosInstance.post(
          `/post/comments/${postUuid}`,
          {
            content,
            parentCommentUuid: parentUuid || null,
          },
          {
            headers: { "X-CSRF-Token": csrfToken },
          }
        );

        if (response.data.success) {
          // 댓글 작성 성공
          const newComment = response.data.comment;

          // 프로필 이미지 경로 처리
          if (newComment.authorProfile) {
            newComment.authorProfile = `${SERVER_HOST}${newComment.authorProfile}`;
          }

          // 작성자 여부 설정
          newComment.isAuthor = true;
          newComment.liked = false;

          // 댓글 목록 업데이트
          setComments((prev) => [...prev, newComment]);

          // 입력창 초기화
          setCommentText("");

          // 답글 입력 모드 종료
          setReplyParentId(null);
        }
      } catch (err) {
        console.error("댓글 작성 실패:", err);
      } finally {
        setIsCommentSubmitting(false);
      }
    },
    [postUuid, isCommentSubmitting]
  );

  // 댓글 삭제 다이얼로그 열기
  const handleOpenCommentDeleteDialog = useCallback((commentUuid: string) => {
    setCommentToDelete(commentUuid);
    setIsCommentDeleteDialogOpen(true);
  }, []);

  // 댓글 삭제 다이얼로그 닫기
  const handleCloseCommentDeleteDialog = useCallback(() => {
    setIsCommentDeleteDialogOpen(false);
    setCommentToDelete(null);
  }, []);

  // 댓글 삭제 함수
  const handleConfirmCommentDelete = useCallback(async () => {
    if (!commentToDelete) return;

    try {
      setIsDeletingComment(true);

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      const response = await axiosInstance.delete(
        `/post/comments/${commentToDelete}`,
        {
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      if (response.data.success) {
        // 삭제된 댓글과 그에 달린 대댓글도 제거
        setComments((prev) =>
          prev.filter(
            (comment) =>
              comment.uuid !== commentToDelete &&
              comment.parentUuid !== commentToDelete
          )
        );

        // 성공 메시지를 표시할 수도 있습니다 (선택 사항)
      }
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
    } finally {
      setIsDeletingComment(false);
      handleCloseCommentDeleteDialog();
    }
  }, [commentToDelete, handleCloseCommentDeleteDialog]);

  // 상대 시간 포맷팅 함수
  const formatRelativeTime = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return dateString;
    }
  }, []);

  // 댓글 정렬: 먼저 부모 댓글, 그 다음에 대댓글이 나오도록
  const getSortedComments = useCallback(() => {
    // 부모 댓글과 대댓글 분리
    const parentComments = comments.filter((comment) => !comment.parentUuid);
    const childComments = comments.filter((comment) => !!comment.parentUuid);

    // 결과 배열
    const result: Comment[] = [];

    // 부모 댓글을 먼저 추가하고, 그 아래 해당 대댓글들을 추가
    for (const parent of parentComments) {
      result.push(parent);

      // 이 부모에 속한 대댓글들 찾기
      const children = childComments.filter(
        (child) => child.parentUuid === parent.uuid
      );
      result.push(...children);
    }

    return result;
  }, [comments]);

  // 댓글 삭제 권한 확인 함수 추가
  const canDeleteComment = useCallback(
    (comment: Comment) => {
      // 댓글 작성자이거나 게시글 작성자인 경우 삭제 가능
      return comment.isAuthor || isAuthor;
    },
    [isAuthor]
  );

  // 답글 작성 가능 여부 확인
  const canReply = useCallback((comment: Comment) => {
    // 대댓글에는 더 이상 답글을 달 수 없음
    return !comment.parentUuid;
  }, []);

  // 게시글 좋아요 버튼 클릭
  const handleLikeButtonClick = useCallback(async () => {
    // 로그인 체크
    if (!loginState.isLoggedIn) {
      setSnackbar({
        open: true,
        message: "좋아요 기능은 로그인 후 이용할 수 있습니다.",
        severity: "info",
        action: (
          <Button
            color="primary"
            size="small"
            onClick={() => navigate("/login")}
          >
            로그인하기
          </Button>
        ),
      });
      return;
    }

    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 좋아요 API 호출
      const response = await axiosInstance.post(
        `/post/likes/post/${postUuid}`,
        {},
        {
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      // 좋아요 API 호출 시 응답으로 현재 좋아요 수를 받아서 바로 적용
      if (response.data.success) {
        // 서버 응답에 따라 좋아요 상태 업데이트
        setIsLiked(response.data.liked);

        // 서버에서 받은 최신 좋아요 수로 업데이트
        if (response.data.likesCount !== undefined) {
          setLikes(response.data.likesCount);
        } else {
          // 서버에서 좋아요 수를 제공하지 않는 경우에만 자체 계산
          setLikes((prev) => (response.data.liked ? prev + 1 : prev - 1));
        }
      }
    } catch (err) {
      console.error("좋아요 처리 실패:", err);
    }
  }, [loginState.isLoggedIn, navigate, postUuid]);

  // 댓글 좋아요 함수
  const handleCommentLike = useCallback(
    async (commentUuid: string) => {
      // 로그인 체크
      if (!loginState.isLoggedIn) {
        setSnackbar({
          open: true,
          message: "좋아요 기능은 로그인 후 이용할 수 있습니다.",
          severity: "info",
          action: (
            <Button
              color="primary"
              size="small"
              onClick={() => navigate("/login")}
            >
              로그인하기
            </Button>
          ),
        });
        return;
      }

      try {
        // CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();

        // 좋아요 API 호출
        const response = await axiosInstance.post(
          `/post/likes/comment/${commentUuid}`,
          {},
          {
            headers: { "X-CSRF-Token": csrfToken },
          }
        );

        if (response.data.success) {
          // 댓글 목록 업데이트
          setComments((prev) =>
            prev.map((comment) =>
              comment.uuid === commentUuid
                ? {
                    ...comment,
                    liked: response.data.liked,
                    likes: response.data.liked
                      ? comment.likes + 1
                      : comment.likes - 1,
                  }
                : comment
            )
          );
        }
      } catch (err) {
        console.error("댓글 좋아요 실패:", err);
      }
    },
    [loginState.isLoggedIn, navigate]
  );

  // 답글 쓰기 버튼 클릭
  const handleReplyButtonClick = useCallback((parentId: string) => {
    setReplyParentId(parentId); // 예시로 첫 번째 댓글에 답글을 작성
  }, []);

  // 답글 취소 버튼 클릭
  const handleReplyCancelButtonClick = useCallback(() => {
    setReplyParentId(null); // 답글 취소
  }, []);

  // 더보기 버튼 클릭
  const handleMoreButtonClick = useCallback(() => {
    setIsMoreMenuOpen((prev) => !prev);
  }, []);

  // 더보기 메뉴 닫기
  const handleMoreMenuClose = useCallback(() => {
    setIsMoreMenuOpen(false);
  }, []);

  // 템플릿 드로어 버튼 클릭
  const handleTemplateDrawerToggle = useCallback(() => {
    setIsTemplateDrawerOpen((prev) => !prev);
  }, []);

  // 목록 버튼 클릭
  const handleReturnButtonClick = useCallback(() => {
    navigate("/community");
  }, [navigate]);

  // 게시글 삭제 다이얼로그 열기
  const handleOpenDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(true);
    setIsMoreMenuOpen(false); // 더보기 메뉴도 닫기
  }, []);

  // 게시글 삭제 다이얼로그 닫기
  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  // 스낵바 닫기
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // 수정 버튼 클릭
  const handleEditButtonClick = useCallback(() => {
    navigate(`/community/${postUuid}/edit`);
  }, [navigate, postUuid]);

  // 버튼 컨테이너 요소
  const ButtonContainer = useMemo(() => {
    return (
      <Stack direction="row" justifyContent="flex-end" gap={2} flexGrow={1}>
        {/* 수정 버튼 - 작성자일 때만 표시 */}
        {isAuthor && (
          <Button
            variant="outlined"
            color="black"
            onClick={handleEditButtonClick}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              수정
            </Typography>
          </Button>
        )}

        {/* 삭제 버튼 - 작성자일 때만 표시 */}
        {isAuthor && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleOpenDeleteDialog}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              삭제
            </Typography>
          </Button>
        )}

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
    );
  }, [
    handleEditButtonClick,
    handleOpenDeleteDialog,
    handleReturnButtonClick,
    isAuthor,
  ]);

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

  return (
    <Container maxWidth="lg">
      <Stack
        minHeight="calc(100vh - 82px)"
        gap={4}
        py={5}
        pb={15}
        pl={templateUuid ? 5 : 0}
      >
        {/* 게시글 제목 */}
        <Typography variant="h4">{title}</Typography>

        {/* 작성 정보 */}
        <Stack direction="row" alignItems="center" gap={2}>
          {/* 작성자 프로필 이미지 */}
          <Avatar
            src={authorProfileImage || undefined}
            sx={{
              width: 48,
              height: 48,
            }}
          />

          <Stack>
            {/* 작성자 이름 */}
            <Typography variant="subtitle1" fontWeight="bold">
              {authorName}
            </Typography>

            {/* 작성일 */}
            <Typography variant="subtitle2">{createdAt}</Typography>
          </Stack>

          {/* 더보기 메뉴 */}
          <Box ml="auto">
            {/* 더보기 메뉴 버튼 */}
            <IconButton onClick={handleMoreButtonClick} ref={moreButtonRef}>
              <MoreVertRoundedIcon />
            </IconButton>

            {/* 더보기 메뉴 */}
            <Menu
              anchorEl={moreButtonRef.current}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={isMoreMenuOpen}
              onClose={handleMoreMenuClose}
            >
              {/* 수정하기 버튼 - 작성자일 때만 표시 */}
              {isAuthor && (
                <MenuItem
                  onClick={handleMoreMenuClose}
                  sx={{
                    gap: 4,
                  }}
                >
                  <Typography variant="subtitle1">수정하기</Typography>
                  <EditRoundedIcon fontSize="small" />
                </MenuItem>
              )}

              {/* 공유하기 버튼 - 항상 표시 */}
              <MenuItem
                onClick={handleMoreMenuClose}
                sx={{
                  gap: 4,
                }}
              >
                <Typography variant="subtitle1">공유하기</Typography>
                <ShareRoundedIcon fontSize="small" />
              </MenuItem>

              {/* 삭제하기 버튼 - 작성자일 때만 표시 */}
              {isAuthor && (
                <MenuItem
                  onClick={handleOpenDeleteDialog}
                  sx={{
                    gap: 4,
                  }}
                >
                  <Typography variant="subtitle1" color="error">
                    삭제하기
                  </Typography>
                  <DeleteOutlineRoundedIcon fontSize="small" color="error" />
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Stack>

        {/* 구분선 */}
        <Divider />

        {/* 게시글 내용 */}
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
          }}
        >
          {content && parse(content)}
        </Stack>

        {/* 태그 컨테이너 */}
        <Stack direction="row" alignItems="center" gap={1}>
          {tags.map((tag, index) => (
            <Chip key={`tag-${index}`} label={`# ${tag}`} />
          ))}
        </Stack>

        {/* 버튼 컨테이너 */}
        <Stack
          direction="row"
          gap={3}
          justifyContent="flex-end"
          alignItems="center"
          flexWrap="wrap"
        >
          {/* 왼쪽 버튼 컨테이너 */}
          <Stack direction="row" gap={2}>
            {/* 좋아요 */}
            <Stack direction="row" alignItems="center">
              {/* 좋아요 버튼 */}
              <IconButton size="small" onClick={handleLikeButtonClick}>
                {isLiked ? (
                  <FavoriteRoundedIcon color="error" />
                ) : (
                  <FavoriteBorderRoundedIcon />
                )}
              </IconButton>

              {/* 좋아요 수 */}
              <Typography variant="subtitle1">{likes}</Typography>
            </Stack>

            {/* 공유 */}
            <Stack direction="row" alignItems="center">
              {/* 공유 버튼 */}
              <IconButton size="small">
                <ShareIcon />
              </IconButton>

              {/* 공유 수 */}
              <Typography variant="subtitle1">{shares}</Typography>
            </Stack>

            {/* 댓글 */}
            <Stack direction="row" alignItems="center">
              {/* 댓글 버튼 */}
              <IconButton size="small">
                <ChatBubbleOutlineRoundedIcon />
              </IconButton>

              {/* 댓글 수 */}
              <Typography variant="subtitle1">{comments.length}</Typography>
            </Stack>
          </Stack>

          {/* 오른쪽 버튼 컨테이너 */}
          {ButtonContainer}
        </Stack>

        {/* 댓글 섹션 */}
        <Stack gap={3}>
          <Typography variant="h6">댓글 {comments.length}개</Typography>

          {/* 댓글 로딩 중 표시 */}
          {isCommentLoading && (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={30} />
            </Box>
          )}

          {/* 댓글 목록 */}
          {!isCommentLoading &&
            getSortedComments().map((comment, index, array) => (
              <React.Fragment key={comment.uuid}>
                {/* 댓글 컨테이너 */}
                <Stack ml={comment.parentUuid ? "50px" : "0"} gap={3}>
                  {/* 댓글 내용 */}
                  <Stack direction="row" gap={1}>
                    {/* 댓글 작성자 프로필 이미지 */}
                    <Avatar src={comment.authorProfile} />

                    <Stack width="100%">
                      {/* 댓글 작성자 이름 */}
                      <Typography variant="subtitle1" fontWeight="bold">
                        {comment.authorName}
                      </Typography>

                      {/* 댓글 내용 */}
                      <Typography variant="subtitle1">
                        {comment.content}
                      </Typography>

                      <Stack direction="row" alignItems="center" gap={1}>
                        {/* 댓글 작성일 */}
                        <Typography variant="subtitle2" color="text.secondary">
                          {formatRelativeTime(comment.createdAt)}
                        </Typography>

                        {/* 답글 쓰기 버튼 (대댓글이 아닌 경우에만 표시) */}
                        {loginState.isLoggedIn && canReply(comment) && (
                          <Button
                            onClick={() => handleReplyButtonClick(comment.uuid)}
                            sx={{
                              padding: 0,
                            }}
                          >
                            <Typography variant="subtitle2" color="primary">
                              답글 쓰기
                            </Typography>
                          </Button>
                        )}

                        {/* 좋아요 버튼 */}
                        <IconButton
                          size="small"
                          sx={{
                            padding: 0.5,
                          }}
                          onClick={() => handleCommentLike(comment.uuid)}
                        >
                          {comment.liked ? (
                            <FavoriteRoundedIcon
                              color="error"
                              sx={{ fontSize: 18 }}
                            />
                          ) : (
                            <FavoriteBorderRoundedIcon sx={{ fontSize: 18 }} />
                          )}

                          <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
                            {comment.likes}
                          </Typography>
                        </IconButton>

                        {/* 삭제 버튼 (본인 댓글 또는 게시글 작성자만) */}
                        {canDeleteComment(comment) && (
                          <Button
                            color="error"
                            onClick={() =>
                              handleOpenCommentDeleteDialog(comment.uuid)
                            }
                            sx={{
                              padding: 0,
                              paddingX: 0.5,
                              minWidth: 0,
                            }}
                          >
                            <Typography variant="subtitle2" color="error">
                              삭제
                            </Typography>
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>

                  {/* 답글 입력란 */}
                  {replyParentId === comment.uuid && (
                    <Stack gap={2}>
                      <Box ml={comment.parentUuid ? "0" : "50px"}>
                        <CommentInput
                          key={`reply-input-${comment.uuid}`}
                          onCommentSubmit={(content) =>
                            handleCommentSubmit(content, comment.uuid)
                          }
                          onCommentCancel={handleReplyCancelButtonClick}
                          disabled={isCommentSubmitting}
                        />
                      </Box>
                    </Stack>
                  )}
                </Stack>

                {/* 구분선 */}
                {index < array.length - 1 && (
                  <Divider
                    sx={{
                      ml:
                        !!comment.parentUuid && !!array[index + 1].parentUuid
                          ? "50px"
                          : "0",
                    }}
                  />
                )}
              </React.Fragment>
            ))}

          {/* 댓글이 없는 경우 메시지 */}
          {!isCommentLoading && comments.length === 0 && (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              py={4}
            >
              첫 번째 댓글을 작성해보세요!
            </Typography>
          )}

          <Divider />

          {/* 댓글 입력란 */}
          {loginState.isLoggedIn ? (
            <CommentInput
              onCommentSubmit={handleCommentSubmit} // 수정
              disabled={isCommentSubmitting}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          ) : (
            <Box py={3} textAlign="center">
              <Typography variant="body1" color="text.secondary" mb={2}>
                댓글을 작성하려면 로그인이 필요합니다.
              </Typography>
              <Button variant="contained" onClick={() => navigate("/login")}>
                로그인하기
              </Button>
            </Box>
          )}
        </Stack>

        {/* 스크롤 상단 이동 버튼 */}
        <ScrollToTopButton />

        {/* 템플릿 드로어 */}
        {templateUuid && (
          <Paper
            elevation={5}
            sx={{
              position: "fixed",
              top: "15vh",
              left: 0,
              borderRadius: 0,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            }}
          >
            <Collapse
              in={isTemplateDrawerOpen}
              orientation="horizontal"
              collapsedSize={30}
            >
              <Box
                height="70vh"
                width={{
                  xs: "90vw",
                  sm: "50vw",
                }}
                sx={{
                  overflowX: "auto",
                }}
              >
                {/* 템플릿 화면 - 로그인 상태에 따른 조건부 렌더링 */}
                {!loginState.isLoggedIn ? (
                  // 로그인되지 않은 경우 메시지 표시
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      py: 4,
                      px: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(48, 48, 48, 0.03)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" mb={3}>
                      템플릿을 확인하려면 로그인이 필요합니다.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate("/login")}
                    >
                      로그인하러 가기
                    </Button>
                  </Box>
                ) : (
                  // 로그인된 경우 템플릿 표시
                  <Template
                    uuid={templateUuid}
                    height="70vh"
                    paddgingX="24px"
                  />
                )}
              </Box>
            </Collapse>

            {/* 드로어 확장/축소 버튼 */}
            <Paper
              elevation={2}
              sx={{
                position: "absolute",
                top: "50%",
                right: 0,
                borderRadius: "50%",
                transform: "translate(50%, -50%)",
              }}
            >
              <IconButton size="small" onClick={handleTemplateDrawerToggle}>
                <ChevronLeftRoundedIcon
                  color="primary"
                  fontSize="large"
                  sx={{
                    transform: `rotate(${isTemplateDrawerOpen ? 0 : -180}deg)`,
                    transition: "transform 0.2s ease-in-out",
                  }}
                />
              </IconButton>
            </Paper>
          </Paper>
        )}

        {/* 버튼 컨테이너 */}
        {ButtonContainer}
      </Stack>

      {/* 게시글 삭제 확인 다이얼로그 */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>게시글 삭제</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            이 게시글을 정말로 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            삭제한 게시글은 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            color="inherit"
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            onClick={handleDeletePost}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 댓글 삭제 확인 다이얼로그 */}
      <Dialog
        open={isCommentDeleteDialogOpen}
        onClose={handleCloseCommentDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>댓글 삭제</DialogTitle>
        <DialogContent>
          <Typography variant="body1">이 댓글을 삭제하시겠습니까?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            삭제한 댓글은 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseCommentDeleteDialog}
            color="inherit"
            disabled={isDeletingComment}
          >
            취소
          </Button>
          <Button
            onClick={handleConfirmCommentDelete}
            color="error"
            variant="contained"
            disabled={isDeletingComment}
            startIcon={
              isDeletingComment ? <CircularProgress size={16} /> : null
            }
          >
            {isDeletingComment ? "삭제 중..." : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>

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
  );
};

export default CommunityPost;
