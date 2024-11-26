import React, { useState } from "react";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from "react-router-dom";
import { Margin } from "@mui/icons-material";
import axios from "axios";

import { useAtomValue, useSetAtom } from "jotai";   // useAtomValue : useSetAtom 값 불러오기, useSetAtom : 값 설정하기
import { loginStateAtom } from "../state";  // loginState 불러오기

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
    gap: 20px;
  }

  .board-container {
    display: flex;
    padding: 20px 50px;
    background-color: #344056;
    width: 100%;
    height: 100%;
  }

  .left-menu {
    display: flex;
    position: absolute;
    width: 25px;
    height: 100%;
    top: 0;
    left: -25px;
    background-color: #4D5D77;
    transition: width 0.2s ease-in-out;
  }

  .left-menu:hover { /* 예시 (호버로 만들거 아님; 알아서 버튼 클릭하면 토글되게 ㄱㄱ) */
    width: 300px;
  }
`;




const NewTemplate = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/login");

  
  

  // const [email, setEmail] = useState(''); // 사용자 이메일
  // const [password, setPassword] = useState(''); // 사용자 비밀번호

  const PORT = 3005; // server/index.js 에 설정한 포트 번호 - 임의로 로컬서버라 이건 알아서 수정하면 됨
  const HOST = 'http://localhost'; // 임의로 로컬서버라 이건 알아서 수정하면 됨 
  const { isLoggedIn, email, loginType, loginToken } = useAtomValue(loginStateAtom); // 로그인 상태 읽기
  const setLoginState = useSetAtom(loginStateAtom); // 상태 업데이트


  // Access Token 갱신 함수
  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(`${HOST}:${PORT}/api/token/refresh`, {
        email: email,
      });
      const newToken = response.data.token;
      setLoginState((prevState) => ({
        ...prevState,
        loginToken: newToken,
      }));
      return newToken;
    } catch (error) {
      console.error("Access Token 갱신 실패:", error);
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      setLoginState({
        isLoggedIn: false,
        email: "",
        loginType: "normal",
        loginToken: "",
      });
      navigate("/login");
    }
  };
  

  // 로그아웃 기능 구현 시작
  const handleLogoutClick = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    try {
      let currentToken = loginToken;
  
      // Access Token이 없거나 만료된 경우 간편 로그인 사용자만 토큰 갱신
      if (loginType === "kakao" && !currentToken) {
        currentToken = await refreshAccessToken();
        if (!currentToken) return; // 토큰 갱신 실패 시 중단
      }
  
      // 서버에 로그아웃 요청
      const response = await axios.post(`${HOST}:${PORT}/api/logout`, {
        email: email,
        token: loginType === "kakao" ? currentToken : null, // 일반 로그인 사용자는 null로 전달
      });
  
      if (response.data.success) {
        alert("로그아웃이 성공적으로 완료되었습니다.");
        console.log("로그아웃 성공:", response.data.message);
      } else {
        console.error("로그아웃 실패:", response.data.message);
        alert("로그아웃 처리에 실패했습니다.");
      }
  
      // 상태 초기화
      setLoginState({
        isLoggedIn: false,
        email: "",
        loginType: "normal",
        loginToken: "",
      });
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 처리 중 오류 발생:", error);
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  }; // 로그아웃 기능 구현 끝

  return (
    <Style>
      <header>
        <div className="container">
          <h2 className="title">여행갈래</h2>
        </div>
        <div className="container">
            <div style={{ display: 'flex', gap: '20px' }}>

            {isLoggedIn ? (
              // 로그아웃 기능 추가
              <Button variant="contained" onClick={handleLogoutClick}>로그아웃</Button>
            ) : (
              <Button variant="contained" onClick={handleLoginClick}>로그인/회원가입</Button>
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
        <div className="board-container"></div>
        <div className="left-menu">

        </div>
      </div>
    </Style>
  );
};

export default NewTemplate;
