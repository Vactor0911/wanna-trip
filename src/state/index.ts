import { atom } from "jotai";
import {
  CardInterface,
  TemplateInterface,
} from "../utils";

// 백엔드 서버 주소
// export const SERVER_HOST = "https://wanna-trip.vactor0911.dev"; // AXIOS 통신 할 서버 주소
export const SERVER_HOST = "http://localhost:3000"; // AXIOS 통신 할 서버 주소
// 이거 다 .env 파일로 옮겨야함 API 싹다 axiosInstance 로 수정하면 삭제 예정


// 로그인 상태
export enum Permission {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "superadmin",
}

export interface LoginState {
  isLoggedIn: boolean;
  userUuid: string | null; // 로그인된 사용자의 UUID
  email?: string | null; // 로그인된 사용자의 이메일
  loginType: string; // ENUM(normal, kakao, google)
  permission: Permission; // 사용자의 권한 (user, admin, superadmin)
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