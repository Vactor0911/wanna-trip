import { Dayjs } from "dayjs";
import { atom } from "jotai";

// 로그인 상태
export enum Permission {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "superadmin",
}

export interface LoginState {
  isLoggedIn: boolean;
  userUuid: string | null; // 로그인된 사용자의 UUID
  loginType: string; // ENUM(normal, kakao, google)
  permission: Permission; // 사용자의 권한 (user, admin, superadmin)
  email?: string | null; // 로그인된 사용자의 이메일
  userName?: string;
}

// LocalStorage에서 상태를 불러오기
const savedLoginState = JSON.parse(
  localStorage.getItem("WannaTriploginState") || "{}"
);

export const wannaTripLoginStateAtom = atom({
  isLoggedIn: savedLoginState.isLoggedIn || false, // 로그인 상태
  userUuid: savedLoginState.userUuid || "", // 로그인된 사용자의 UUID
  userName: savedLoginState.userName || "", // 로그인된 사용자의 이름
  loginType: savedLoginState.loginType || "normal", // 로그인 타입 ; ENUM(normal, kakao, google)
} as LoginState);

export const kakaoLoginStateAtom = atom(""); // 카카오 로그인 code 상태

// 카드 종류 Enum
export enum CardTypes {
  TEXT, // 텍스트
  PLACE, // 장소
}

// 카드 객체 인터페이스
export interface CardInterface {
  uuid: string; // 카드 UUID
  type: CardTypes; // 카드 종류
  startTime: Dayjs; // 카드 시작 시간
  endTime: Dayjs; // 카드 종료 시간
}

// 보드 객체 인터페이스
export interface BoardInterface {
  day: number; // 보드 날짜
  cards: CardInterface[]; // 카드 목록
}

// 템플릿 객체 인터페이스
export interface TemplateInterface {
  uuid: string | null; // 템플릿 UUID
  name: string; // 템플릿 이름
  boards: BoardInterface[]; // 보드 목록
}

// 템플릿 상태
export const templateAtom = atom<TemplateInterface>({
  uuid: null,
  name: "MyTemplate",
  boards: [
    {
      day: 1,
      cards: [],
    },
  ],
}); // 보드 상태
