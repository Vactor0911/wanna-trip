import styled from "@emotion/styled";
import { Button } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from "react-router-dom";

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

  return (
    <Style>
      <header>
        <div className="container">
          <h2 className="title">여행갈래</h2>
        </div>
        <div className="container">
          <Button variant="contained" onClick={handleLoginClick}>
            로그인/회원가입
          </Button>
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
