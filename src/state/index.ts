import { atom } from "jotai";
import { TemplateInterface, TemplateModes } from "../utils/template";

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

// 템플릿 상태
export const templateAtom = atom<TemplateInterface>({
  uuid: null,
  title: "MyTemplate",
  boards: [{ cards: [] }],
}); // 보드 상태

export const templateModeAtom = atom(TemplateModes.EDIT); // 템플릿 모드 상태

export const cardEditDialogOpenAtom = atom(false); // 카드 편집 다이얼로그 열림 상태
