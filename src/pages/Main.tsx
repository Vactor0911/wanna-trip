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

const Background2 = styled.div`
  background-color: #344056;
  width: 100%;
  height: 100%;
  display: flex;
  position: absolute;
  z-index: 0;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: column;
  color: white;
  z-index: 1;
  padding-bottom: 50px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-top: 10px;
  text-align: center;
`;

const Footertitle = styled.p`
  font-size: 1.2rem;
  margin-top: 10px;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 30px 0 40px;
`;

const Button = styled.button<{ width?: string; height?: string }>`
  width: ${(props) => props.width || "120px"};
  height: ${(props) => props.height || "40px"};
  font-size: 1rem;
  color: white;
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

const Main = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/login");
  const handleStartClick = () => navigate("/Template");

  return (
    <>
      <Background2>
        <Background />
        <Overlay>
          <Title>여행갈래?</Title>
          <Subtitle>세상에서 제일 간단한 계획서</Subtitle>
          <ButtonContainer>
            <Button onClick={handleStartClick} width="100px" height="30px">
              시작하기
            </Button>
            <Button onClick={handleLoginClick} width="100px" height="30px">
              로그인
            </Button>
          </ButtonContainer>
        </Overlay>
      </Background2>
    </>
  );
};

export default Main;
