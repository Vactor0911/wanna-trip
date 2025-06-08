import dayjs from "dayjs";
import { atom } from "jotai";

// 템플릿 모드 Enum
export enum TemplateModes {
  EDIT = "편집 모드",
  VIEW = "열람 모드",
}

// 템플릿 데이터 인터페이스
export interface TemplateInterface {
  uuid: string | null; // 템플릿 UUID
  title: string; // 템플릿 이름
  boards: BoardInterface[]; // 보드 목록
}

// 보드 데이터 인터페이스
export interface BoardInterface {
  cards: CardInterface[]; // 카드 목록
}

// 카드 종류 Enum
export enum CardTypes {
  TEXT, // 텍스트
  PLACE, // 장소
}

// 카드 데이터 인터페이스
export interface CardInterface {
  uuid: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  content: string;
  isLocked: boolean;
}

// 템플릿 상태
export const templateAtom = atom<TemplateInterface>({
  uuid: null,
  title: "MyTemplate",
  boards: [{ cards: [] }],
}); // 보드 상태

export const templateModeAtom = atom(TemplateModes.EDIT); // 템플릿 모드 상태

export const cardEditDialogOpenAtom = atom(false); // 카드 편집 다이얼로그 열림 상태

export const selectedCardAtom = atom<CardInterface | null>(null); // 선택된 카드 상태

export const cardDataAtom = atom<CardInterface[] | null>(null); // 카드 데이터 상태
