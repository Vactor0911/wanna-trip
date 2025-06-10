import axios from "axios";
import axiosInstance, { getCsrfToken } from "./axiosInstance";
import { setAccessToken } from "./accessToken";
import { LoginState, Permission } from "../state";
import { resetKakaoLoginState } from ".";

// 계정 타입을 한글로 변환하는 함수
export const getLoginTypeInKorean = (loginType: string): string => {
  switch (loginType) {
    case "normal":
      return "일반";
    case "kakao":
      return "카카오";
    case "google":
      return "구글";
    default:
      return loginType;
  }
};

// SocialInfo: 소셜 로그인 시 전달되는 정보 구조 정의
export interface SocialInfo {
  socialType: "normal" | "kakao" | "google";
  // 구글 계정은 socialId를 따로 저장하지 않아 null 또는 undefined가 될 수 있음
  socialId?: string | null;
  name: string;
}

// 연동 계정 처리 함수
export const handleAccountLinking = async (params: {
  existingType: string;
  email: string;
  socialInfo: SocialInfo;
  csrfToken: string;
  setWannaTripLoginState?: (state: LoginState) => void;
}) => {
  const { email, socialInfo, csrfToken, setWannaTripLoginState } = params;

  try {
    // 계정 연동 API 호출
    const linkResponse = await axiosInstance.post(
      "/auth/link/account",
      { email, socialInfo },
      { headers: { "X-CSRF-Token": csrfToken } }
    );

    // 성공 시
    if (linkResponse.data.success) {
      // 소셜 계정 타입에 맞는 메시지 표시
      const socialTypeName = getLoginTypeInKorean(socialInfo.socialType);
      alert(
        `${socialInfo.name}님 ${socialTypeName} 계정 연동 완료!\n이제 ${socialTypeName}로 간편하게 로그인할 수 있습니다.`
      );

      // 서버 응답에서 로그인 타입 가져오기
      // 서버에서 받은 loginType을 우선적으로 사용, 없으면 소셜 정보에서 가져옴
      const serverLoginType =
        linkResponse.data.loginType || socialInfo.socialType;

      // 로그인 상태 업데이트
      const savedLoginState = JSON.parse(
        localStorage.getItem("WannaTriploginState") ||
          sessionStorage.getItem("WannaTriploginState") ||
          "{}"
      );

      if (savedLoginState.isLoggedIn) {
        const updatedLoginState = {
          ...savedLoginState,
          loginType: serverLoginType, // 서버에서 받은 로그인 타입 사용
          userName: socialInfo.name,
        };

        // 스토리지 업데이트
        if (localStorage.getItem("WannaTriploginState")) {
          localStorage.setItem(
            "WannaTriploginState",
            JSON.stringify(updatedLoginState)
          );
        } else if (sessionStorage.getItem("WannaTriploginState")) {
          sessionStorage.setItem(
            "WannaTriploginState",
            JSON.stringify(updatedLoginState)
          );
        }

        // Jotai 상태 업데이트
        if (setWannaTripLoginState) {
          setWannaTripLoginState(updatedLoginState);
        }
      }

      return {
        success: true,
        data: linkResponse.data,
      };
    } else {
      alert("계정 연동에 실패했습니다.");
      await resetKakaoLoginState(); // 카카오 로그인 상태 초기화
      return { success: false };
    }
  } catch (error) {
    console.error("계정 연동 실패:", error);
    await resetKakaoLoginState(); // 카카오 로그인 상태 초기화
    alert("계정 연동에 실패했습니다. 다시 시도해주세요.");
    return { success: false };
  }
};

// LoginResponseData: 로그인 API 응답에 포함되는 데이터 구조 정의
export interface LoginResponseData {
  accessToken: string;
  permissions: "user" | "admin" | "superadmin";
  name: string;
  userUuid: string;
  email?: string;
  loginType: string; // 로그인 타입 (normal, kakao, google 등)
}

// 로그인 상태 처리 함수
export const processLoginSuccess = (
  responseData: LoginResponseData,
  setWannaTripLoginState: (state: LoginState) => void,
  isPersistent: boolean = true,
  options?: { email?: string; loginType?: string }
) => {
  const { accessToken, permissions, name, userUuid } = responseData;
  setAccessToken(accessToken);

  // 권한 설정
  let enumPermission = Permission.USER;
  switch (permissions) {
    case "admin":
      enumPermission = Permission.ADMIN;
      break;
    case "superadmin":
      enumPermission = Permission.SUPER_ADMIN;
      break;
  }
  // 로그인 타입 우선순위: 1. 서버 응답, 2. options, 3. 기본값
  const loginType = responseData.loginType || options?.loginType || "normal";

  // 로그인 상태 생성
  const newWannaTriploginState: LoginState = {
    isLoggedIn: true,
    userUuid: userUuid,
    email: options?.email || responseData.email || "",
    userName: name,
    loginType: loginType,
    permission: enumPermission,
  };

  // 로그인 상태 저장
  setWannaTripLoginState(newWannaTriploginState);

  // 로컬/세션 스토리지 저장
  if (isPersistent) {
    localStorage.setItem(
      "WannaTriploginState",
      JSON.stringify(newWannaTriploginState)
    );
  } else {
    sessionStorage.setItem(
      "WannaTriploginState",
      JSON.stringify(newWannaTriploginState)
    );
  }

  return newWannaTriploginState;
};

// 구글 로그인 함수
export const googleLogin = async (googleEmail: string, googleName: string) => {
  const csrfToken = await getCsrfToken();
  return axiosInstance.post(
    "/auth/login/google",
    { googleEmail, googleName },
    { headers: { "X-CSRF-Token": csrfToken } }
  );
};

// 카카오 토큰 요청
export const getKakaoToken = async (code: string) => {
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  return axios.post("https://kauth.kakao.com/oauth/token", null, {
    params: {
      grant_type: "authorization_code",
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      code,
    },
  });
};

// 카카오 로그인 함수
export const kakaoLogin = async (accessToken: string) => {
  const csrfToken = await getCsrfToken();
  return axiosInstance.post(
    "/auth/login/kakao",
    { KaKaoAccessToken: accessToken },
    { headers: { "X-CSRF-Token": csrfToken } }
  );
};

// 일반 로그인 함수
export const normalLogin = async (email: string, password: string) => {
  const csrfToken = await getCsrfToken();
  return axiosInstance.post(
    "/auth/login",
    { email, password },
    { headers: { "X-CSRF-Token": csrfToken } }
  );
};
