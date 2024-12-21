import { atom } from "jotai";
import { TemplateProps } from "../utils/theme";

// 백엔드 서버 주소
export const SERVER_HOST = 'https://wanna-trip.vactor0911.dev'; // AXIOS 통신 할 서버 주소

// LocalStorage에서 상태를 불러오기
const savedLoginState = JSON.parse(localStorage.getItem("WannaTriploginState") || "{}");

export const wannaTripLoginStateAtom = atom({
  isLoggedIn: savedLoginState.isLoggedIn || false, // 로그인 상태
  email: savedLoginState.email || "", // 로그인된 사용자의 이메일
  loginType: savedLoginState.loginType || "normal", // 로그인 타입 ; ENUM(normal, kakao, google)
  loginToken: savedLoginState.loginToken || "", // 로그인 토큰
  refreshToken: savedLoginState.refreshToken || "", // 리프레시 토큰
});

// 템플릿 정보 불러오기
export const templateDataAtom = atom(null as TemplateProps | null);