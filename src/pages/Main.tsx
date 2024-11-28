import styled from "@emotion/styled";
import { color } from "../utils/theme";
import BackgroundImage from "../assets/images/background.png";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Style = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  gap: 1.5em;
  background-color: ${color.background_main};
  position: relative;
  z-index: 1;
  color: white;

  // 배경 이미지
  &:before {
    content: "";
    position: absolute;
    width: 92%;
    height: 92%;
    background-image: url(${BackgroundImage});
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    opacity: 0.3;
    z-index: -1;
  }

  // 제목
  h1 {
    font-size: 4em;
  }
  // 부제목
  p {
    font-size: 2.7em;
  }

  // 버튼 공간
  .button-container {
    display: flex;
    flex-direction: column;
    width: 220px;
    gap: 1.5em;
  }

  // 버튼
  Button {
    font-size: 1.65em;
    font-weight: bold;
  }
`;

const Main = () => {
  const navigate = useNavigate(); // 페이지 주소 이동을 위한 navigate 함수 선언
  const handleLoginClick = () => navigate("/login"); // 로그인 페이지로 이동
  const handleStartClick = () => navigate("/template"); // 템플릿 페이지로 이동

  return (
    <Style>
      <h1>여행갈래?</h1>
      <p>세상에서 가장 간단한 계획서</p>
      <div className="button-container">
        <Button onClick={handleStartClick} variant="contained">
          시작하기
        </Button>
        <Button onClick={handleLoginClick} variant="contained">
          로그인
        </Button>
      </div>
    </Style>
  );
};

export default Main;
