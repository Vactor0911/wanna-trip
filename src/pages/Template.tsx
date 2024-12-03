import React, { useState } from "react";
import styled from "@emotion/styled"; // 스타일 추가
import { Button } from "@mui/material"; // 버튼 추가
import DownloadIcon from "@mui/icons-material/Download"; // 다운로드 아이콘 추가
import SaveIcon from "@mui/icons-material/Save"; // 저장 아이콘 추가
import { useNavigate } from "react-router-dom";
import { Margin } from "@mui/icons-material";
import axios from "axios";

import { useAtomValue, useSetAtom } from "jotai"; // useAtomValue : useSetAtom 값 불러오기, useSetAtom : 값 설정하기
import { loginStateAtom, SERVER_HOST } from "../state"; // loginState 불러오기
import LoginButton from "../components/LoginButton";

import Board from "../components/Board"; // Card 컴포넌트 추가

const Style = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  height: 100vh;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    padding: 10px 20px;
    background-color: #47536b;
    height: 80px;
  }

  header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    color: white;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    width: calc(100% - 25px);
    height: 100%;

    background-color: #2d405e;
    position: relative;
  }

  .template-title {
    display: flex;
    justify-content: space-between;
    height: 100px;
    align-items: center;

    padding: 10px 50px;
    padding-right: 20px;
    color: white;
  }

  .template-title .button-container {
    display: flex;
    gap: 1em;
  }

  .boards-container {
    display: flex;
    padding: 20px 50px;
  }

  .boards-container {
    overflow-x: auto; /* 가로 스크롤 허용 */
    max-height: 1000px; /* 최대 높이 제한 */
    height: 100%;
  }

  .left-menu {
    display: flex;
    position: absolute;
    width: 35px;
    height: 100%;
    top: 0;
    left: -25px;
    background-color: #4d5d77;
    transition: width 0.2s ease-in-out;
  }

  .left-menu:hover {
    /* 예시 (호버로 만들거 아님; 알아서 버튼 클릭하면 토글되게 ㄱㄱ) */
    width: 300px;
  }

  @media (max-width: 768px) {
  }

  @media (max-width: 480px) {
  }
`;

const Template = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/login");
  // const [email, setEmail] = useState(''); // 사용자 이메일
  // const [password, setPassword] = useState(''); // 사용자 비밀번호

  const { isLoggedIn, email, loginType, loginToken } =
    useAtomValue(loginStateAtom); // 로그인 상태 읽기
  const setLoginState = useSetAtom(loginStateAtom); // 상태 업데이트

  // Access Token 갱신 함수
  const refreshAccessToken = () => {
    return axios
      .post(`${SERVER_HOST}/api/token/refresh`, { email })
      .then((response) => {
        const newToken = response.data.token;
        setLoginState((prevState) => ({
          ...prevState,
          loginToken: newToken, // 갱신된 토큰 저장
        }));
        return newToken; // 갱신된 토큰 반환
      })
      .catch((error) => {
        console.error("Access Token 갱신 실패:", error);
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        setLoginState({
          isLoggedIn: false, // 로그인 상태 초기화
          email: "", // 이메일 초기화
          loginType: "normal", // 로그인 타입 초기화
          loginToken: "", // 토큰 초기화
          refreshToken: "", // 리프레시 토큰 초기화
        });
        navigate("/login"); // 로그인 페이지로 이동
      });
  };

  // 로그아웃 기능 구현 시작
  const handleLogoutClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다."); // 로그인 상태가 아닌 경우 알림
      return;
    }

    let currentToken = loginToken;

    // Access Token 갱신 (카카오 간편 로그인 사용자만 처리)
    const refreshTokenPromise =
      loginType === "kakao" && !currentToken
        ? refreshAccessToken().then((newToken) => {
            currentToken = newToken; // 갱신된 토큰을 설정
          })
        : Promise.resolve(); // 일반 로그인 사용자는 바로 진행

    refreshTokenPromise
      .then(() => {
        // 로그아웃 요청 (카카오 간편 로그인 또는 일반 로그인 모두 처리)
        return axios.post(`${SERVER_HOST}/api/logout`, {
          email: email,
          token: loginType === "kakao" ? currentToken : null, // 카카오: 토큰 전달, 일반: null
        });
      })
      .then((response) => {
        if (response.data.success) {
          alert("로그아웃이 성공적으로 완료되었습니다."); // 성공 메시지
          setLoginState({
            isLoggedIn: false, // 로그인 상태 초기화
            email: "", // 이메일 초기화
            loginType: "normal", // 로그인 타입 초기화
            loginToken: "", // 토큰 초기화
            refreshToken: "", // 리프레시 토큰 초기화
          });
          navigate("/login"); // 로그인 페이지로 이동
        } else {
          alert("로그아웃 처리에 실패했습니다."); // 실패 메시지
        }
      })
      .catch((error) => {
        alert("로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요."); // 에러 메시지
      });
  }; // 로그아웃 기능 구현 끝

  return (
    <Style>
      <header>
        <div className="container">
          <h2 className="title">여행갈래</h2>
        </div>
        <div className="container">
          <div style={{ display: "flex", gap: "20px" }}>
            {isLoggedIn ? (
              // 로그아웃 기능 추가
              <LoginButton onClick={handleLogoutClick} />
            ) : (
              <Button variant="contained" onClick={handleLoginClick}>
                로그인/회원가입
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="main-container">
        <div className="template-title">
          <h2>MyBoard</h2>
          <div className="button-container">
            <Button variant="contained" startIcon={<DownloadIcon />}>
              저장하기
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />}>
              다운로드
            </Button>
          </div>
        </div>
        <div className="boards-container">
          <Board />
        </div>
        <div className="left-menu"></div>
      </div>
    </Style>
  );
};

export default Template;
