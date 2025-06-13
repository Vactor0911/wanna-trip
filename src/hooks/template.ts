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
        index !== undefined ? `/card/${boardId}/${index}` : `/card/${boardId}`;

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 카드 추가 API 요청
      const response = await axiosInstance.post(endPoint, cardData, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (!response.data.success) {
        // 오류 처리
        throw new Error("카드 추가에 실패했습니다.");
      }

      // 카드 추가 성공
      const newCardId = response.data.cardId;

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
      }

      setTemplate(newTemplate);
      console.log("카드 추가 완료:", newTemplate);

      return newCardId; // 새 카드 ID 반환
    },
    [setTemplate, template]
  );

  return addCard;
};
