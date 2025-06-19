import { useAtom, useSetAtom } from "jotai";
import {
  CardInterface,
  templateAtom,
  TemplateInterface,
} from "../state/template";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

/**
 * 카드 추가 및 복제 훅
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
        // 위치 정보가 있는 경우에만 포함
        ...(newCard.location && {
          location: {
            title: newCard.location.title,
            address: newCard.location.address || "",
            latitude: newCard.location.latitude,
            longitude: newCard.location.longitude,
            category: newCard.location.category || "",
            thumbnail_url: newCard.location.thumbnailUrl || "",
          },
        }),
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
              updatedCards.splice(index, 0, {
                ...newCard,
                id: newCardId,
              });
            } else {
              updatedCards.push({
                ...newCard,
                id: newCardId,
              });
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

interface MoveCardParams {
  source: { boardId: number; orderIndex: number };
  destination: { boardId: number; orderIndex: number };
  prevTemplate: TemplateInterface;
}

/**
 * 카드 이동 훅
 * @returns 카드 이동 훅
 */
export const useMoveCard = () => {
  const [template, setTemplate] = useAtom(templateAtom);
  const queryClient = useQueryClient();

  const moveCard = useMutation({
    mutationFn: async ({ source, destination }: MoveCardParams) => {
      // 보드가 존재하지 않으면 종료
      if (!source.boardId || !destination.boardId) {
        return null;
      }

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 카드 이동 API 요청
      const response = await axiosInstance.post(
        "/card/move",
        {
          sourceBoardId: source.boardId,
          sourceOrderIndex: source.orderIndex,
          destinationBoardId: destination.boardId,
          destinationOrderIndex: destination.orderIndex,
        },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      // 서버 응답 반환 (새 카드 ID 포함)
      return response.data;
    },
    onSuccess: (data, variables) => {
      // 서버 응답에 newCardId가 있고, 다른 보드로 이동한 경우에만 처리
      if (
        data?.newCardId &&
        variables.source.boardId !== variables.destination.boardId
      ) {
        console.log("카드 이동: 새 카드 ID 업데이트", data.newCardId);

        // 템플릿 상태 복사 (레퍼런스가 아닌 완전한 복사본)
        const currentTemplate = JSON.parse(JSON.stringify(template));

        // 모든 보드의 모든 카드에 대해 시간 객체를 dayjs로 변환
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentTemplate.boards.forEach((board: { cards: any[]; }) => {
          board.cards = board.cards.map((card) => ({
            ...card,
            startTime: dayjs(card.startTime),
            endTime: dayjs(card.endTime),
          }));
        });

        // 이제 대상 보드에서 카드 ID 업데이트
        const destinationBoardIndex = currentTemplate.boards.findIndex(
          (board: { id: number; }) => board.id === variables.destination.boardId
        );

        if (destinationBoardIndex !== -1) {
          const destinationBoard =
            currentTemplate.boards[destinationBoardIndex];

          if (
            destinationBoard.cards.length > variables.destination.orderIndex
          ) {
            // ID만 업데이트 (시간은 이미 위에서 변환됨)
            destinationBoard.cards[variables.destination.orderIndex].id =
              data.newCardId;
          }
        }

        // 업데이트된 완전히 새로운 객체를 직접 전달
        setTemplate(currentTemplate);
      }
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

interface MoveBoardParams {
  templateUuid: string;
  sourceDay: number;
  destinationDay: number;
  prevTemplate: TemplateInterface;
}

/**
 * 보드 이동 훅
 * @returns 보드 이동 훅
 */
export const useMoveBoard = () => {
  const setTemplate = useSetAtom(templateAtom);
  const queryClient = useQueryClient();

  const moveBoard = useMutation({
    mutationFn: async ({
      templateUuid,
      sourceDay,
      destinationDay,
    }: MoveBoardParams) => {
      // 템플릿 UUID가 없으면 종료
      if (!templateUuid) {
        return;
      }

      // 보드가 존재하지 않으면 종료
      if (!sourceDay || !destinationDay) {
        return;
      }

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 보드 이동 API 요청
      await axiosInstance.post(
        "/board/move",
        {
          templateUuid,
          sourceDay,
          destinationDay,
        },
        { headers: { "X-CSRF-Token": csrfToken } }
      );
    },
    onError: (_error, context) => {
      if (context?.prevTemplate) {
        queryClient.setQueryData(["template"], context.prevTemplate);
        setTemplate(context.prevTemplate);
      }
      console.error("보드 이동 실패:", _error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["template"] });
    },
  });

  return moveBoard;
};
