import {
  Avatar,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import parse from "html-react-parser";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CommentInput from "../components/CommentInput";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { CircularProgress } from "@mui/material"; // 로딩 표시용
import axiosInstance, {
  getCsrfToken,
  SERVER_HOST,
} from "../utils/axiosInstance";
import { wannaTripLoginStateAtom } from "../state";
import { useAtomValue } from "jotai";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useSnackbar } from "notistack";
import TemplateViewer from "../components/TemplateViewer";

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

const CommunityPost = () => {
  const { postUuid } = useParams(); // 게시글 UUID
  const navigate = useNavigate(); // 네비게이션 훅
  const { enqueueSnackbar } = useSnackbar();

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
  const [views, setViews] = useState(0); // 조회수

  const [comments, setComments] = useState<Comment[]>([]); // 댓글 목록
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

  const [selectedComment, setSelectedComment] = useState<{
    comment: Comment;
    element: HTMLElement;
  } | null>(null); // 메뉴로 선택된 댓글 정보
  const [editingCommentUuid, setEditingCommentUuid] = useState<string | null>(
    null
  ); // 현재 편집 중인 댓글 UUID

  // 로그인 페이지로 이동
  const handleNavigateToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  // 공유하기 (URL 복사)
  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      enqueueSnackbar("게시글 링크가 복사되었습니다.", { variant: "success" });
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
      enqueueSnackbar("링크 복사에 실패했습니다.", { variant: "error" });
    }
  }, [enqueueSnackbar]);

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
        setViews(postData.views || 0); // 조회수 설정

        // 좋아요 정보 설정
        setLikes(postData.likes || 0);
        setIsLiked(postData.liked || false);
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
      // 입력값 검증
      if (!postUuid || !content.trim() || isCommentSubmitting) {
        return;
      }

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

  // 댓글 수정 함수
  const handleCommentEdit = useCallback(
    async (content: string, commentUuid?: string) => {
      // 댓글을 전송하고 있는 경우 종료
      if (isCommentSubmitting) {
        return;
      }

      // 입력값 검증
      if (!commentUuid || !content.trim()) {
        return;
      }

      try {
        setIsCommentSubmitting(true);

        // CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();

        const response = await axiosInstance.put(
          `/post/comments/${commentUuid}`,
          {
            content,
          },
          {
            headers: { "X-CSRF-Token": csrfToken },
          }
        );

        // 댓글 수정 성공
        if (response.data.success) {
          const newComment = response.data.comment;

          // 댓글 목록 업데이트
          setComments((prev) =>
            prev.map((comment) =>
              comment.uuid === commentUuid
                ? {
                    ...comment,
                    content: newComment.content,
                    createdAt: newComment.createdAt,
                  }
                : comment
            )
          );

          // 댓글 수정 입력란 닫기
          setEditingCommentUuid(null);
        }
      } catch (err) {
        console.error("댓글 수정 실패:", err);
        enqueueSnackbar("댓글 수정에 실패했습니다.", { variant: "error" });
      } finally {
        setIsCommentSubmitting(false);
      }
    },
    [enqueueSnackbar, isCommentSubmitting]
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

  // 게시글 좋아요 버튼 클릭
  const handleLikeButtonClick = useCallback(async () => {
    // 로그인 체크
    if (!loginState.isLoggedIn) {
      enqueueSnackbar("좋아요 기능은 로그인 후 이용할 수 있습니다.", {
        variant: "info",
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
  }, [enqueueSnackbar, loginState.isLoggedIn, postUuid]);

  // 댓글 좋아요 함수
  const handleCommentLike = useCallback(
    async (commentUuid: string) => {
      // 로그인 체크
      if (!loginState.isLoggedIn) {
        enqueueSnackbar("좋아요 기능은 로그인 후 이용할 수 있습니다.", {
          variant: "info",
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
    [enqueueSnackbar, loginState.isLoggedIn]
  );

  // 답글 쓰기 버튼 클릭
  const handleReplyButtonClick = useCallback(
    (parentId: string) => {
      // 로그인 체크
      if (!loginState.isLoggedIn) {
        enqueueSnackbar("답글 작성은 로그인 후 이용할 수 있습니다.", {
          variant: "info",
        });
        return;
      }

      // 로그인된 경우에만 실행
      setReplyParentId(parentId);
    },
    [loginState.isLoggedIn, enqueueSnackbar]
  );

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

  // 수정 버튼 클릭
  const handleEditButtonClick = useCallback(() => {
    navigate(`/community/${postUuid}/edit`);
  }, [navigate, postUuid]);

  // 댓글 더보기 버튼 클릭
  const handleCommentMoreButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, comment: Comment) => {
      // 선택한 댓글 정보 추출
      const newSelectedComment = {
        comment: comment,
        element: event.currentTarget,
      };

      // 댓글 더보기 메뉴 토글
      if (
        selectedComment &&
        selectedComment.comment.uuid === newSelectedComment.comment.uuid
      ) {
        setSelectedComment(null);
      } else {
        setSelectedComment(newSelectedComment);
      }
    },
    [selectedComment]
  );

  // 댓글 수정 버튼 클릭
  const handleCommentEditButtonClick = useCallback((commentUuid: string) => {
    setEditingCommentUuid(commentUuid);
  }, []);

  // 댓글 수정 입력란 닫기
  const handleEditCommentClose = useCallback(() => {
    setEditingCommentUuid(null);
  }, []);

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
    <>
      <Container maxWidth="lg">
        <Stack
          minHeight="calc(100vh - 82px)"
          gap={4}
          py={5}
          pb={15}
          pl={templateUuid ? 5 : 0}
        >
          {/* 게시글 헤더 */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 3,
              background: (theme) => theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(33,150,243,0.05) 100%)"
                : "linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(33,150,243,0.03) 100%)",
              border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(144,202,249,0.2)" : "rgba(25,118,210,0.12)"}`,
            }}
          >
            {/* 게시글 제목 */}
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{ 
                mb: 3,
                background: (theme) => theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)"
                  : "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {title}
            </Typography>

            {/* 작성 정보 */}
            <Stack 
              direction="row" 
              alignItems="center" 
              gap={2}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "background.paper",
                border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(144,202,249,0.15)" : "rgba(25,118,210,0.08)"}`,
              }}
            >
              {/* 작성자 프로필 이미지 */}
              <Avatar
                src={authorProfileImage || undefined}
                sx={{
                  width: 52,
                  height: 52,
                  border: "3px solid",
                  borderColor: "primary.main",
                  boxShadow: "0 4px 12px rgba(25,118,210,0.2)",
                }}
              />

              <Stack flex={1}>
                {/* 작성자 이름 */}
                <Typography variant="subtitle1" fontWeight="bold">
                  {authorName}
                </Typography>

                {/* 작성일 */}
                <Typography variant="body2" color="text.secondary">
                  {createdAt}
                </Typography>
              </Stack>

              {/* 더보기 메뉴 */}
              <IconButton 
                onClick={handleMoreButtonClick} 
                ref={moreButtonRef}
                sx={{
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(144,202,249,0.1)" : "rgba(25,118,210,0.08)",
                  "&:hover": {
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(144,202,249,0.2)" : "rgba(25,118,210,0.15)",
                  },
                }}
              >
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
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: 2,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      minWidth: 160,
                    },
                  },
                }}
              >
                {/* 수정하기 버튼 - 작성자일 때만 표시 */}
                {isAuthor && (
                  <MenuItem
                    onClick={() => {
                      handleMoreMenuClose();
                      handleEditButtonClick();
                    }}
                    sx={{
                      gap: 4,
                      py: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2">수정하기</Typography>
                    <EditRoundedIcon fontSize="small" sx={{ ml: "auto" }} />
                  </MenuItem>
                )}

                {/* 공유하기 버튼 - 항상 표시 */}
                <MenuItem
                  onClick={() => {
                    handleMoreMenuClose();
                    handleShare();
                  }}
                  sx={{
                    gap: 4,
                    py: 1.5,
                  }}
                >
                  <Typography variant="subtitle2">공유하기</Typography>
                  <ShareRoundedIcon fontSize="small" sx={{ ml: "auto" }} />
                </MenuItem>

                {/* 삭제하기 버튼 - 작성자일 때만 표시 */}
                {isAuthor && (
                  <MenuItem
                    onClick={handleOpenDeleteDialog}
                    sx={{
                      gap: 4,
                      py: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" color="error">
                      삭제하기
                    </Typography>
                    <DeleteOutlineRoundedIcon fontSize="small" color="error" sx={{ ml: "auto" }} />
                  </MenuItem>
                )}
              </Menu>
            </Stack>
          </Paper>

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
              "& table, & table th, & table td": {
                border: "1px solid #bfbfbf",
                borderCollapse: "collapse",
              },
              "& table th, & table td": {
                padding: "6.4px",
              },
              "& table thead": {
                background: "rgba(0, 0, 0, 0.05)",
              },
              "& figure.image > img": {
                width: "100%",
                height: "auto",
              },
              "& figure.image, & figure.image.image-style-block-align-center": {
                marginX: "auto",
              },
              "& figure.image.image-style-block-align-left": {
                marginX: 0,
                marginRight: "auto",
              },
              "& figure.image.image-style-block-align-right": {
                marginX: 0,
                marginLeft: "auto",
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

              {/* 퍼가기 */}
              <Stack direction="row" alignItems="center">
                {/* 퍼가기 아이콘 */}
                <IconButton size="small" disabled>
                  <IosShareRoundedIcon />
                </IconButton>

                {/* 퍼가기 수 */}
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

              {/* 조회수 */}
              <Stack direction="row" alignItems="center">
                {/* 조회 아이콘 */}
                <IconButton size="small" disabled>
                  <VisibilityOutlinedIcon />
                </IconButton>

                {/* 조회 수 */}
                <Typography variant="subtitle1">{views}</Typography>
              </Stack>
            </Stack>

            {/* 오른쪽 버튼 컨테이너 */}
            {ButtonContainer}
          </Stack>

          {/* 댓글 섹션 */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 3,
              background: (theme) => theme.palette.mode === "dark" 
                ? "linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(33,150,243,0.04) 100%)"
                : "linear-gradient(135deg, rgba(25,118,210,0.06) 0%, rgba(33,150,243,0.03) 100%)",
              border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(144,202,249,0.2)" : "rgba(25,118,210,0.1)"}`,
            }}
          >
            <Stack gap={3}>
              {/* 댓글 헤더 */}
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                    boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                  }}
                >
                  <ChatBubbleOutlineRoundedIcon sx={{ color: "white", fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  댓글 {comments.length}개
                </Typography>
              </Stack>

              {/* 댓글 로딩 중 표시 */}
              {isCommentLoading && (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={32} sx={{ color: "#1976d2" }} />
                </Box>
              )}

              {/* 댓글 목록 */}
              {!isCommentLoading && comments.length > 0 && (
                <Stack gap={2}>
                  {getSortedComments().map((comment) => (
                    <Fragment key={comment.uuid}>
                      {/* 댓글 카드 */}
                      <Paper
                        elevation={0}
                        sx={{
                          ml: {
                            xs: comment.parentUuid ? 2 : 0,
                            sm: comment.parentUuid ? 5 : 0,
                          },
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "background.paper",
                          border: (theme) => comment.parentUuid 
                            ? `1px solid ${theme.palette.mode === "dark" ? "rgba(144,202,249,0.15)" : "rgba(25,118,210,0.08)"}`
                            : `1px solid ${theme.palette.mode === "dark" ? "rgba(144,202,249,0.2)" : "rgba(25,118,210,0.12)"}`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            boxShadow: "0 4px 16px rgba(25,118,210,0.1)",
                          },
                        }}
                      >
                        <Stack direction="row" gap={1.5}>
                          {/* 댓글 작성자 프로필 이미지 */}
                          <Avatar 
                            src={comment.authorProfile}
                            sx={{
                              width: 40,
                              height: 40,
                              border: "2px solid",
                              borderColor: "primary.main",
                            }}
                          />

                          <Stack flex={1} minWidth={0}>
                            {/* 작성자 정보 */}
                            <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {comment.authorName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatRelativeTime(comment.createdAt)}
                              </Typography>
                            </Stack>

                            {/* 댓글 내용 */}
                            {editingCommentUuid === comment.uuid ? (
                              <ClickAwayListener onClickAway={handleEditCommentClose}>
                                <Box>
                                  <CommentInput
                                    key={`reply-edit-input-${comment.uuid}`}
                                    onCommentSubmit={(content) =>
                                      handleCommentEdit(content, comment.uuid)
                                    }
                                    onCommentCancel={handleEditCommentClose}
                                    disabled={isCommentSubmitting}
                                    defaultValue={comment.content}
                                  />
                                </Box>
                              </ClickAwayListener>
                            ) : (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  mb: 1.5,
                                  lineHeight: 1.6,
                                  wordBreak: "break-word",
                                }}
                              >
                                {comment.content}
                              </Typography>
                            )}

                            {/* 액션 버튼 */}
                            <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
                              {/* 답글 쓰기 버튼 */}
                              <Button
                                size="small"
                                onClick={() => handleReplyButtonClick(comment.uuid)}
                                sx={{
                                  minWidth: "auto",
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 2,
                                  fontSize: "0.75rem",
                                  color: "primary.main",
                                  "&:hover": {
                                    bgcolor: "rgba(25,118,210,0.08)",
                                  },
                                }}
                              >
                                답글
                              </Button>

                              {/* 좋아요 버튼 */}
                              <Button
                                size="small"
                                onClick={() => handleCommentLike(comment.uuid)}
                                startIcon={
                                  comment.liked ? (
                                    <FavoriteRoundedIcon sx={{ fontSize: 16 }} />
                                  ) : (
                                    <FavoriteBorderRoundedIcon sx={{ fontSize: 16 }} />
                                  )
                                }
                                sx={{
                                  minWidth: "auto",
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 2,
                                  fontSize: "0.75rem",
                                  color: comment.liked ? "error.main" : "text.secondary",
                                  "&:hover": {
                                    bgcolor: comment.liked 
                                      ? "rgba(239,68,68,0.08)" 
                                      : "rgba(0,0,0,0.04)",
                                  },
                                }}
                              >
                                {comment.likes}
                              </Button>
                            </Stack>
                          </Stack>

                          {/* 더보기 메뉴 */}
                          <IconButton
                            size="small"
                            onClick={(event) => handleCommentMoreButtonClick(event, comment)}
                            sx={{
                              alignSelf: "flex-start",
                              color: "text.secondary",
                              "&:hover": {
                                bgcolor: "rgba(25,118,210,0.08)",
                              },
                            }}
                          >
                            <MoreHorizRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>

                        {/* 답글 입력란 */}
                        {replyParentId === comment.uuid && (
                          <Box mt={2} ml={comment.parentUuid ? 0 : 6}>
                            <CommentInput
                              key={`reply-input-${comment.uuid}`}
                              onCommentSubmit={(content) =>
                                handleCommentSubmit(
                                  content,
                                  comment.parentUuid || comment.uuid
                                )
                              }
                              onCommentCancel={handleReplyCancelButtonClick}
                              disabled={isCommentSubmitting}
                            />
                          </Box>
                        )}
                      </Paper>
                    </Fragment>
                  ))}
                </Stack>
              )}

              {/* 댓글이 없는 경우 메시지 */}
              {!isCommentLoading && comments.length === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    py: 6,
                    px: 4,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    textAlign: "center",
                    border: (theme) => `1px dashed ${theme.palette.mode === "dark" ? "rgba(144,202,249,0.3)" : "rgba(25,118,210,0.2)"}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: "rgba(25,118,210,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 28, color: "#1976d2" }} />
                  </Box>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    첫 번째 댓글을 작성해보세요!
                  </Typography>
                </Paper>
              )}

              {/* 댓글 입력란 */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(144,202,249,0.2)" : "rgba(25,118,210,0.15)"}`,
                }}
              >
                {loginState.isLoggedIn ? (
                  <CommentInput
                    onCommentSubmit={handleCommentSubmit}
                    disabled={isCommentSubmitting}
                  />
                ) : (
                  <Stack alignItems="center" py={2} gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      댓글을 작성하려면 로그인이 필요합니다.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={handleNavigateToLogin}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                        boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                        },
                      }}
                    >
                      로그인하기
                    </Button>
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Paper>

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
                  {/* 템플릿 화면 - 로그인 상태와 관계없이 공개 템플릿 표시 */}
                  <TemplateViewer
                    uuid={templateUuid}
                    height="70vh"
                    paddgingX="24px"
                  />
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
                      transform: `rotate(${
                        isTemplateDrawerOpen ? 0 : -180
                      }deg)`,
                      transition: "transform 0.2s ease-in-out",
                    }}
                  />
                </IconButton>
              </Paper>
            </Paper>
          )}
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
      </Container>

      {/* 댓글 더보기 메뉴 */}
      <Menu
        anchorEl={selectedComment?.element}
        open={selectedComment !== null}
        onClose={() => setSelectedComment(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedComment) {
              handleReplyButtonClick(selectedComment.comment.uuid);
            }
            setSelectedComment(null);
          }}
          sx={{
            gap: 4,
          }}
        >
          <Typography variant="subtitle1">답글쓰기</Typography>
          <AddRoundedIcon fontSize="small" />
        </MenuItem>

        {/* 수정 버튼 */}
        <MenuItem
          onClick={() => {
            if (selectedComment) {
              handleCommentEditButtonClick(selectedComment.comment.uuid);
            }
            setSelectedComment(null);
          }}
          sx={{
            display: selectedComment?.comment.isAuthor ? "flex" : "none",
            gap: 4,
          }}
        >
          <Typography variant="subtitle1">수정하기</Typography>
          <EditRoundedIcon fontSize="small" />
        </MenuItem>

        {/* 삭제 버튼 */}
        <MenuItem
          onClick={() => {
            if (selectedComment?.comment.uuid) {
              handleOpenCommentDeleteDialog(selectedComment.comment.uuid);
            }
            setSelectedComment(null);
          }}
          sx={{
            display:
              selectedComment?.comment &&
              canDeleteComment(selectedComment.comment)
                ? "flex"
                : "none",
            gap: 4,
          }}
        >
          <Typography variant="subtitle1" color="error">
            삭제하기
          </Typography>
          <DeleteOutlineRoundedIcon fontSize="small" color="error" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default CommunityPost;
