import { useAtom, useSetAtom } from "jotai";
import {
  boardOrderAtom,
  boardsMapAtom,
  LocationInterface,
  templateAtom,
  templateInfoAtom,
  TemplateInterface,
} from "../state/template";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";

/**
 * 템플릿 관련 훅
 */
export const useTemplate = () => {
  const setTemplateInfo = useSetAtom(templateInfoAtom);

  // 템플릿 정보 수정
  const updateTemplate = useCallback(
    (title: string) => {
      setTemplateInfo((prev) => ({
        ...prev,
        title,
      }));
    },
    [setTemplateInfo]
  );

  return { updateTemplate };
};

export const useBoard = () => {
  const setBoardsMap = useSetAtom(boardsMapAtom);
  const setBoardOrder = useSetAtom(boardOrderAtom);

  // 보드 추가
  const addBoard = useCallback(
    (boardUuid: string, dayNumber: number) => {
      // dayNumber 재정렬
      setBoardsMap((prev) => {
        const newMap = new Map(prev);
        newMap.forEach((board, key) => {
          if (board.dayNumber >= dayNumber) {
            newMap.set(key, {
              ...board,
              dayNumber: board.dayNumber + 1,
            });
          }
        });
        return newMap;
      });

      // 보드 맵 업데이트
      setBoardsMap((prev) => {
        const newMap = new Map(prev);

        newMap.set(boardUuid, {
          uuid: boardUuid,
          dayNumber: dayNumber || 1,
          cards: [],
        });
        return newMap;
      });

      // 보드 순서 업데이트
      setBoardOrder((prev) => {
        if (prev.includes(boardUuid)) return prev;

        // dayNumber를 기준으로 삽입 위치 찾기
        const insertIndex = dayNumber - 1;
        const newOrder = [...prev];

        // 배열 크기를 초과하면 끝에 추가
        if (insertIndex >= newOrder.length) {
          return [...newOrder, boardUuid];
        }

        // 중간에 삽입
        newOrder.splice(insertIndex, 0, boardUuid);
        return newOrder;
      });
    },
    [setBoardsMap, setBoardOrder]
  );

  return { addBoard };
};

/**
 * 카드 추가 및 복제 훅
 * @param newCard 새로운 카드 데이터
 * @param boardId 카드가 추가될 보드 Id
 * @param index 카드가 추가될 위치 (선택적)
 * @returns 보드Id의 index 위치에 새로운 카드를 추가
 */
export const useAddCard = () => {
  const addCard = useCallback(
    async (
      boardUuid: string,
      startTime: Dayjs,
      orderIndex?: number,
      location?: LocationInterface
    ) => {
      // 보드가 존재하지 않으면 종료
      if (!boardUuid) return;

      // 카드 데이터 처리
      const cardData = {
        boardUuid,
        startTime: startTime.format("HH:mm:ss"),
        orderIndex,
        ...location,
      };

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 카드 추가 API 요청
      const response = await axiosInstance.post(`/card`, cardData, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      // 오류 처리
      if (!response.data.success) {
        throw new Error("카드 추가에 실패했습니다.");
      }

      // 카드 추가 성공
      const newCardUuid = response.data.cardUuid;
      return newCardUuid; // 새 카드 UUID 반환
    },
    []
  );

  return addCard;
};

/**
 * 카드 복제 훅
 * @param cardUuid 복제할 카드 UUID
 */
export const useCopyCard = () => {
  const copyCard = useCallback(async (cardUuid: string) => {
    // 카드 UUID가 없으면 종료
    if (!cardUuid) {
      return;
    }

    // CSRF 토큰 가져오기
    const csrfToken = await getCsrfToken();

    // 카드 복제 API 요청
    const response = await axiosInstance.post(
      `/card/copy/${cardUuid}`,
      {},
      { headers: { "X-CSRF-Token": csrfToken } }
    );

    // 오류 처리
    if (!response.data.success) {
      throw new Error("카드 복제에 실패했습니다.");
    }
  }, []);

  return copyCard;
};

interface MoveCardParams {
  cardUuid: string;
  boardUuid: string;
  orderIndex: number;
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
    mutationFn: async ({ cardUuid, boardUuid, orderIndex }: MoveCardParams) => {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 카드 이동 API 요청
      const response = await axiosInstance.post(
        "/card/move",
        {
          cardUuid,
          boardUuid,
          orderIndex,
        },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      // 서버 응답 반환 (새 카드 ID 포함)
      return response.data;
    },
    onSuccess: (data, variables) => {
      // 서버 응답에 newCardId가 있고, 다른 보드로 이동한 경우에만 처리
      if (data?.newCardId && template) {
        // 템플릿 상태 복사 (레퍼런스가 아닌 완전한 복사본)
        const currentTemplate = JSON.parse(JSON.stringify(template));

        // 모든 보드의 모든 카드에 대해 시간 객체를 dayjs로 변환
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentTemplate.boards.forEach((board: { cards: any[] }) => {
          board.cards = board.cards.map((card) => ({
            ...card,
            startTime: dayjs(card.startTime),
            endTime: dayjs(card.endTime),
          }));
        });

        // 이제 대상 보드에서 카드 ID 업데이트
        const destinationBoardIndex = currentTemplate.boards.findIndex(
          (board: { uuid: string }) => board.uuid === variables.boardUuid
        );

        if (destinationBoardIndex !== -1) {
          const destinationBoard =
            currentTemplate.boards[destinationBoardIndex];

          if (destinationBoard.cards.length > variables.orderIndex) {
            // ID만 업데이트 (시간은 이미 위에서 변환됨)
            destinationBoard.cards[variables.orderIndex].id = data.newCardId;
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
  boardUuid: string;
  dayNumber: number;
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
      boardUuid,
      dayNumber,
    }: MoveBoardParams) => {
      // 템플릿 UUID가 없으면 종료
      if (!templateUuid) {
        return;
      }

      // 보드가 존재하지 않으면 종료
      if (!boardUuid || !dayNumber) {
        return;
      }

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 보드 이동 API 요청
      await axiosInstance.post(
        "/board/move",
        {
          templateUuid,
          boardUuid,
          dayNumber,
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
