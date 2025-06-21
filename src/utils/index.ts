import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { LoginState } from "../state";
import { setAccessToken } from "./accessToken";
import { getDefaultStore } from "jotai/vanilla"; // vanilla 버전은 React에 의존하지 않음

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

// 로컬 import를 위한 함수
const getKakaoLoginStateAtom = async () => {
  const { kakaoLoginStateAtom } = await import("../state");
  return kakaoLoginStateAtom;
};

/**
 * 로그인 상태를 설정하는 비동기 함수
 * 컴포넌트 외부에서도 아톰 상태 변경 가능
 * @param setLoginState
 * @returns 로그인 상태 초기화
 */
export const resetStates = async (
  setLoginState: (state: LoginState) => void
) => {
  setLoginState({} as LoginState); // 로그인 상태 초기화
  setAccessToken(""); // 토큰 초기화
  sessionStorage.removeItem("WannaTriploginState"); // 세션 스토리지 제거
  localStorage.removeItem("WannaTriploginState"); // 로컬 스토리지 제거

  try {
    // kakaoLoginState 초기화 (getDefaultStore 사용)
    const kakaoLoginStateAtom = await getKakaoLoginStateAtom();
    const store = getDefaultStore();
    store.set(kakaoLoginStateAtom, "");
  } catch (err) {
    console.error("카카오 로그인 상태 초기화 실패", err);
  }
};

// 카카오 정보만 초기화하는 함수
export const resetKakaoLoginState = async () => {
  try {
    // kakaoLoginState 초기화 (getDefaultStore 사용)
    const kakaoLoginStateAtom = await getKakaoLoginStateAtom();
    const store = getDefaultStore();
    store.set(kakaoLoginStateAtom, "");
  } catch (err) {
    console.error("카카오 로그인 상태 초기화 실패", err);
  }
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

/**
 * HTML 문자열에서 텍스트만 추출하는 함수
 * @param html HTML 문자열
 * @returns HTML 태그가 제거된 텍스트 문자열
 */
export const stripHtml = (html: string | undefined | null): string => {
  if (!html) {
    return "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent ?? "";
};

/**
 * 랜덤 색상 코드를 반환하는 함수
 * @param seed 랜덤 시드를 지정할 수 있는 선택적 매개변수
 * @returns 랜덤 색상 코드
 */
export const getRandomColor = (seed?: number): string => {
  // 사용할 색상 배열
  const COLORS = [
    "#A7C7FF",
    "#FFF6A3",
    "#FFB6E1",
    "#FFB6B6",
    "#FFD59E",
    "#D6FFB7",
    "#B6FFE4",
    "#B6D9FF",
    "#D9B6FF",
  ];

  // 랜덤 색상 반환
  if (seed !== undefined) {
    return COLORS[seed % COLORS.length];
  }

  const randInt = Math.floor(Math.random() * COLORS.length);
  return COLORS[randInt];
};
