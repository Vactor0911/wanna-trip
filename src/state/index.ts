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

// 인증 초기화 완료 상태를 추적하는 atom
export const isAuthInitializedAtom = atom(false); // 초기화 완료 상태

// 활성 사용자 목록
export interface ActiveUser {
  userUuid: string;
  userName: string;
  profileImage: string;
}
export const activeUsersAtom = atom<ActiveUser[]>([]);