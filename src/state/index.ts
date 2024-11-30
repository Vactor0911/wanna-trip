import { atom } from "jotai";

// LocalStorage에서 상태를 불러옵니다.
const savedLoginState = JSON.parse(localStorage.getItem("loginState") || "{}");

export const loginStateAtom = atom({
  isLoggedIn: savedLoginState.isLoggedIn || false, // 로그인 상태
  email: savedLoginState.email || "", // 로그인된 사용자의 이메일
  loginType: savedLoginState.loginType || "normal", // 로그인 타입 (e.g., normal, kakao, google)
  loginToken: savedLoginState.loginToken || "", // 로그인 토큰
  refreshToken: savedLoginState.refreshToken || "", // 리프레시 토큰
});
