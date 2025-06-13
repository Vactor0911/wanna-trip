import { useAtom } from "jotai";
import { CardInterface, templateAtom } from "../state/template";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { useCallback } from "react";

/**
 * 카드 추가 훅
 * @param newCard 새로운 카드 데이터
 * @param boardId 카드가 추가될 보드 Id
 * @param index 카드가 추가될 위치 (선택적)
 * @returns 보드Id의 index 위치에 새로운 카드를 추가
 */
export const useAddCard = () => {
  const [template, setTemplate] = useAtom(templateAtom);

  const addCard = useCallback(
    async (newCard: CardInterface, boardId: string, index?: number) => {
      // 보드가 존재하지 않으면 종료
      if (!boardId) return;

      // 카드 데이터 처리
      const cardData = {
        content: newCard.content,
        startTime: newCard.startTime.format("YYYY-MM-DD HH:mm:ss"),
        endTime: newCard.endTime.format("YYYY-MM-DD HH:mm:ss"),
        isLocked: newCard.isLocked,
      };

      // 백엔드 API 엔드포인트 설정
      const endPoint =
        index !== undefined
          ? `/card/add/${boardId}/${index}`
          : `/card/add/${boardId}`;

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 카드 추가 API 요청
      const response = await axiosInstance.post(endPoint, cardData, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      // 오류 처리
      if (!response.data.success) {
        throw new Error("카드 추가에 실패했습니다.");
      }

      // 카드 추가 성공
      const newCardId = response.data.cardId;

      // 템플릿 업데이트
      const newTemplate = {
        ...template,
        boards: template.boards.map((board) => {
          if (board.id === boardId) {
            const updatedCards = [...board.cards];
            if (index !== undefined) {
              updatedCards.splice(index, 0, { ...newCard, id: newCardId });
            } else {
              updatedCards.push({ ...newCard, id: newCardId });
            }
            return { ...board, cards: updatedCards };
          }
          return board;
        }),
      };
      setTemplate(newTemplate);

      return newCardId; // 새 카드 ID 반환
    },
    [setTemplate, template]
  );

  return addCard;
};

export const useMoveCard = () => {
  const [template, setTemplate] = useAtom(templateAtom);

  const moveCard = useCallback(
    async (
      source: { boardId: string; orderIndex: number },
      destination: { boardId: string; orderIndex: number }
    ) => {
      // 보드가 존재하지 않으면 종료
      if (!source.boardId || !destination.boardId) {
        return;
      }

      // 카드 이동 데이터
      const moveData = {
        sourceBoardId: source.boardId,
        sourceOrderIndex: source.orderIndex,
        destinationBoardId: destination.boardId,
        destinationOrderIndex: destination.orderIndex,
      };

      // 백엔드 API 엔드포인트 설정
      const endPoint = `/card/move`;

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 카드 이동 API 요청
      const response = await axiosInstance.post(endPoint, moveData, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      // 오류 처리
      if (!response.data.success) {
        throw new Error("카드 이동에 실패했습니다.");
      }

      // 카드 이동 성공
      // 이동된 카드 정보 가져오기
      const movedCard = template.boards.find(
        (board) => board.id == source.boardId
      )?.cards[source.orderIndex];
      console.log("이동된 카드:", movedCard);

      // 기존 위치에서 카드 제거
      let newTemplate = {
        ...template,
        boards: template.boards
          .map((board) => {
            if (board.id == source.boardId) {
              // 소스 보드에서 카드 제거
              const updatedCards = [...board.cards];
              updatedCards.splice(source.orderIndex, 1);
              return { ...board, cards: updatedCards };
            }
            return board;
          })
          .filter((board): board is typeof board => board !== undefined),
      };

      // 대상 보드에 카드 추가
      newTemplate = {
        ...newTemplate,
        boards: newTemplate.boards
          .map((board) => {
            if (board && board.id == destination.boardId) {
              // 대상 보드에 카드 추가
              const updatedCards = [...board.cards];
              updatedCards.splice(
                destination.orderIndex,
                0,
                movedCard as CardInterface
              );
              return { ...board, cards: updatedCards };
            }
            return board;
          })
          .filter((board): board is typeof board => board !== undefined),
      };

      console.log("이동 후 템플릿:", newTemplate);

      setTemplate(newTemplate);
    },
    [setTemplate, template]
  );

  return moveCard;
};
