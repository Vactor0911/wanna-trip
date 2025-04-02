import { createTheme } from "@mui/material";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { useSetAtom } from "jotai";
import { LoginState, wannaTripLoginStateAtom } from "../state";
import { setAccessToken } from "./accessToken";

dayjs.extend(minMax);

// MUI 테마
export const theme = createTheme({
  palette: {
    background: {
      default: "#344056",
    },
  },
  typography: {
    fontFamily: ["Noto Sans KR", "sans-serif"].join(","),
    h1: {
      fontSize: "2em",
      fontWeight: "bold",
    },
    h2: {
      fontSize: "1.5em",
      fontWeight: "bold",
    },
    h3: {
      fontSize: "1.17em",
      fontWeight: "bold",
    },
    h4: {
      fontSize: "1em",
      fontWeight: "bold",
    },
    h5: {
      fontSize: "0.83em",
      fontWeight: "bold",
    },
    h6: {
      fontSize: "0.67em",
      fontWeight: "bold",
    },
    subtitle1: {
      fontSize: "1em",
    },
    subtitle2: {
      fontSize: "0.83em",
    },
  },
});

// 색상 테마
export const color = {
  background: "#344056",
  primary: "#47536b",
  primaryLight: "#4d5d77",
  primaryDark: "#2d405e",
  link: "#3575f1",
};

// 시간 문자열을 dayjs 객체로 변환
export const timeStringToDayjs = (time: string): dayjs.Dayjs => {
  if (!time) {
    return dayjs().hour(0).minute(0);
  }
  return dayjs()
    .hour(Number(time.split(":")[0]))
    .minute(Number(time.split(":")[1]));
};

// 템플릿 속성
export interface TemplateInterface {
  id: number;
  title: string;
}

// 카드 속성
export enum CardType {
  TEXT,
  PLACE,
}

export interface CardInterface {
  id: number;
  type: CardType;
  content: string;
  startTime: string;
  endTime: string;
}

// 비밀번호
/**
 * 비밀번호의 길이가 8자 이상인지 확인하는 함수
 * @param password 비밀번호 문자열
 * @returns 비밀번호 길이가 8자 이상인지 여부
 */
export const isPasswordLengthValid = (password: string) => password.length >= 8;

/**
 * 비밀번호 조합이 올바른지 확인하는 함수
 * @param password 비밀번호 문자열
 * @returns 비밀번호에 영문, 숫자, 특수문자가 모두 포함되어 있는지 여부
 */
export const isPasswordCombinationValid = (password: string) =>
  /[a-zA-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[!@#$%^&*?]/.test(password);

/**
 * 모든 상태를 초기화하는 함수
 * @returns
 */
export const useResetStates = () => {
  const setLoginState = useSetAtom(wannaTripLoginStateAtom); // 로그인 상태 설정

  setLoginState({} as LoginState); // 로그인 상태 초기화
  setAccessToken(""); // 토큰 초기화
  sessionStorage.removeItem("WannaTriploginState"); // 세션 스토리지 제거
  localStorage.removeItem("WannaTriploginState"); // 로컬 스토리지 제거

  return {
    setLoginState,
  };
};
