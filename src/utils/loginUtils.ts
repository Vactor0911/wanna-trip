import axios from "axios";
import axiosInstance, { getCsrfToken } from "./axiosInstance";
import { setAccessToken } from "./accessToken";
import { LoginState, Permission } from "../state";

// 계정 타입을 한글로 변환하는 함수
export const getLoginTypeInKorean = (loginType: string): string => {
  switch (loginType) {
    case "normal": return "일반";
    case "kakao": return "카카오";
    case "google": return "구글";
    default: return loginType;
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
}) => {
  const { existingType, email, socialInfo, csrfToken } = params;
  
  // 1. 사용자에게 계정 연동 여부 확인
  const koreanType = getLoginTypeInKorean(existingType);
  const confirmMsg = `이미 ${koreanType} 계정으로 가입된 이메일입니다.\n계정을 연동하시겠습니까?`;
  
  if (!confirm(confirmMsg)) {
    alert(`${koreanType} 계정으로 로그인해주세요.`);
    return { success: false };
  }
  
  // 2. 일반 계정인 경우 비밀번호 입력
  if (existingType === "normal") {
    const password = prompt("기존 계정 비밀번호를 입력하세요:");
    if (!password) return { success: false };
    
    try {
      // 비밀번호 포함하여 계정 연동 API 호출
      const linkResponse = await axiosInstance.post(
        "/auth/link/account",
        { password, email, socialInfo },
        { headers: { "X-CSRF-Token": csrfToken } }
      );
      
      // 성공 시 로그인 처리
      if (linkResponse.data.success) {
        return { 
          success: true, 
          data: linkResponse.data
        };
      } else {
        alert("계정 연동에 실패했습니다.");
        return { success: false };
      }
    } catch (error) {
      console.error("계정 연동 실패:", error);
      alert("계정 연동에 실패했습니다. 다시 시도해주세요.");
      return { success: false };
    }
  } 
  // 3. 소셜 계정이면 바로 연동
  else {
    try {
      const linkResponse = await axiosInstance.post(
        "/auth/link/account",
        { email, socialInfo },
        { headers: { "X-CSRF-Token": csrfToken } }
      );
      
      if (linkResponse.data.success) {
        return { 
          success: true, 
          data: linkResponse.data
        };
      } else {
        alert("계정 연동에 실패했습니다.");
        return { success: false };
      }
    } catch (error) {
      console.error("계정 연동 실패:", error);
      alert("계정 연동에 실패했습니다. 다시 시도해주세요.");
      return { success: false };
    }
  }
};


// LoginResponseData: 로그인 API 응답에 포함되는 데이터 구조 정의
export interface LoginResponseData {
  accessToken: string;
  permissions: "user" | "admin" | "superadmin";
  name: string;
  userUuid: string;
  email?: string;
}


// 로그인 상태 처리 함수 
export const processLoginSuccess = (
  responseData: LoginResponseData, 
  setWannaTripLoginState: (state: LoginState) => void,
  isPersistent: boolean = true,
  options?: { email?: string, loginType?: string }
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
  
  // 로그인 상태 생성
  const newWannaTriploginState: LoginState = {
    isLoggedIn: true,
    userUuid: userUuid,
    email: options?.email || responseData.email || "",
    userName: name,
    loginType: options?.loginType || "normal",
    permission: enumPermission,
  };
  
  // 로그인 상태 저장
  setWannaTripLoginState(newWannaTriploginState);
  
  // 로컬/세션 스토리지 저장
  if (isPersistent) {
    localStorage.setItem("WannaTriploginState", JSON.stringify(newWannaTriploginState));
  } else {
    sessionStorage.setItem("WannaTriploginState", JSON.stringify(newWannaTriploginState));
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
  
  return axios.post(
    "https://kauth.kakao.com/oauth/token",
    null,
    {
      params: {
        grant_type: "authorization_code",
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: KAKAO_REDIRECT_URI,
        code,
      },
    }
  );
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