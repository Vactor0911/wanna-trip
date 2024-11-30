import { atom } from "jotai";

export const loginStateAtom = atom({
    isLoggedIn: false, // 로그인 상태
    email: "", // 로그인된 사용자의 이메일
    loginType: "normal", // 로그인 타입 (e.g., normal, kakao, gmail)
    loginToken: "", // 로그인 토큰
    refreshToken: "", // 리프레시 토큰
});