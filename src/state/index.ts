import { atom } from "jotai";
import {
  CardInterface,
  TemplateInterface,
} from "../utils";

// 백엔드 서버 주소
export const SERVER_HOST = "https://wanna-trip.vactor0911.dev"; // AXIOS 통신 할 서버 주소

// LocalStorage에서 상태를 불러오기
const savedLoginState = JSON.parse(
  localStorage.getItem("WannaTriploginState") || "{}"
);

export const wannaTripLoginStateAtom = atom({
  isLoggedIn: savedLoginState.isLoggedIn || false, // 로그인 상태
  userId: savedLoginState.userId || -1, // 로그인된 사용자의 ID
  email: savedLoginState.email || "", // 로그인된 사용자의 이메일
  loginType: savedLoginState.loginType || "normal", // 로그인 타입 ; ENUM(normal, kakao, google)
  loginToken: savedLoginState.loginToken || "", // 로그인 토큰
  refreshToken: savedLoginState.refreshToken || "", // 리프레시 토큰
});

// 템플릿 정보
export const templateDataAtom = atom<TemplateInterface>({
  id: -1,
  title: "새 여행 계획",
});

export const boardDataAtom = atom<Array<CardInterface[]>>([[]]);

// 팝업 메뉴 상태
export enum PopupMenuType {
  NONE,
  MOBILE,
  BOARD,
  CARD,
}

interface PopupMenuState {
  isOpen: boolean;
  type: PopupMenuType;
  anchor: HTMLElement | null;
  placement: string;
  board: number | null;
  card: number | null;
}
export const popupMenuStateAtom = atom<PopupMenuState>({
  isOpen: false,
  type: PopupMenuType.NONE,
  anchor: null,
  placement: "bottom-end",
  board: null,
  card: null,
});

// 대화상자 상태
export enum DialogType {
  NONE,
  DELETE_BOARD,
  DELETE_CARD,
  SWAP_BOARD,
  SWAP_CARD,
}
export const dialogStateAtom = atom({
  type: DialogType.NONE,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: null as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  to: null as any,
});