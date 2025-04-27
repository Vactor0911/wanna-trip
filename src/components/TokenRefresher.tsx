import { useAtom } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import {
  LoginState,
  wannaTripLoginStateAtom,
  Permission,
} from "../state";
import {
  getCsrfToken,
  SERVER_HOST,
  setupAxiosInterceptors,
} from "../utils/axiosInstance";
import { useNavigate } from "react-router";
import { setAccessToken } from "../utils/accessToken";
import axios from "axios";

interface TokenRefresherProps {
  children: ReactNode;
}

const TokenRefresher = ({ children }: TokenRefresherProps) => {
  const [loginState, setLoginState] = useAtom(wannaTripLoginStateAtom);
  const [isInitialized, setIsInitialized] = useState(false); // 로그인 정보 복구 완료 여부
  const navigate = useNavigate();


  useEffect(() => {
    // 1. sessionStorage or localStorage에서 로그인 정보 복구
    const storedLoginState =
      localStorage.getItem("wannaTripLoginState") ||
      sessionStorage.getItem("wannaTripLoginState");

    if (storedLoginState) {
      const parsedLoginState = JSON.parse(storedLoginState);

      // 로그인 정보 복구
      if (!loginState.isLoggedIn) {
        setLoginState(parsedLoginState);
      }
    } else {
      setIsInitialized(true); // 초기화 완료 상태로 변경
      return;
    }

    // 2. 로그인 상태가 확인될 때까지 기다림
    if (!loginState.isLoggedIn) {
      setIsInitialized(true); // 초기화 완료 상태로 변경
      return;
    }

    const refreshAccessToken = async () => {
      try {
        // CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();
        const response = await axios.post(
          `${SERVER_HOST}/users/token/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
            },
          }
        );

        if (response.data.success) {
          setAccessToken(response.data.accessToken);

          const { userId, name, permission } = response.data;
          let enumPermission = Permission.USER;
          if (permission === "admin") {
            enumPermission = Permission.ADMIN;
          } else if (permission === "superadmin") {
            enumPermission = Permission.SUPER_ADMIN;
          }

          const updatedLoginState = {
            isLoggedIn: true,
            userId,
            permission: enumPermission,
            userName: name,
            loginType: loginState.loginType || "normal", // 로그인 타입 ; ENUM(normal, kakao, google)
          };

          // 기존 상태와 다를 때만 업데이트
          if (
            JSON.stringify(loginState) !== JSON.stringify(updatedLoginState)
          ) {
            setLoginState(updatedLoginState);
          }

          // localStorage 또는 sessionStorage에 로그인 상태 저장
          if (localStorage.getItem("FabLabLoginState")) {
            localStorage.setItem(
              "FabLabLoginState",
              JSON.stringify(updatedLoginState)
            );
          } else {
            sessionStorage.setItem(
              "FabLabLoginState",
              JSON.stringify(updatedLoginState)
            );
          }
        }
      } catch (error) {
        console.error("자동 로그인 유지 실패, 로그아웃 처리:", error);

        // 상태 초기화
        // Jotai 상태
        setLoginState({} as LoginState); // 로그인 상태 초기화

        setAccessToken(""); // 토큰 초기화
        sessionStorage.removeItem("wannaTripLoginState"); // 세션 스토리지 제거
        localStorage.removeItem("wannaTripLoginState"); // 로컬 스토리지 제거

        navigate("/login"); // 로그인 페이지로 이동
      } finally {
        setIsInitialized(true); // 초기화 완료 상태로 변경
      }
    };

    // 3. 로그인된 경우에만 토큰 갱신 실행
    if (loginState.isLoggedIn) {
      refreshAccessToken();
    }

    // Axios Interceptor 설정 (자동 토큰 갱신)
    setupAxiosInterceptors(navigate);
  }, [setLoginState, navigate, loginState]);

  //  로그인 정보가 복구될 때까지 UI 렌더링 방지
  if (!isInitialized) {
    return null; // UI 깜빡임 방지 (초기 상태가 적용될 때까지 렌더링 지연)
  }

  return <>{children}</>;
};

export default TokenRefresher;
