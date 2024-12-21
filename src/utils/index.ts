// 색상 테마
export const color = {
  background: "#344056",
  primary: "#47536b",
  primaryLight: "#4d5d77",
  primaryDark: "#2d405e",
  link: "#3575f1",
};

// 템플릿 인터페이스
export interface TemplateProps {
  id: number;
  title: string;
  boards: BoardProps[];
}

// 보드 인터페이스
export interface BoardProps {
  day: number;
  cards?: CardProps[];
}

// 카드 인터페이스
export enum CardType {
  TEXT = 0,
  PLACE = 1,
}

export interface CardProps {
  id: number;
  type: CardType;
  content: string;
  startTime: Date;
  endTime: Date;
  position: {
    board: number;
    top: number;
  }
}