import { atom } from "jotai";

// 알림 상태 export
export * from "./notification";

// 다크모드 상태
export type ThemeMode = "light" | "dark";

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

// 인증 초기화 완료 상태를 추적하는 atom
export const isAuthInitializedAtom = atom(false); // 초기화 완료 상태

// 활성 사용자 목록
export interface ActiveUser {
  userUuid: string;
  userName: string;
  profileImage: string;
  color: string; // 사용자별 고유 색상
}
export const activeUsersAtom = atom<ActiveUser[]>([]);

// 동시 작업 사용자를 위한 색상 팔레트 (구분하기 쉬운 색상들)
export const USER_COLORS = [
  "#e91e63", // 핑크
  "#9c27b0", // 보라
  "#673ab7", // 짙은 보라
  "#3f51b5", // 인디고
  "#2196f3", // 파랑
  "#00bcd4", // 시안
  "#009688", // 틸
  "#4caf50", // 초록
  "#ff9800", // 주황
  "#ff5722", // 딥 오렌지
];