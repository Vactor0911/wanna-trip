import { Dayjs } from "dayjs";
import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

// 모드 Enum
export enum TemplateModes {
  EDIT = "편집 모드",
  VIEW = "열람 모드",
}

// 템플릿 객체 인터페이스
export interface TemplateInterface {
  uuid: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  boards: BoardInterface[];
}

// 보드 객체 인터페이스
export interface BoardInterface {
  uuid: string;
  dayNumber: number;
  cards: CardInterface[];
}

// 카드 객체 인터페이스
export interface CardInterface {
  uuid: string;
  content: string;
  startTime: Dayjs;
  endTime: Dayjs;
  orderIndex?: number;
  locked: boolean;
  location?: LocationInterface | null;
}

// 위치 정보 인터페이스
export interface LocationInterface {
  title: string; // 장소명 (예: "서울특별시청")
  address?: string; // 주소
  latitude?: number; // 위도 (예: "375704149")
  longitude?: number; // 경도 (예: "1269796830")
  category?: string; // 카테고리 (예: "음식점 > 한식")
  description?: string; // 설명
  telephone?: string; // 전화번호
  link?: string; // 링크
  thumbnailUrl?: string; // 썸네일 URL
}

// 템플릿 기본 정보 (보드 배열 제외)
export interface TemplateInfoInterface {
  uuid: string;
  title: string;
}

// 템플릿 기본 정보만 가진 atom
export const templateInfoAtom = atom<TemplateInfoInterface>({
  uuid: "",
  title: "MyTemplate",
});

// 보드 ID 배열을 저장하는 atom (순서 유지 목적)
export const boardOrderAtom = atom<string[]>([]);

// 특정 보드 ID에 해당하는 보드 데이터를 관리하는 atomFamily
export const boardAtomFamily = atomFamily((boardUuid: string) =>
  atom<BoardInterface>({
    uuid: boardUuid,
    dayNumber: 1,
    cards: [],
  })
);

// 보드 맵 객체 - 모든 보드를 포함
export const boardsMapAtom = atom<Map<string, BoardInterface>>(new Map());

// 기존 templateAtom 유지 (이전 코드와의 호환성을 위해)
export const templateAtom = atom(
  // getter
  (get) => {
    const templateInfo = get(templateInfoAtom);
    const boardOrder = get(boardOrderAtom);
    const boardsMap = get(boardsMapAtom);

    const boards = boardOrder.map((boardUuid) =>
      boardsMap.has(boardUuid)
        ? boardsMap.get(boardUuid)!
        : { uuid: boardUuid, dayNumber: 1, cards: [] }
    );

    return {
      ...templateInfo,
      boards,
    };
  },
  // setter
  (_get, set, newTemplate: TemplateInterface) => {
    set(templateInfoAtom, {
      uuid: newTemplate.uuid,
      title: newTemplate.title,
    });

    const newBoardsMap = new Map<string, BoardInterface>();
    const newBoardOrder: string[] = [];

    newTemplate.boards?.forEach((board) => {
      if (board.uuid) {
        newBoardsMap.set(board.uuid, board);
        newBoardOrder.push(board.uuid);
      }
    });

    set(boardsMapAtom, newBoardsMap);
    set(boardOrderAtom, newBoardOrder);
  }
);

export const templateModeAtom = atom(TemplateModes.EDIT); // 템플릿 모드 상태

export const cardEditDialogOpenAtom = atom(false); // 카드 편집 다이얼로그 열림 상태

// 현재 편집 중인 카드 정보
export const currentEditCardAtom = atom({
  cardUuid: null as string | null | undefined,
  boardUuid: null as string | null | undefined,
  orderIndex: 1,
});

// 카드 추가/수정 atom
export const updateBoardCardAtom = atom(
  null,
  (
    get,
    set,
    update: { boardUuid: string; card: CardInterface; isNew: boolean }
  ) => {
    const { boardUuid, card, isNew } = update;
    const template = get(templateAtom);

    // 해당 보드 찾기
    const boardIndex = template.boards.findIndex(
      (board) => board.uuid === boardUuid
    );
    if (boardIndex === -1) return;

    const currentBoard = template.boards[boardIndex] as BoardInterface;

    // 템플릿 복사 (불변성 유지)
    const newTemplate = { ...template };
    // 보드 배열 복사
    newTemplate.boards = [...template.boards];

    // 특정 보드 복사
    newTemplate.boards[boardIndex] = {
      ...currentBoard,
      // 카드 배열도 복사 (불변성 유지)
      cards: [...(currentBoard.cards || [])],
    } as BoardInterface;

    if (isNew) {
      // 새 카드 추가
      newTemplate.boards[boardIndex].cards?.push(card);
    } else {
      // 기존 카드 수정
      const cardIndex = newTemplate.boards[boardIndex].cards!.findIndex(
        (c) => c.uuid === card.uuid
      );

      if (cardIndex !== -1) {
        newTemplate.boards[boardIndex].cards![cardIndex] = card;
      }
    }

    // 템플릿 상태 업데이트
    set(templateAtom, newTemplate as TemplateInterface);
  }
);

// 보드에서 카드 삭제하는 atom
export const deleteBoardCardAtom = atom(
  null,
  (
    get,
    set,
    { boardUuid, cardUuid }: { boardUuid: string; cardUuid: string }
  ) => {
    const template = get(templateAtom);

    // 해당 보드 찾기
    const boardIndex = template.boards.findIndex(
      (board) => board.uuid === boardUuid
    );
    if (boardIndex === -1) return;

    // 템플릿 복사 (불변성 유지)
    const newTemplate = { ...template };
    // 보드 배열 복사
    newTemplate.boards = [
      ...(template.boards as BoardInterface[]),
    ] as BoardInterface[];

    // 특정 보드 복사
    newTemplate.boards[boardIndex] = {
      ...template.boards[boardIndex],
      // 해당 카드를 제외한 카드 배열 생성
      cards: (template.boards[boardIndex].cards || []).filter(
        (card) => card.uuid !== cardUuid
      ),
    } as BoardInterface;

    // 템플릿 상태 업데이트
    set(templateAtom, newTemplate as TemplateInterface);
  }
);

// 템플릿의 모든 보드 카드 정렬하는 함수
export const reorderBoardCardsAtom = atom(null, (get, set) => {
  const template = get(templateAtom);

  // 템플릿 복사 (불변성 유지)
  const newTemplate = { ...template };
  newTemplate.boards = [...template.boards];

  // 모든 보드의 카드 순서 정렬
  newTemplate.boards = newTemplate.boards.map(
    (board): BoardInterface => ({
      ...(board as BoardInterface),
      cards: [...(board.cards || [])].sort(
        (a, b) => (a.orderIndex || 1) - (b.orderIndex || 1)
      ),
    })
  );

  // 템플릿 상태 업데이트
  set(templateAtom, newTemplate as TemplateInterface);
});
