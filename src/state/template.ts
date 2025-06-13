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
  uuid: string | null; // 템플릿 UUID
  title: string; // 템플릿 이름
  boards: BoardInterface[]; // 보드 목록
  template_id?: string; // 이 줄을 추가
}

// 보드 객체 인터페이스
export interface BoardInterface {
  id?: string; // board_id
  dayNumber?: number; // 날짜 번호
  cards: CardInterface[]; // 카드 목록
}

// 카드 종류 Enum
export enum CardTypes {
  TEXT, // 텍스트
  PLACE, // 장소
}

// 카드 객체 인터페이스
export interface CardInterface {
  id?: string; // card_id
  content: string; // 카드 내용
  startTime: Dayjs; // 카드 시작 시간
  endTime: Dayjs; // 카드 종료 시간
  isLocked: boolean; // 카드 잠금 여부
  orderIndex?: number; // 카드 순서 인덱스 (보드 내에서의 위치)
  // location?: string; // 장소 정보 (옵션)
}

// 템플릿 기본 정보 (보드 배열 제외)
export interface TemplateInfoInterface {
  uuid: string | null;
  title: string;
}

// 템플릿 기본 정보만 가진 atom
export const templateInfoAtom = atom<TemplateInfoInterface>({
  uuid: null,
  title: "MyTemplate",
});

// 보드 ID 배열을 저장하는 atom (순서 유지 목적)
export const boardOrderAtom = atom<string[]>([]);

// 특정 보드 ID에 해당하는 보드 데이터를 관리하는 atomFamily
export const boardAtomFamily = atomFamily((boardId: string) =>
  atom<BoardInterface>({
    id: boardId,
    dayNumber: 1,
    cards: [],
  })
);

// 보드 맵 객체 - 모든 보드를 포함
export const boardsMapAtom = atom<Map<string, BoardInterface>>(new Map());

// 기존 templateAtom 유지 (이전 코드와의 호환성을 위해)
export const templateAtom = atom(
  // getter - 개별 atom들을 조합해 템플릿 객체 생성
  (get) => {
    const templateInfo = get(templateInfoAtom);
    const boardOrder = get(boardOrderAtom);
    const boardsMap = get(boardsMapAtom);

    const boards = boardOrder.map((boardId) =>
      boardsMap.has(boardId)
        ? boardsMap.get(boardId)!
        : { id: boardId, cards: [] }
    );

    return {
      ...templateInfo,
      boards,
    };
  },
  // setter - 템플릿 객체를 받아 개별 atom들 업데이트
  (get, set, newTemplate: TemplateInterface) => {
    // 템플릿 기본 정보 업데이트
    set(templateInfoAtom, {
      uuid: newTemplate.uuid,
      title: newTemplate.title,
    });

    const newBoardsMap = new Map<string, BoardInterface>();
    const newBoardOrder: string[] = [];

    // 각 보드 처리
    newTemplate.boards.forEach((board) => {
      if (board.id) {
        newBoardsMap.set(board.id, board);
        newBoardOrder.push(board.id);
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
  cardId: null as string | null | undefined,
  boardId: null as string | null | undefined,
  orderIndex: 0,
});

// 카드 추가/수정 atom
export const updateBoardCardAtom = atom(
  null,
  (
    get,
    set,
    update: { boardId: string; card: CardInterface; isNew: boolean }
  ) => {
    const { boardId, card, isNew } = update;
    const template = get(templateAtom);

    // 해당 보드 찾기
    const boardIndex = template.boards.findIndex(
      (board) => board.id === boardId
    );
    if (boardIndex === -1) return;

    // 템플릿 복사 (불변성 유지)
    const newTemplate = { ...template };
    // 보드 배열 복사
    newTemplate.boards = [...template.boards];

    // 특정 보드 복사
    newTemplate.boards[boardIndex] = {
      ...template.boards[boardIndex],
      // 카드 배열도 복사 (불변성 유지)
      cards: [...template.boards[boardIndex].cards],
    };

    if (isNew) {
      // 새 카드 추가
      newTemplate.boards[boardIndex].cards.push(card);
    } else {
      // 기존 카드 수정
      const cardIndex = newTemplate.boards[boardIndex].cards.findIndex(
        (c) => c.id === card.id
      );

      if (cardIndex !== -1) {
        newTemplate.boards[boardIndex].cards[cardIndex] = card;
      }
    }

    // 템플릿 상태 업데이트
    set(templateAtom, newTemplate);

    // 변경 로그 출력 (디버깅용)
    console.log("카드 상태 업데이트 완료:", {
      boardId,
      cardId: card.id,
      isNew,
      newTemplate,
    });
  }
);

// 보드에서 카드 삭제하는 atom
export const deleteBoardCardAtom = atom(
  null,
  (get, set, { boardId, cardId }: { boardId: string; cardId: string }) => {
    const template = get(templateAtom);

    // 해당 보드 찾기
    const boardIndex = template.boards.findIndex(
      (board) => board.id === boardId
    );
    if (boardIndex === -1) return;

    // 템플릿 복사 (불변성 유지)
    const newTemplate = { ...template };
    // 보드 배열 복사
    newTemplate.boards = [...template.boards];

    // 특정 보드 복사
    newTemplate.boards[boardIndex] = {
      ...template.boards[boardIndex],
      // 해당 카드를 제외한 카드 배열 생성
      cards: template.boards[boardIndex].cards.filter(
        (card) => card.id !== cardId
      ),
    };

    // 템플릿 상태 업데이트
    set(templateAtom, newTemplate);

    // 변경 로그 출력 (디버깅용)
    console.log("카드 삭제 완료:", {
      boardId,
      cardId,
      newTemplate,
    });
  }
);

// 템플릿의 모든 보드 카드 정렬하는 함수
export const reorderBoardCardsAtom = atom(null, (get, set) => {
  const template = get(templateAtom);

  // 템플릿 복사 (불변성 유지)
  const newTemplate = { ...template };
  newTemplate.boards = [...template.boards];

  // 모든 보드의 카드 순서 정렬
  newTemplate.boards = newTemplate.boards.map((board) => ({
    ...board,
    cards: [...board.cards].sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    ),
  }));

  // 템플릿 상태 업데이트
  set(templateAtom, newTemplate);

  console.log("모든 보드의 카드 순서 정렬 완료");
});
