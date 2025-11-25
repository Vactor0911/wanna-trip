import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  StackProps,
  Typography,
  useTheme,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Tooltip from "../Tooltip";
import Card from "./Card";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { checkTimeOverlap, MAX_BOARDS } from "../../utils/template";
import {
  BoardInterface,
  cardEditDialogOpenAtom,
  currentEditCardAtom,
  templateAtom,
} from "../../state/template";
import axiosInstance, { getCsrfToken } from "../../utils/axiosInstance";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import dayjs from "dayjs";
import { useAddCard, useBoard } from "../../hooks/template";
import SortMenu from "../SortMenu";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import { useSnackbar } from "notistack";

interface BoardProps extends StackProps {
  day: number;
  boardData: BoardInterface; // 보드 데이터 직접 전달
  fetchTemplateData: () => Promise<void>; // 함수 타입 추가
  isOwner: boolean; // 소유자 여부 추가
  id?: string; // ID 속성 추가 (선택적 속성으로 설정)
  emitBoardAdd: (boardUuid: string, dayNumber: number) => void; // 보드 추가 이벤트 전송 함수
  emitBoardDelete: (boardUuid: string) => void; // 보드 삭제 이벤트 전송 함수
}

const Board = (props: BoardProps) => {
  const {
    day,
    boardData,
    fetchTemplateData,
    isOwner,
    id, // ID 속성 추가 (선택적 속성으로 설정)
    emitBoardAdd,
    emitBoardDelete,
    ...others
  } = props;

  const theme = useTheme();
  const { addBoard, deleteBoard } = useBoard();

  const [template] = useAtom(templateAtom); // 템플릿 상태

  const [, setCurrentEditCard] = useAtom(currentEditCardAtom);
  const [, setCardEditDialogOpen] = useAtom(cardEditDialogOpenAtom);

  const addCard = useAddCard();
  const { enqueueSnackbar } = useSnackbar();

  // 시간 중복 체크 결과
  const { hasOverlap, overlappingCardIds } = checkTimeOverlap(
    boardData.cards || []
  );

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
          cardUuid: card.uuid,
          boardUuid: boardData.uuid,
          orderIndex: card.orderIndex!,
        });
        setCardEditDialogOpen(true);
      }
    },
    [
      isOwner,
      boardData.cards,
      boardData.uuid,
      setCurrentEditCard,
      setCardEditDialogOpen,
    ]
  );

  // 카드 생성 버튼 클릭 핸들러
  const handleAddCardButtonClick = useCallback(async () => {
    // 보드 Uuid가 없으면 중단
    if (!boardData.uuid) {
      return;
    }

    // 보드 내 마지막 카드의 종료 시간 추출
    const lastCardEndTime = boardData.cards.length
      ? dayjs(boardData.cards[boardData.cards.length - 1].endTime)
      : dayjs().hour(9).minute(0).second(0);

    // 카드 추가 훅 호출
    try {
      const newCardUuid = await addCard(
        boardData.uuid,
        lastCardEndTime,
        boardData.cards.length + 1
      );
      fetchTemplateData();

      // 카드 편집 대화상자 열기
      setCurrentEditCard({
        cardUuid: newCardUuid,
        boardUuid: boardData.uuid,
        orderIndex: boardData.cards.length,
      });
    } catch (error) {
      console.error("카드 추가 중 오류 발생:", error);
    }
  }, [
    boardData.uuid,
    boardData.cards,
    addCard,
    fetchTemplateData,
    setCurrentEditCard,
  ]);

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
        `/board`,
        {
          templateUuid: template.uuid,
          dayNumber: day + 1,
        }, // 빈 객체 전송
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        const boardUuid = response.data.boardUuid;
        const dayNumber = day + 1;

        // 변경된 보드 상태 반영
        addBoard(boardUuid, dayNumber);
        emitBoardAdd(boardUuid, dayNumber);
      }
    } catch (error) {
      console.error("보드 추가 오류:", error);
    }
  }, [addBoard, day, emitBoardAdd, template.boards.length, template.uuid]);

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
        `/board/copy/${boardData.uuid}`,
        {}, // 빈 객체 전송 (title 필드 제거)
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 템플릿 데이터 새로 불러오기
        await fetchTemplateData();
      }
    } catch (error) {
      console.error("보드 복제 오류:", error);
    }
  }, [boardData.uuid, fetchTemplateData, template.boards.length]);

  // 보드 삭제 버튼 클릭
  const handleDeleteBoardButtonClick = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();
      const boardUuid = boardData.uuid;

      // 보드 개수가 최소 개수보다 적으면
      if (template.boards.length <= 1) {
        // 카드가 있다면 보드 카드 모두 삭제 API 호출
        if (template.boards[0].cards.length > 0) {
          const response = await axiosInstance.put(
            `/board/clear/${boardUuid}`,
            {},
            { headers: { "X-CSRF-Token": csrfToken } }
          );

          if (response.data.success) {
            // 템플릿 데이터 새로 불러오기
            deleteBoard(boardUuid);
            emitBoardDelete(boardUuid);
          }
        }
        return;
      }

      // 보드 개수가 2개 이상일 경우 보드 자체를 삭제
      const response = await axiosInstance.delete(`/board/${boardUuid}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        // 템플릿 데이터 새로 불러오기
        deleteBoard(boardUuid);
        emitBoardDelete(boardUuid);
      }
    } catch (error) {
      console.error("보드 삭제 오류:", error);
    }
  }, [boardData.uuid, template.boards, deleteBoard, emitBoardDelete]);

  // 보드 내 카드 시작 시간순 정렬 함수
  const handleSortByStartTime = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 백엔드 API 호출
      const response = await axiosInstance.put(
        `/board/sort/${boardData.uuid}`,
        {},
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 정렬 후 템플릿 데이터 다시 가져오기
        await fetchTemplateData();

        enqueueSnackbar("카드가 시작 시간 순으로 정렬되었습니다.", {
          variant: "success",
        });
      }
    } catch (error) {
      console.error("카드 정렬 오류:", error);
      enqueueSnackbar("카드 정렬 중 오류가 발생했습니다.", {
        variant: "error",
      });
    }
  }, [boardData.uuid, fetchTemplateData, enqueueSnackbar]);

  // 보드 스크롤 함수 추가 (Board 컴포넌트 내부에 추가)
  const scrollToFirstOverlappingCard = useCallback(() => {
    // 중복되는 첫 번째 카드 ID
    const firstOverlappingCardId = overlappingCardIds[0];

    if (firstOverlappingCardId) {
      // 해당 ID를 가진 카드 요소 찾기
      const cardElement = document.getElementById(
        `card-${firstOverlappingCardId}`
      );

      if (cardElement) {
        // 부드럽게 스크롤
        cardElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // 사용자에게 피드백 제공 (옵션)
        enqueueSnackbar("시간이 중복된 카드로 이동했습니다.", {
          variant: "info",
        });

        // 시각적 효과로 카드 강조 (선택 사항)
        cardElement.classList.add("highlight-card");
        setTimeout(() => {
          cardElement.classList.remove("highlight-card");
        }, 2000);
      }
    }
  }, [overlappingCardIds, enqueueSnackbar]);

  return (
    <Stack height="100%" id={id} {...others}>
      <Paper
        elevation={3}
        sx={{
          maxHeight: "100%",
          background: theme.palette.secondary.main,
          // 시간 중복이 있는 경우 붉은색 테두리 추가
          border: hasOverlap ? `2px solid ${theme.palette.error.main}` : "none",
          borderRadius: "8px",
        }}
      >
        <Stack py={1} px={1.5} width="300px" maxHeight="inherit" gap={1}>
          {/* 헤더 메뉴바 */}
          <Stack direction="row" justifyContent="space-between">
            {/* 좌측 컨테이너 */}
            <Stack direction="row" alignItems="center" gap={0.5}>
              {/* 보드 날짜 */}
              <Typography variant="h6">Day {day}</Typography>

              {/* 정렬하기 버튼 - 소유자만 볼 수 있음 */}
              {isOwner && (
                <SortMenu
                  onSortStart={handleSortByStartTime}
                  tooltipTitle="보드 내 정렬하기"
                />
              )}

              {/* 시간 중복 경고 아이콘 */}
              {hasOverlap && (
                <Tooltip
                  title={
                    <div>
                      <Typography variant="body2">
                        동일한 시간대가 존재합니다.
                      </Typography>
                      <Typography variant="body2">
                        시간이 겹치는 일정을 확인하세요.
                      </Typography>
                    </div>
                  }
                >
                  <IconButton
                    size="small"
                    onClick={scrollToFirstOverlappingCard}
                    sx={{ padding: 0.5 }}
                  >
                    <ReportProblemRoundedIcon
                      sx={{
                        color: `${theme.palette.error.main} !important`,
                        fontSize: "1.2rem",
                      }}
                    />
                  </IconButton>
                </Tooltip>
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
            droppableId={String(boardData.uuid)}
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
                    key={`card-${card.uuid}`}
                    draggableId={`${card.uuid}`}
                    index={index}
                    isDragDisabled={!isOwner} // 소유자가 아닐 때만 드래그 불가능, 잠긴 카드 조건 제거
                  >
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        id={`card-${card.uuid}`} // ID 속성 추가
                        sx={{
                          borderRadius: "8px",
                        }}
                      >
                        <Card
                          key={`card-${card.uuid}`}
                          content={card.content || ""}
                          startTime={card.startTime}
                          endTime={card.endTime}
                          isLocked={card.locked}
                          location={card.location || undefined}
                          onClick={() => handleCardClick(index)}
                          isOwner={isOwner}
                          isTimeOverlapping={
                            card.uuid !== undefined &&
                            overlappingCardIds.includes(card.uuid)
                          }
                        />
                      </Box>
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
