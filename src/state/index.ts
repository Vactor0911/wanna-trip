import { atom } from "jotai";

// 서버 주소와 포트 번호를 설정합니다.
export const SERVER_HOST = 'http://localhost:3005'; // AXIOS 통신 할 서버 주소 http://localhost:3005


// LocalStorage에서 상태를 불러옵니다.
const savedLoginState = JSON.parse(localStorage.getItem("loginState") || "{}");

export const WannaTripLoginStateAtom = atom({
  isLoggedIn: savedLoginState.isLoggedIn || false, // 로그인 상태
  email: savedLoginState.email || "", // 로그인된 사용자의 이메일
  loginType: savedLoginState.loginType || "normal", // 로그인 타입 ; ENUM(normal, kakao, google)
  loginToken: savedLoginState.loginToken || "", // 로그인 토큰
  refreshToken: savedLoginState.refreshToken || "", // 리프레시 토큰
});
