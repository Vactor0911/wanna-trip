import { useAtom, useSetAtom } from "jotai";
import {
  CardInterface,
  templateAtom,
  TemplateInterface,
} from "../state/template";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    async (newCard: CardInterface, boardId: number, index?: number) => {
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

/**
 * 카드 이동 훅
 * @returns 카드 이동을 위한 훅
 */
interface MoveCardParams {
  source: { boardId: number; orderIndex: number };
  destination: { boardId: number; orderIndex: number };
  prevTemplate: TemplateInterface;
}

export const useMoveCard = () => {
  const setTemplate = useSetAtom(templateAtom);
  const queryClient = useQueryClient();

  const moveCard = useMutation({
    mutationFn: async ({ source, destination }: MoveCardParams) => {
      // 보드가 존재하지 않으면 종료
      if (!source.boardId || !destination.boardId) {
        return;
      }

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 카드 이동 API 요청
      await axiosInstance.post(
        "/card/move",
        {
          sourceBoardId: source.boardId,
          sourceOrderIndex: source.orderIndex,
          destinationBoardId: destination.boardId,
          destinationOrderIndex: destination.orderIndex,
        },
        { headers: { "X-CSRF-Token": csrfToken } }
      );
    },
    onError: (_error, context) => {
      if (context?.prevTemplate) {
        queryClient.setQueryData(["template"], context.prevTemplate);
        setTemplate(context.prevTemplate);
      }
      console.error("카드 이동 실패:", _error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["template"] });
    },
  });

  return moveCard;
};
