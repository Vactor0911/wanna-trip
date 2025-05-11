import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { useSetAtom } from "jotai";
import { LoginState, wannaTripLoginStateAtom } from "../state";
import { setAccessToken } from "./accessToken";

dayjs.extend(minMax);

/**
 * 시간 문자열을 dayjs 객체로 변환하는 함수
 * @param time 시간 문자열 (형식: "HH:mm")
 * @returns dayjs 객체
 */
export const timeStringToDayjs = (time: string): dayjs.Dayjs => {
  if (!time) {
    return dayjs().hour(0).minute(0);
  }
  return dayjs()
    .hour(Number(time.split(":")[0]))
    .minute(Number(time.split(":")[1]));
};

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

// 일반 함수 버전의 resetStates 추가 (useCallback 내에서 사용 가능)
export const resetStates = (setLoginState: (state: LoginState) => void) => {
  setLoginState({} as LoginState); // 로그인 상태 초기화
  setAccessToken(""); // 토큰 초기화
  sessionStorage.removeItem("WannaTriploginState"); // 세션 스토리지 제거
  localStorage.removeItem("WannaTriploginState"); // 로컬 스토리지 제거
};

/**
 * 이메일 형식이 올바른지 확인하는 함수
 * @param email 이메일 주소
 * @returns 이메일 형식이 올바른지 여부
 */
export const isEmailValid = (email: string) => {
  // 이메일 미입력시
  if (!email) {
    return false;
  }

  // 이메일 정규식 검사
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // 이메일 형식이 올바름
  return true;
};
