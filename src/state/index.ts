import { atom } from "jotai";

export const loginStateAtom = atom({
    isLoggedIn: false, // 로그인 상태
    email: "", // 로그인된 사용자의 이메일
    loginType: "null", // 로그인 타입 (e.g., null, kakao, naver, gmail)
});