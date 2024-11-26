import React, { useState } from "react";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from "react-router-dom";
import { Margin } from "@mui/icons-material";
import axios from "axios";

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
  

  // 임시 계정 탈퇴 기능 추가 시작
  // const [email, setEmail] = useState(''); // 사용자 이메일
  // const [password, setPassword] = useState(''); // 사용자 비밀번호

  const PORT = 3005; // server/index.js 에 설정한 포트 번호 - 임의로 로컬서버라 이건 알아서 수정하면 됨
  const HOST = 'http://localhost'; // 임의로 로컬서버라 이건 알아서 수정하면 됨 

  const handleAccountDeleteClick = async () => {
    // 계정 탈퇴 로직을 여기에 추가하세요
    try{
        const response = await axios.post(`${HOST}:${PORT}/api/account-delete`, {
          email: 'test@naver.com', //임시로 이메일을 넣어놨음
          password: '1234' //임시로 비밀번호를 넣어놨음
        });

        // 서버 응답 처리
        // 서버로부터 성공 메시지를 받은 경우
        console.log('계정 탈퇴가 완료되었습니다.', response.data.message);

        // 사용자에게 성공 메시지 보여주기 (UI 반영)
        alert('계정 탈퇴가 완료되었습니다.');


    }catch (error: any) {
      // 서버로부터 반환된 에러 메시지 확인
      if (error.response) {
          console.error('서버가 오류를 반환했습니다:', error.response.data.message);
          alert(`Error: ${error.response.data.message}`);
      } else {
          console.error('요청을 보내는 중 오류가 발생했습니다:', error.message);
          alert('예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
      }
  }
    
  } // 임시 계정 탈퇴 기능 추가 끝

  return (
    <Style>
      <header>
        <div className="container">
          <h2 className="title">여행갈래</h2>
        </div>
        <div className="container">
            <div style={{ display: 'flex', gap: '20px' }}>
            {/* 임시 계정 탈퇴 기능 추가 시작 */}
            <Button variant="contained" onClick={handleAccountDeleteClick}>
              계정 탈퇴
            </Button>
            {/* 임시 계정 탈퇴 기능 추가 끝 */}
            <Button variant="contained" onClick={handleLoginClick}>
              로그인/회원가입
            </Button>
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