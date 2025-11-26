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

  // 보드 복제
  const copyBoard = useCallback(
    (boardUuid: string, newBoardUuid: string) => {
      // dayNumber 재정렬 및 보드 복사
      setBoardsMap((prev) => {
        const newMap = new Map(prev);
        const boardToCopy = newMap.get(boardUuid);

        if (boardToCopy) {
          newMap.set(newBoardUuid, {
            ...boardToCopy,
            uuid: newBoardUuid,
            dayNumber: boardToCopy.dayNumber + 1,
          });

          // 복사된 보드 이후의 보드들의 dayNumber 증가
          newMap.forEach((board, key) => {
            if (
              key !== newBoardUuid &&
              board.dayNumber > boardToCopy.dayNumber
            ) {
              newMap.set(key, {
                ...board,
                dayNumber: board.dayNumber + 1,
              });
            }
          });
        }
        return newMap;
      });

      // 보드 순서 업데이트
      setBoardOrder((prev) => {
        const targetIndex = prev.indexOf(boardUuid);
        if (targetIndex === -1) return [...prev, newBoardUuid];

        const newOrder = [...prev];
        newOrder.splice(targetIndex + 1, 0, newBoardUuid);
        return newOrder;
      });
    },
    [setBoardOrder, setBoardsMap]
  );

  // 보드 삭제
  const deleteBoard = useCallback(
    (boardUuid: string) => {
      setBoardsMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(boardUuid);
        return newMap;
      });

      setBoardOrder((prev) => prev.filter((uuid) => uuid !== boardUuid));
    },
    [setBoardsMap, setBoardOrder]
  );

  return { addBoard, copyBoard, deleteBoard };
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
  emitFetch: () => void;
}

/**
 * 카드 이동 훅
 * @returns 카드 이동 훅
 */
export const useMoveCard = () => {
  const [template, setTemplate] = useAtom(templateAtom);
  const queryClient = useQueryClient();

  const moveCard = useMutation({
    mutationFn: async ({
      cardUuid,
      boardUuid,
      orderIndex,
      emitFetch,
    }: MoveCardParams) => {
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

      emitFetch();

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
  emitFetch: () => void;
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
      emitFetch,
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

      emitFetch();
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

/**
 * 템플릿 복사 훅 (다른 사람의 공개 템플릿을 내 템플릿으로 복사)
 */
export const useCopyTemplateToMine = () => {
  const queryClient = useQueryClient();

  const copyTemplate = useMutation({
    mutationFn: async ({
      sourceTemplateUuid,
      title,
    }: {
      sourceTemplateUuid: string;
      title?: string;
    }) => {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 템플릿 복사 API 요청
      const response = await axiosInstance.post(
        `/template/copy/${sourceTemplateUuid}`,
        { title },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (!response.data.success) {
        throw new Error("템플릿 복사에 실패했습니다.");
      }

      return response.data.templateUuid;
    },
    onSuccess: () => {
      // 내 템플릿 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  return copyTemplate;
};

/**
 * 보드 복사 훅 (다른 사람의 공개 템플릿의 보드를 내 템플릿으로 복사)
 */
export const useCopyBoardToTemplate = () => {
  const queryClient = useQueryClient();

  const copyBoard = useMutation({
    mutationFn: async ({
      sourceBoardUuid,
      targetTemplateUuid,
    }: {
      sourceBoardUuid: string;
      targetTemplateUuid: string;
    }) => {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 보드 복사 API 요청
      const response = await axiosInstance.post(
        `/template/board/copy/${sourceBoardUuid}`,
        { targetTemplateUuid },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (!response.data.success) {
        throw new Error("보드 복사에 실패했습니다.");
      }

      return response.data.boardUuid;
    },
    onSuccess: () => {
      // 템플릿 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template"] });
    },
  });

  return copyBoard;
};

/**
 * 카드 복사 훅 (다른 사람의 공개 템플릿의 카드를 내 보드로 복사)
 */
export const useCopyCardToBoard = () => {
  const queryClient = useQueryClient();

  const copyCard = useMutation({
    mutationFn: async ({
      sourceCardUuid,
      targetBoardUuid,
    }: {
      sourceCardUuid: string;
      targetBoardUuid: string;
    }) => {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 카드 복사 API 요청
      const response = await axiosInstance.post(
        `/template/card/copy/${sourceCardUuid}`,
        { targetBoardUuid },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (!response.data.success) {
        throw new Error("카드 복사에 실패했습니다.");
      }

      return response.data.cardId;
    },
    onSuccess: () => {
      // 템플릿 갱신
      queryClient.invalidateQueries({ queryKey: ["template"] });
    },
  });

  return copyCard;
};

/**
 * 인기 공개 템플릿 조회 훅
 */
export const usePopularPublicTemplates = () => {
  const fetchPopularTemplates = useCallback(async (limit: number = 5) => {
    const response = await axiosInstance.get(
      `/template/popular/public?limit=${limit}`
    );

    if (!response.data.success) {
      throw new Error("인기 템플릿 조회에 실패했습니다.");
    }

    return response.data.popularTemplates;
  }, []);

  return { fetchPopularTemplates };
};

/**
 * 공개 템플릿 조회 훅 (비로그인 사용자용)
 */
export const usePublicTemplate = () => {
  const fetchPublicTemplate = useCallback(async (templateUuid: string) => {
    const response = await axiosInstance.get(
      `/template/public/${templateUuid}`
    );

    if (!response.data.success) {
      throw new Error("공개 템플릿 조회에 실패했습니다.");
    }

    return response.data.template;
  }, []);

  return { fetchPublicTemplate };
};
