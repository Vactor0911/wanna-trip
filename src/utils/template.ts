import { BoardInterface, CardInterface, TemplateInterface } from "../state/template";

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
  console.log("board", board);

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
  console.log("newBoard", newBoard);

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
