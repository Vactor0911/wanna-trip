import {
  BoardInterface,
  CardInterface,
  TemplateInterface,
} from "../state/template";

export const MAX_BOARDS = 15; // 최대 보드 개수

/**
 * 특정 위치에 보드를 추가하는 함수
 * @param template 템플릿 객체
 * @param newBoard 추가할 보드 객체
 * @param index 추가할 위치
 * @returns 특정 위치에 보드가 추가된 템플릿 객체
 */
export const insertNewBoard = (
  template: TemplateInterface,
  newBoard: BoardInterface,
  index = template.boards.length
): TemplateInterface => {
  // 보드 개수가 최대 개수보다 많으면 중단
  if (template.boards.length >= MAX_BOARDS) {
    return template;
  }

  // index가 유효하지 않으면 중단
  if (index < 0 || index > template.boards.length) {
    return template;
  }

  const newTemplate = {
    ...template,
    boards: [
      ...template.boards.slice(0, index),
      newBoard,
      ...template.boards.slice(index),
    ],
  };
  return newTemplate;
};

/**
 * 특정 날짜, 특정 위치에 카드를 추가하는 함수
 * @param template 템플릿 객체
 * @param day 추가할 보드의 날짜
 * @param newCard 추가할 카드 객체
 * @param index 추가할 위치
 * @returns 특정 날짜에 카드가 추가된 템플릿 객체
 */
export const insertNewCard = (
  template: TemplateInterface,
  day: number,
  newCard: CardInterface,
  index = template.boards[day - 1]?.cards.length
): TemplateInterface => {
  // day가 유효하지 않으면 중단
  if (day < 1 || day > template.boards.length) {
    return template;
  }
  const board = template.boards[day - 1];

  // index가 유효하지 않으면 중단
  if (index < 0 || index > board.cards.length) {
    return template;
  }

  // 새 보드 객체
  const newBoard = {
    ...board,
    cards: [
      ...board.cards.slice(0, index),
      newCard,
      ...board.cards.slice(index),
    ],
  };

  // 새 템플릿 객체
  const newTemplate = {
    ...template,
    boards: [
      ...template.boards.slice(0, day - 1),
      newBoard,
      ...template.boards.slice(day),
    ],
  };

  return newTemplate;
};

/**
 * 보드 내 카드들의 시간 중복 여부를 체크하는 함수
 * @param cards 체크할 카드 배열
 * @returns {hasOverlap: boolean, overlappingCardIds: number[]} 중복 여부와 중복된 카드 ID 배열
 */
export const checkTimeOverlap = (
  cards: CardInterface[]
): {
  hasOverlap: boolean;
  overlappingCardIds: number[];
} => {
  // 시간 중복이 있는 카드들의 ID를 저장할 배열
  const overlappingCardIds: number[] = [];

  // 각 카드에 대해 다른 카드와 시간 중복 여부 확인
  for (let i = 0; i < cards.length; i++) {
    const card1 = cards[i];

    // ID가 없는 카드는 건너뜀
    if (!card1.id) continue;

    const card1Start = card1.startTime;
    const card1End = card1.endTime;

    for (let j = i + 1; j < cards.length; j++) {
      const card2 = cards[j];

      // ID가 없는 카드는 건너뜀
      if (!card2.id) continue;

      const card2Start = card2.startTime;
      const card2End = card2.endTime;

      // 시간 중복 검사:
      // (카드1의 시작이 카드2의 끝보다 이전 && 카드1의 끝이 카드2의 시작보다 이후)
      if (card1Start.isBefore(card2End) && card1End.isAfter(card2Start)) {
        // 중복된 카드 ID 저장 - 잠김 여부에 관계 없이 모든 카드 추가
        if (!overlappingCardIds.includes(card1.id)) {
          overlappingCardIds.push(card1.id);
        }
        if (!overlappingCardIds.includes(card2.id)) {
          overlappingCardIds.push(card2.id);
        }
      }
    }
  }

  return {
    hasOverlap: overlappingCardIds.length > 0,
    overlappingCardIds,
  };
};

/**
 * 템플릿 내 모든 보드의 시간 중복 여부를 체크하는 함수
 * @param template 템플릿 객체
 * @returns {boardOverlaps: {boardId: number, hasOverlap: boolean, overlappingCardIds: number[]}[]} 각 보드별 중복 정보
 */
export const checkTemplateTimeOverlaps = (
  template: TemplateInterface
): {
  boardOverlaps: {
    boardId: number;
    hasOverlap: boolean;
    overlappingCardIds: number[];
  }[];
} => {
  const boardOverlaps = template.boards
    // 1. id가 없는 보드는 제외
    .filter((board) => board.id !== undefined)
    .map((board) => {
      const overlapInfo = checkTimeOverlap(board.cards);
      return {
        boardId: board.id as number, // TypeScript에 id가 반드시 있음을 알림
        hasOverlap: overlapInfo.hasOverlap,
        overlappingCardIds: overlapInfo.overlappingCardIds,
      };
    });

  return { boardOverlaps };
};
