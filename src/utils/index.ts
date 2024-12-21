// 색상 테마
export const color = {
  background: "#344056",
  primary: "#47536b",
  primaryLight: "#4d5d77",
  primaryDark: "#2d405e",
  link: "#3575f1",
};

// 템플릿 클래스
export class Template {
  private id: number;
  private title: string;
  private boards: Board[];

  constructor(
    id: number,
    title: string = "새 여행 계획",
    boards: Board[] = []
  ) {
    this.id = id;
    this.title = title;
    this.boards = boards;
  }

  // Getter
  public getId(): number {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getBoards(): Board[] {
    return this.boards;
  }

  // Setter
  public setTitle(title: string): void {
    this.title = title;
  }

  public setBoards(boards: Board[]): void {
    this.boards = boards;
  }
}

// 보드 클래스
export class Board {
  private day: number;
  private cards: Card[] = [];

  constructor(day: number, cards: Card[] = []) {
    this.day = day;
    this.cards = cards;
  }

  // Getter
  public getDay(): number {
    return this.day;
  }

  public getCards(): Card[] {
    return this.cards;
  }

  // Setter
  public setDay(day: number): void {
    this.day = day;
  }

  public setCards(cards: Card[]): void {
    this.cards = cards;
  }
}

// 카드 클래스
export enum CardType {
  TEXT = 0,
  PLACE = 1,
}

export class Card {
  id: number;
  type: CardType;
  content: string;
  startTime: Date;
  endTime: Date;
  position: {
    board: number;
    top: number;
  };

  constructor(
    id: number,
    type: CardType = CardType.TEXT,
    content: string = "새 계획",
    startTime: Date,
    endTime: Date,
    position: { board: number; top: number }
  ) {
    this.id = id;
    this.type = type;
    this.content = content;
    this.startTime = startTime;
    this.endTime = endTime;
    this.position = position;
  }

  // Getter
  public getId(): number {
    return this.id;
  }

  public getType(): CardType {
    return this.type;
  }

  public getContent(): string {
    return this.content;
  }

  public getStartTime(): Date {
    return this.startTime;
  }

  public getEndTime(): Date {
    return this.endTime;
  }

  public getPosition(): { board: number; top: number } {
    return this.position;
  }

  // Setter
  public setType(type: CardType): void {
    this.type = type;
  }

  public setContent(content: string): void {
    this.content = content;
  }

  public setStartTime(startTime: Date): void {
    this.startTime = startTime;
  }

  public setEndTime(endTime: Date): void {
    this.endTime = endTime;
  }

  public setPosition(board: number, top: number): void {
    this.position = { board, top };
  }
}
