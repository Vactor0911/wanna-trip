import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "react-router";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import parse from "html-react-parser";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { red } from "@mui/material/colors";
import CommentInput from "../components/CommentInput";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ScrollToTopButton from "../components/ScrollToTopButton";

const CommunityPost = () => {
  const { postId } = useParams(); // 게시글 ID

  const [isLoading, setIsLoading] = useState(false); // 게시글 로딩 여부
  const [title] = useState("게시글 제목"); // 게시글 제목
  const [authorId] = useState("1"); // 작성자 ID
  const [authorName] = useState("작성자 이름"); // 작성자 이름
  const [authorProfileImage] = useState(""); // 작성자 프로필 이미지 URL
  const [createdAt] = useState("2023-10-01"); // 작성일
  const [content] = useState(
    `<h1>제주도 3박 4일 여행 후기</h1>

  <p>
    지난주, 오랜만에 제주도로 3박 4일 여행을 다녀왔습니다. 서울의 바쁜 일상에서 벗어나 푸른 바다와 싱그러운 자연을 만끽할 수 있었던 소중한 시간이었어요.
    날씨도 대부분 맑아서 관광하기에 딱 좋았고, 맛있는 음식들과 예쁜 카페들, 그리고 아름다운 풍경들이 아직도 눈에 선합니다.
  </p>

  <h2>1일차: 제주 도착 & 협재 해수욕장</h2>

  <p>
    제주공항에 도착한 건 오전 11시쯤이었습니다. 렌터카를 대여한 후 가장 먼저 향한 곳은 <strong>협재 해수욕장</strong>이었어요. 협재는 말로만 듣던 것보다 훨씬 더 아름다웠습니다.
    에메랄드빛 바다와 하얀 모래가 조화를 이루고 있었고, 해변가를 따라 산책을 하며 바닷바람을 맞는 것만으로도 힐링이 됐습니다.
  </p>

  <img src="https://via.placeholder.com/800x400?text=협재+해수욕장" alt="협재 해수욕장 풍경">

  <p>
    근처의 해물라면 맛집에서 점심을 먹었는데, 신선한 해산물이 듬뿍 들어가 국물 맛이 일품이었습니다. 오후엔 게스트하우스에 체크인 후, 근처 카페에서 여유로운 시간을 보냈습니다.
  </p>

  <h2>2일차: 오름 트레킹 & 성산일출봉</h2>

  <p>
    이 날은 아침 일찍 <strong>새별오름</strong>에 올랐습니다. 완만한 경사지만 약간의 운동이 되는 정도였고, 정상에 올라서 바라본 제주의 초록 대지는 정말 감탄이 절로 나왔습니다.
  </p>

  <img src="https://via.placeholder.com/800x400?text=새별오름+전망" alt="새별오름에서 본 전망">

  <p>
    오후에는 동쪽으로 이동해 <strong>성산일출봉</strong>에 다녀왔습니다. 올라가는 길이 생각보다 힘들었지만, 정상에서 내려다본 바다 풍경과 바람은 그 어떤 피로도 잊게 만들었죠.
    저녁은 근처 흑돼지 맛집에서 구워 먹었는데, 제주도에 오면 꼭 먹어야 할 음식 중 하나입니다.
  </p>

  <h2>3일차: 우도 여행</h2>

  <p>
    셋째 날에는 배를 타고 <strong>우도</strong>에 다녀왔습니다. 소박하고 한적한 분위기의 섬이었고, 전기 자전거를 대여해 섬을 한 바퀴 돌았습니다.
    검멀레 해변의 짙은 현무암 모래와 맑은 물빛이 인상적이었고, 땅콩 아이스크림도 정말 맛있었어요.
  </p>

  <img src="https://via.placeholder.com/800x400?text=우도+풍경" alt="우도에서 찍은 사진">

  <p>
    돌아오는 길엔 한적한 카페에 들러 일몰을 감상하며 하루를 마무리했습니다. 제주도의 섬 안의 섬, 우도는 다시 가고 싶은 곳 1순위가 되었습니다.
  </p>

  <h2>4일차: 기념품 쇼핑 & 귀경</h2>

  <p>
    마지막 날은 느긋하게 시작해 공항 근처에서 기념품을 구매했습니다. 감귤 초콜릿, 말차 크런치, 제주녹차 제품 등을 구입했고,
    주변 카페에서 마지막으로 제주산 원두 커피를 마셨습니다. 공항으로 가는 길엔 아쉬움이 컸지만, 다음 여행을 기약하며 돌아왔습니다.
  </p>

  <h2>여행을 마치며</h2>

  <p>
    3박 4일이라는 시간이 짧게 느껴질 만큼 알차고 풍성한 여행이었습니다. 제주도는 계절마다 다른 매력을 가지고 있는 곳이라 언제 가도 새로운 즐거움을 느낄 수 있는 것 같아요.
    일상에 지친 분들에게 강력 추천드리고 싶은 여행지입니다. 다음엔 남쪽 해안도로 쪽도 여유 있게 돌아보고 싶네요.
  </p>`
  ); // 게시글 내용 (HTML 형식)
  const [likes] = useState(10); // 좋아요 수
  const [isLiked, setIsLiked] = useState(false); // 좋아요 상태
  const [comments, setComments] = useState([
    {
      id: "1",
      authorId: "1",
      authorName: "홍길동",
      content: "첫 번째 댓글 내용입니다.",
      createdAt: "2023-10-01 12:00",
      likes: 2,
      parentId: null,
      liked: false,
    },
    {
      id: "2",
      authorId: "2",
      authorName: "김철수",
      content: "두 번째 댓글 내용입니다.",
      createdAt: "2023-10-01 12:05",
      likes: 1,
      parentId: null,
      liked: false,
    },
    {
      id: "3",
      authorId: "1",
      authorName: "홍길동",
      content: "첫 번째 댓글에 대한 답글입니다.",
      createdAt: "2023-10-01 12:10",
      likes: 0,
      parentId: "1",
      liked: false,
    },
    {
      id: "4",
      authorId: "3",
      authorName: "이영희",
      content: "세 번째 댓글 내용입니다.",
      createdAt: "2023-10-01 12:15",
      likes: 3,
      parentId: null,
    },
    {
      id: "5",
      authorId: "2",
      authorName: "김철수",
      content: "두 번째 댓글에 대한 답글입니다.",
      createdAt: "2023-10-01 12:20",
      likes: 1,
      parentId: "2",
    },
    {
      id: "6",
      authorId: "3",
      authorName: "이영희",
      content: "첫 번째 댓글에 대한 두번째 답글입니다.",
      createdAt: "2023-10-01 12:50",
      likes: 0,
      parentId: "1",
      liked: false,
    },
  ] as Comment[]); // 댓글 수
  const [replyParentId, setReplyParentId] = useState<string | null>(null); // 댓글 부모 ID
  const moreButtonRef = useRef<HTMLButtonElement>(null); // 더보기 버튼 참조
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false); // 더보기 메뉴 열림 상태

  // TODO: 백엔드 연동시 병합해야 할 기능
  useEffect(() => {
    const sortedComments = getSortedComments();
    setComments(sortedComments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 좋아요 버튼 클릭
  const handleLikeButtonClick = useCallback(() => {
    setIsLiked((prev) => !prev);
  }, []);

  // TODO: 댓글 타입 재정의 필요
  interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    likes: number;
    parentId?: string | null; // 최상위면 null
    liked: boolean;
  }

  // 댓글 정렬 함수
  const getSortedComments = useCallback((): Comment[] => {
    // 트리 구조를 위한 맵 생성
    const childrenMap = new Map<string, Comment[]>(); // parentId : 댓글 배열 형태로 구성
    const roots: Comment[] = []; // 부모 댓글 배열

    // 트리 구조 구성
    for (const c of comments) {
      if (c.parentId) {
        const list = childrenMap.get(c.parentId) ?? [];
        list.push(c);
        childrenMap.set(c.parentId, list);
      } else {
        roots.push(c);
      }
    }

    // 시간순 정렬
    const sortByTime = (a: Comment, b: Comment) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

    roots.sort(sortByTime);
    for (const list of childrenMap.values()) {
      list.sort(sortByTime);
    }

    // 결과 배열 생성
    const result: Comment[] = [];

    // 재귀 함수 정의
    const dfs = (comment: Comment) => {
      // 현재 댓글 추가
      result.push(comment);

      // 자식 댓글이 있다면 재취 호출
      const children = childrenMap.get(comment.id);
      if (!children) return;

      for (const child of children) {
        dfs(child);
      }
    };

    for (const root of roots) {
      dfs(root); // 부모 댓글부터 시작
    }

    return result;
  }, [comments]);

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

  return (
    <Container maxWidth="lg">
      <Stack minHeight="calc(100vh - 82px)" gap={4} py={5} pb={15}>
        {/* 게시판 버튼 */}
        <Box>
          <NavLink
            to="/community"
            css={{
              textDecoration: "none",
              color: "inherit",
              position: "relative",
            }}
          >
            <Typography variant="h5" display="inline">
              게시판
            </Typography>

            {/* 아이콘 */}
            <ChevronLeftRoundedIcon
              fontSize="large"
              sx={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translate(-100%, -50%)",
              }}
            />
          </NavLink>
        </Box>

        {/* 게시글 제목 */}
        <Typography variant="h4">{title}</Typography>

        {/* 작성 정보 */}
        <Stack direction="row" alignItems="center" gap={2}>
          {/* 작성자 프로필 이미지 */}
          <Avatar
            sx={{
              width: 48,
              height: 48,
            }}
          />

          <Stack>
            {/* 작성자 이름 */}
            <Typography variant="subtitle1" fontWeight="bold">{authorName}</Typography>

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
              {/* 수정하기 버튼 */}
              <MenuItem
                onClick={handleMoreMenuClose}
                sx={{
                  gap: 4,
                }}
              >
                <Typography variant="subtitle1">수정하기</Typography>
                <EditRoundedIcon fontSize="small" />
              </MenuItem>

              {/* 공유하기 버튼 */}
              <MenuItem
                onClick={handleMoreMenuClose}
                sx={{
                  gap: 4,
                }}
              >
                <Typography variant="subtitle1">공유하기</Typography>
                <ShareRoundedIcon fontSize="small" />
              </MenuItem>

              {/* 삭제하기 버튼 */}
              <MenuItem
                onClick={handleMoreMenuClose}
                sx={{
                  gap: 4,
                }}
              >
                <Typography variant="subtitle1" color="error">
                  삭제하기
                </Typography>
                <DeleteOutlineRoundedIcon fontSize="small" color="error" />
              </MenuItem>
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

        {/* 버튼 컨테이너 */}
        <Stack direction="row" gap={2}>
          {/* 좋아요 */}
          <Stack direction="row" alignItems="center">
            {/* 좋아요 버튼 */}
            <IconButton size="small" onClick={handleLikeButtonClick}>
              {isLiked ? (
                <FavoriteRoundedIcon
                  sx={{
                    color: red[600],
                  }}
                />
              ) : (
                <FavoriteBorderRoundedIcon
                  sx={{
                    color: red[600],
                  }}
                />
              )}
            </IconButton>

            {/* 좋아요 수 */}
            <Typography variant="subtitle1">
              {likes + Number(isLiked)}
            </Typography>
          </Stack>

          {/* 댓글 */}
          <Stack direction="row" alignItems="center">
            {/* 댓글 버튼 */}
            <IconButton size="small">
              <ChatBubbleOutlineRoundedIcon />
            </IconButton>

            {/* 좋아요 수 */}
            <Typography variant="subtitle1">{comments.length}</Typography>
          </Stack>

          {/* 중앙 공백용 박스 */}
          <Box
            sx={{
              flexGrow: 1,
            }}
          />

          {/* 수정 버튼 */}
          <Button variant="outlined" color="black">
            <Typography variant="subtitle2" fontWeight="bold">
              수정
            </Typography>
          </Button>

          {/* 삭제 버튼 */}
          <Button variant="outlined" color="error">
            <Typography variant="subtitle2" fontWeight="bold">
              삭제
            </Typography>
          </Button>
        </Stack>

        {/* 댓글 */}
        <Stack gap={3}>
          {comments.map((comment, index) => (
            <>
              {/* 댓글 컨테이너 */}
              <Stack
                key={`comment-container-${comment.id}`}
                ml={comment.parentId ? "50px" : "0"}
                gap={3}
              >
                {/* 댓글 */}
                <Stack key={`comment-${comment.id}`} direction="row" gap={1}>
                  {/* 댓글 작성자 프로필 이미지 */}
                  <Avatar />

                  <Stack>
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
                        {comment.createdAt}
                      </Typography>

                      {/* 답글 쓰기 버튼 */}
                      <Button
                        onClick={() => handleReplyButtonClick(comment.id)}
                        sx={{
                          padding: 0,
                        }}
                      >
                        <Typography variant="subtitle2" color="primary">
                          답글 쓰기
                        </Typography>
                      </Button>

                      {/* 좋아요 버튼 */}
                      <IconButton
                        size="small"
                        sx={{
                          padding: 0.5,
                        }}
                      >
                        <FavoriteBorderRoundedIcon
                          sx={{
                            color: red[600],
                          }}
                        />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>

                {/* 답글 입력란 */}
                {replyParentId === comment.id && (
                  <Stack gap={3}>
                    {/* 구분선 */}
                    <Divider />

                    {/* 답글 입력란 */}
                    <Box ml={comment.parentId ? "0" : "50px"}>
                      <CommentInput
                        key={`reply-input-${comment.id}`}
                        onCommentSubmit={() => {}}
                        onCommentCancel={handleReplyCancelButtonClick}
                      />
                    </Box>

                    {index >= comments.length - 1 && <Divider />}
                  </Stack>
                )}
              </Stack>

              {/* 구분선 */}
              {index < comments.length - 1 && (
                <Divider
                  sx={{
                    ml:
                      !!comment.parentId && !!comments[index + 1].parentId
                        ? "50px"
                        : "0",
                  }}
                />
              )}
            </>
          ))}
        </Stack>

        {/* 댓글 입력란 */}
        <CommentInput onCommentSubmit={() => {}} />

        {/* 스크롤 상단 이동 버튼 */}
        <ScrollToTopButton />
      </Stack>
    </Container>
  );
};

export default CommunityPost;
