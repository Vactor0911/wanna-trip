import { useAtom, useSetAtom } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import { wannaTripLoginStateAtom, Permission, isAuthInitializedAtom } from "../state";
import axiosInstance, {
  getCsrfToken,
  setupAxiosInterceptors,
} from "../utils/axiosInstance";
import { useNavigate } from "react-router";
import { setAccessToken } from "../utils/accessToken";
import { resetStates } from "../utils";

interface TokenRefresherProps {
  children: ReactNode;
}

const TokenRefresher = ({ children }: TokenRefresherProps) => {
  const [, setLoginState] = useAtom(wannaTripLoginStateAtom);
  const [isInitialized, setIsInitialized] = useState(false); // 로그인 정보 복구 완료 여부
  const [, setIsAuthInitialized] = useAtom(isAuthInitializedAtom); // 전역 초기화 상태 연결
  const navigate = useNavigate();
  const setWannaTripLoginState = useSetAtom(wannaTripLoginStateAtom); // 상태 업데이트

  useEffect(() => {
    // 이미 초기화가 완료되었으면 실행하지 않음
    if (isInitialized) {
      return;
    }

    const initializeAuth = async () => {
      // 1. sessionStorage or localStorage에서 로그인 정보 복구
      const storedLoginState =
        localStorage.getItem("WannaTriploginState") ||
        sessionStorage.getItem("WannaTriploginState");

      // 저장된 로그인 정보가 없으면 초기화 완료
      if (!storedLoginState) {
        setIsInitialized(true);
        setIsAuthInitialized(true);
        return;
      }

      const parsedLoginState = JSON.parse(storedLoginState);

      // 저장된 로그인 상태가 로그인되지 않은 상태면 초기화 완료
      if (!parsedLoginState.isLoggedIn) {
        setIsInitialized(true);
        setIsAuthInitialized(true);
        return;
      }

      // 2. 로그인 정보 복구 및 토큰 갱신
      try {
        // CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();
        const response = await axiosInstance.post(
          `/auth/token/refresh`,
          {},
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
          }
        );

        if (response.data.success) {
          setAccessToken(response.data.accessToken);

          const { email, name, permission, userUuid } = response.data;
          let enumPermission = Permission.USER;
          if (permission === "admin") {
            enumPermission = Permission.ADMIN;
          } else if (permission === "superadmin") {
            enumPermission = Permission.SUPER_ADMIN;
          }

          const updatedLoginState = {
            isLoggedIn: true,
            userUuid,
            loginType: parsedLoginState.loginType || "normal",
            permission: enumPermission,
            email,
            userName: name,
          };

          setLoginState(updatedLoginState);

          // localStorage 또는 sessionStorage에 로그인 상태 저장
          if (localStorage.getItem("WannaTriploginState")) {
            localStorage.setItem(
              "WannaTriploginState",
              JSON.stringify(updatedLoginState)
            );
          } else {
            sessionStorage.setItem(
              "WannaTriploginState",
              JSON.stringify(updatedLoginState)
            );
          }
        }
      } catch (error) {
        console.error("자동 로그인 유지 실패, 로그아웃 처리:", error);

        await resetStates(setWannaTripLoginState);
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      } finally {
        setIsInitialized(true);
        setIsAuthInitialized(true);
      }
    };

    // Axios Interceptor 설정 (자동 토큰 갱신)
    setupAxiosInterceptors();
    
    // 인증 초기화 실행
    initializeAuth();
  }, [isInitialized, setLoginState, navigate, setWannaTripLoginState, setIsAuthInitialized]);

  //  로그인 정보가 복구될 때까지 UI 렌더링 방지
  if (!isInitialized) {
    return null; // UI 깜빡임 방지 (초기 상태가 적용될 때까지 렌더링 지연)
  }

  return <>{children}</>;
};

export default TokenRefresher;
