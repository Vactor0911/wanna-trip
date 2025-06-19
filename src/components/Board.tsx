import {
  Button,
  IconButton,
  Paper,
  Stack,
  StackProps,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Tooltip from "./Tooltip";
import Card from "./Card";
import { theme } from "../utils/theme";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { MAX_BOARDS } from "../utils/template";
import {
  BoardInterface,
  cardEditDialogOpenAtom,
  CardInterface,
  currentEditCardAtom,
  templateAtom,
} from "../state/template";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import dayjs from "dayjs";
import { useAddCard } from "../hooks/template";
import SortMenu from "./SortMenu";

interface BoardProps extends StackProps {
  day: number;
  boardData: BoardInterface; // 보드 데이터 직접 전달
  fetchTemplateData: () => Promise<void>; // 함수 타입 추가
  isOwner: boolean; // 소유자 여부 추가
  showSnackbar: (
    message: string,
    severity?: "success" | "error" | "warning" | "info"
  ) => void;
  // showSnackbar 함수 타입 추가
}

const Board = (props: BoardProps) => {
  const {
    day,
    boardData,
    fetchTemplateData,
    isOwner,
    showSnackbar,
    ...others
  } = props;
  const [template] = useAtom(templateAtom); // 템플릿 상태

  const [, setCurrentEditCard] = useAtom(currentEditCardAtom);
  const [, setCardEditDialogOpen] = useAtom(cardEditDialogOpenAtom);

  const addCard = useAddCard();

  // 카드 클릭 핸들러
  const handleCardClick = useCallback(
    (cardIndex: number) => {
      // 소유자가 아니면 카드 클릭 무시
      if (!isOwner) {
        return; // 소유자가 아니면 함수 실행 중단
      }
      // 현재 카드 설정
      const card = boardData.cards[cardIndex];
      if (card) {
        setCurrentEditCard({
          cardId: card.id,
          boardId: boardData.id,
          orderIndex: card.orderIndex || cardIndex,
        });
        setCardEditDialogOpen(true);
      }
    },
    [
      isOwner,
      boardData.cards,
      boardData.id,
      setCurrentEditCard,
      setCardEditDialogOpen,
    ]
  );

  // 카드 생성 버튼 클릭 핸들러
  const handleAddCardButtonClick = useCallback(async () => {
    // 보드 Id가 없으면 중단
    if (!boardData.id) {
      return;
    }

    // 생성할 새 카드
    const newCard: CardInterface = {
      content: "",
      startTime: dayjs(),
      endTime: dayjs().add(1, "hour"),
      isLocked: false,
    };

    // 카드 추가 훅 호출
    try {
      const newCardId = await addCard(newCard, boardData.id);

      // 카드 편집 대화상자 열기
      setCurrentEditCard({
        cardId: newCardId,
        boardId: boardData.id,
        orderIndex: boardData.cards.length,
      });
      setCardEditDialogOpen(true);
    } catch (error) {
      console.error("카드 추가 중 오류 발생:", error);
    }
  }, [boardData, setCurrentEditCard, setCardEditDialogOpen, addCard]);

  // 보드 추가 버튼 클릭 - 현재 보드 바로 뒤에 새 보드 추가
  const handleAddBoardButtonClick = useCallback(async () => {
    // 보드 개수가 최대 개수보다 많으면 중단
    if (template.boards.length >= MAX_BOARDS) {
      return;
    }

    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 백엔드 API 호출하여 현재 보드 뒤에 새 보드 생성
      const response = await axiosInstance.post(
        `/board/after/${boardData.id}`,
        {}, // 빈 객체 전송
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        console.log("보드 추가 성공:", response.data);

        // 템플릿 데이터 새로 불러오기
        await fetchTemplateData();
      }
    } catch (error) {
      console.error("보드 추가 오류:", error);
    }
  }, [boardData.id, fetchTemplateData, template.boards.length]);

  // 보드 복제 버튼 클릭 - 현재 보드를 복제하여 바로 뒤에 배치
  const handleCopyBoardButtonClick = useCallback(async () => {
    // 보드 개수가 최대 개수보다 많으면 중단
    if (template.boards.length >= MAX_BOARDS) {
      return;
    }

    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 백엔드 API 호출하여 현재 보드 복제 (newTitle 필드 제거)
      const response = await axiosInstance.post(
        `/board/duplicate/${boardData.id}`,
        {}, // 빈 객체 전송 (title 필드 제거)
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        console.log("보드 복제 성공:", response.data);

        // 템플릿 데이터 새로 불러오기
        await fetchTemplateData();
      }
    } catch (error) {
      console.error("보드 복제 오류:", error);
    }
  }, [boardData.id, fetchTemplateData, template.boards.length]);

  // 보드 삭제 버튼 클릭
  const handleDeleteBoardButtonClick = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 보드 개수가 최소 개수보다 적으면
      if (template.boards.length <= 1) {
        // 카드가 있다면 보드 카드 모두 삭제 API 호출
        if (template.boards[0].cards.length > 0) {
          const response = await axiosInstance.delete(
            `/board/${boardData.id}/cards`,
            {
              headers: { "X-CSRF-Token": csrfToken },
            }
          );

          if (response.data.success) {
            console.log("보드 카드 삭제 성공:", response.data);

            // 템플릿 데이터 새로 불러오기
            await fetchTemplateData();
          }
        }
        return;
      }

      // 보드 개수가 2개 이상일 경우 보드 자체를 삭제
      const response = await axiosInstance.delete(`/board/${boardData.id}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        console.log("보드 삭제 성공:", response.data);

        // 템플릿 데이터 새로 불러오기
        await fetchTemplateData();
      }
    } catch (error) {
      console.error("보드 삭제 오류:", error);
    }
  }, [template, boardData, fetchTemplateData]);

  // 보드 내 카드 시작 시간순 정렬 함수
  const handleSortByStartTime = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 백엔드 API 호출
      const response = await axiosInstance.post(
        `/board/${boardData.id}/sort`,
        { sortBy: "start_time" },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 정렬 후 템플릿 데이터 다시 가져오기
        await fetchTemplateData();

        showSnackbar("카드가 시작 시간 순으로 정렬되었습니다.", "success");
      }
    } catch (error) {
      console.error("카드 정렬 오류:", error);
      showSnackbar("카드 정렬 중 오류가 발생했습니다.", "error");
    }
  }, [boardData.id, fetchTemplateData, showSnackbar]);

  // 보드 내 카드 종료 시간순 정렬 함수
  const handleSortByEndTime = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 백엔드 API 호출
      const response = await axiosInstance.post(
        `/board/${boardData.id}/sort`,
        { sortBy: "end_time" },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 정렬 후 템플릿 데이터 다시 가져오기
        await fetchTemplateData();

        showSnackbar("카드가 종료 시간 순으로 정렬되었습니다.", "success");
      }
    } catch (error) {
      console.error("카드 정렬 오류:", error);
      showSnackbar("카드 정렬 중 오류가 발생했습니다.", "error");
    }
  }, [boardData.id, fetchTemplateData, showSnackbar]);

  return (
    <Stack height="100%" {...others}>
      <Paper
        elevation={3}
        sx={{
          maxHeight: "100%",
          background: theme.palette.secondary.main,
        }}
      >
        <Stack padding={1} width="300px" maxHeight="inherit" gap={1}>
          {/* 헤더 메뉴바 */}
          <Stack direction="row" justifyContent="space-between">
            {/* 좌측 컨테이너 */}
            <Stack direction="row" alignItems="center" gap={1}>
              {/* 보드 날짜 */}
              <Typography variant="h6">Day {day}</Typography>

              {/* 정렬하기 버튼 - 소유자만 볼 수 있음 */}
              {isOwner && (
                <SortMenu
                  onSortStart={handleSortByStartTime}
                  onSortEnd={handleSortByEndTime}
                  tooltipTitle="보드 내 정렬하기"
                />
              )}
            </Stack>

            {/* 우측 컨테이너 - 소유자만 볼 수 있음 */}
            {isOwner && (
              <Stack direction="row" alignItems="center">
                {/* 보드 추가하기 버튼 */}
                <Tooltip title="보드 추가하기" placement="top">
                  <IconButton size="small" onClick={handleAddBoardButtonClick}>
                    <AddRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* 보드 복제하기 버튼 */}
                <Tooltip title="보드 복제하기" placement="top">
                  <IconButton size="small" onClick={handleCopyBoardButtonClick}>
                    <ContentCopyRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* 보드 삭제하기 버튼 */}
                <Tooltip title="보드 삭제하기" placement="top">
                  <IconButton
                    size="small"
                    onClick={handleDeleteBoardButtonClick}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>

          {/* 카드 드롭 영역 */}
          <Droppable
            droppableId={String(boardData.id)}
            type="card"
            isDropDisabled={!isOwner} // 소유자가 아니면 드롭 불가능
          >
            {(provided) => (
              // 카드 컨테이너
              <Stack
                ref={provided.innerRef}
                {...provided.droppableProps}
                flex={1}
                gap={2}
                paddingBottom={0.5}
                sx={{
                  overflowY: "auto",
                }}
              >
                {/* 카드 목록 렌더링 */}
                {(boardData?.cards || []).map((card, index) => (
                  <Draggable
                    key={`card-${card.id}`}
                    draggableId={`card-${card.id}`}
                    index={index}
                    isDragDisabled={!isOwner || card.isLocked} // 소유자가 아니거나 카드가 잠겨있으면 드래그 불가능
                  >
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        key={`card-${card.id}`}
                        content={card.content || ""}
                        startTime={card.startTime}
                        endTime={card.endTime}
                        isLocked={card.isLocked}
                        location={card.location}
                        onClick={() => handleCardClick(index)}
                        isOwner={isOwner} // isOwner 속성 전달
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Stack>
            )}
          </Droppable>

          {/* 카드 추가 버튼 - 소유자만 볼 수 있음 */}
          {isOwner && (
            <Button
              fullWidth
              startIcon={<AddRoundedIcon sx={{ color: "inherit" }} />}
              onClick={handleAddCardButtonClick}
            >
              <Typography variant="subtitle1">계획 추가하기</Typography>
            </Button>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default Board;
