import styled from "@emotion/styled";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityOnIcon from '@mui/icons-material/Visibility';
import BackgroundImage from "../assets/images/image01.png";
import naverImage from "../assets/images/naver.png"
import googleImage from "../assets/images/google.png"
import { useNavigate } from "react-router-dom";

const BackgroundContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #344056;
  position: relative;
`;

const Background = styled.div`
  background-image: url(${BackgroundImage});
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.5;
  width: 50%;
  height: 100%;
`;

const LoginContainer = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #344056;
  padding: 40px;
  color: white;
  border-radius: 8px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  margin-bottom: 30px;
  text-align: center;
`;

const InputContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  background-color: #d1d5db;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
`;

const Input = styled.input`
  border: none;
  outline: none;
  background: none;
  flex: 1;
  margin-left: 10px;
  font-size: 1rem;
  color: #333;
`;

const OptionsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  color: #cbd5e1;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
`;

const Checkbox = styled.input`
  margin-right: 5px;
`;

const LoginButton = styled.button`
  width: 100%;
  height: 40px;
  font-size: 1rem;
  color: white;
  background-color: #166eb7;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;
  margin-bottom: 20px;

  &:hover {
    background-color: #0a4a7a;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

const FooterText = styled.p`
  font-size: 0.9rem;
  color: #cbd5e1;
`;

const NaverImg = styled.div
`
background-image: url(${naverImage});
background-repeat: no-repeat;
background-position: center;
background-size: contain;
width: 30px
`;

const SocialIcon = styled.div`
  font-size: 1.8rem;
  cursor: pointer;
`;

const Login = () => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    alert("클릭되었습니다!");
  };

  const registerClick = () => navigate("/Register");

  const visibilityeye = () => {
    alert("눈눈!");
  };

  const handleLoginClick = () => navigate("/template");

  return (
    <BackgroundContainer>
      <Background />
      <LoginContainer>
        <Title>여행갈래?</Title>
        <Subtitle>세상에서 제일 간단한 계획서</Subtitle>

        {/* 아이디 입력 필드 */}
        <InputContainer>
          <AccountCircleIcon />
          <Input type="text" placeholder="이메일 / 아이디" />
        </InputContainer>

        {/* 비밀번호 입력 필드 */}
        <InputContainer>
          <LockIcon />
          <Input type="password" placeholder="비밀번호" />
          <VisibilityOffIcon onClick={visibilityeye} style={{ cursor: "pointer" }} />
        </InputContainer>

        {/* 옵션 체크박스 */}
        <OptionsContainer>
          <CheckboxContainer>
            <Checkbox type="checkbox" />
            아이디 저장
          </CheckboxContainer>
          <CheckboxContainer>
            <Checkbox type="checkbox" defaultChecked />
            로그인 상태 유지
          </CheckboxContainer>
        </OptionsContainer>

        {/* 로그인 버튼 */}
        <LoginButton onClick={handleLoginClick}>로그인</LoginButton>

        {/* 회원가입 및 소셜 로그인 옵션 */}
        <FooterText>
          계정이 아직 없으신가요? <strong onClick={registerClick} style={{ cursor: "pointer" }}>회원가입</strong>
        </FooterText>

        {/* 소셜 로그인 */}
        <Footer>
          <SocialIcon>
            <NaverImg aria-label="Google" onClick={handleClick}/>
          </SocialIcon>
          <SocialIcon>
            <span role="img" style={{backgroundImage:naverImage}} aria-label="Naver" onClick={handleClick}/>
          </SocialIcon>
        </Footer>
      </LoginContainer>
    </BackgroundContainer>
  );
};

export default Login;
