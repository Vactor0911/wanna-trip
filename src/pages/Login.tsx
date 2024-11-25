import styled from "@emotion/styled";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityOnIcon from '@mui/icons-material/Visibility';
import BackgroundImage from "../assets/images/image01.png";
import naverImage from "../assets/images/naver.png"
import googleImage from "../assets/images/google.png"
import { useNavigate } from "react-router-dom";
import { CottageSharp } from "@mui/icons-material";
import { useState, useEffect } from "react";
import axios from "axios";

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
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #344056;
  padding: 40px;
  color: white;
  border-radius: 8px;
`;

const Title = styled.h1`
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

const NaverImg = styled.div`
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
  

  //비밀번호 보이기/숨기기 시작
  const [isPasswdVisible, setIsPasswdVisible] = useState(false);

  const visibilityeye = () => {
    setIsPasswdVisible((prev) => !isPasswdVisible);
  }; //비밀번호 보이기/숨기기 끝

// 이메일 저장 기능 시작 - 수정필요
  const [isRememberMe, setIsRememberMe] = useState(false);

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsRememberMe(isChecked);
  
    if (isChecked) {
      localStorage.setItem("email", email);
    } else {
      localStorage.removeItem("email");
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setEmail(savedEmail);
      setIsRememberMe(true); // 복구 시 체크박스 활성화
    }
  }, []); // 아이디 저장 기능 끝

  


  
//const handleLoginClick = () => navigate("/template");

// 로그인 기능 추가
const [email, setEmail] = useState(''); // 이메일 값
const [password, setPassword] = useState(''); // 사용자 비밀번호
const PORT = 3005; // 임의로 로컬서버라 이건 알아서 수정하면 됨
const HOST = 'http://localhost'; // 임의로 로컬서버라 이건 알아서 수정하면 됨

const handleLoginClick = async (e: React.FormEvent) => {
  e.preventDefault();

  // 입력값 검증
  if (!email || !password) {
    console.error('이메일 비밀번호가 비어 있습니다.');
    alert('이메일과 비밀번호를 입력해 주세요.');
    return;
  }

  console.log('로그인 요청을 보냅니다:', { email, password });

  try {
    // Axios POST 요청
    const response = await axios.post(`${HOST}:${PORT}/api/login`, {
      email: email,
      password: password
    });


    // GET 테스트 시작

    // GET 요청으로 환영 메시지 받아오기
    const welcomeResponse = await axios.get(`${HOST}:${PORT}/api/user-info`, {
      params: { email: email }, // 이메일 기준으로 사용자 정보 요청
    });

     // 서버에서 받은 닉네임
    const { nickname } = welcomeResponse.data;
    
    // 서버 응답 처리
    console.log('Login successful:', response.data.message);

    // 로그인 성공 후 닉네임 포함한 alert 메시지 표시
    alert(`[ ${nickname} ]님 로그인에 성공했습니다!`);

    // GET 테스트 끝

    navigate("/template");  // 로그인 성공 시 이동할 페이지

  } catch (error: any) {
    // 에러 처리
    if (error.response) {
      console.error('서버가 오류를 반환했습니다:', error.response.data.message);
      alert(error.response.data.message || '로그인 실패');
    } else {
      console.error('요청을 보내는 중 오류가 발생했습니다:', error.message);
      alert('예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
    // 로그인 실패 시 처리: 비밀번호 초기화
    setPassword(''); // 비밀번호만 초기화
  }
};

  return (
    <BackgroundContainer>
      <Background />
      <LoginContainer>
        <Title>여행갈래?</Title>
        <Subtitle>세상에서 제일 간단한 계획서</Subtitle>

        {/* 이메일 입력 필드 */}
        <InputContainer>
          <AccountCircleIcon />
          <Input
            type="text"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
           />
        </InputContainer>

        {/* 비밀번호 입력 필드 visibilityeye*/}
        <InputContainer>
          <LockIcon />
          <Input
            type={isPasswdVisible ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isPasswdVisible ? (
            <VisibilityOnIcon
              onClick={visibilityeye}
              style={{ cursor: "pointer", color: "black" }}
            />
          ) : (
            <VisibilityOffIcon
              onClick={visibilityeye}
              style={{ cursor: "pointer", color: "black" }}
            />
          )}
        </InputContainer>

        {/* 옵션 체크박스 */}
        <OptionsContainer>
          <CheckboxContainer>
          <Checkbox 
              type="checkbox" 
              checked={isRememberMe} 
              onChange={handleRememberMeChange} 
            /> 아이디 저장
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
