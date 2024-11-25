import styled from "@emotion/styled";
import BackgroundImage from "../assets/images/image01.png";
import { useNavigate } from "react-router-dom";

const Background = styled.div`
  background-image: url(${BackgroundImage});
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;

  opacity: 0.5;
  width: 100vw;
  height: 100vh;
  position: absolute;

  top: 0;
  left: 0;
  z-index: 0;
`;

const Style = styled.div`
  background-color: #344056;
  width: 100%;
  height: 100%;
  display: flex;

  position: absolute;
  z-index: 0;

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    flex-direction: column;
    z-index: 1;
    color: #fff;
  }

  .title {
    font-size: 120px;
    font-weight: bold;
    margin: 0;
    text-align: center;
  }

  p.subtitle {
    font-size: 53px;
    text-align: center;
  }

  .button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 30px;
  }
`;

const Button = styled.button<{ width?: string; height?: string }>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  font-size: 35px;
  color: #fff;
  background-color: #166eb7;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;

  &:hover {
    background-color: #0a4a7a;
  }
`;

// const Footertitle = styled.p`
//   font-size: 1.2rem;
//   margin-top: 10px;
//   text-align: center;
// `;

const Main = () => {
  const navigate = useNavigate(); // 페이지 주소 이동을 위한 navigate 함수 선언
  const handleLoginClick = () => navigate("/login"); // 로그인 페이지로 이동
  const handleStartClick = () => navigate("/template"); // 템플릿 페이지로 이동

  return (
    <Style>
      <Background />
      <div className="overlay">
        <h1 className="title">여행갈래?</h1>
        <p className="subtitle">세상에서 제일 간단한 계획서</p>
        <div className="button-container">
          <Button onClick={handleStartClick} width="240px" height="60px">
            시작하기
          </Button>
          <Button onClick={handleLoginClick} width="240px" height="60px">
            로그인
          </Button>
        </div>
      </div>
    </Style>
  );
};

export default Main;
