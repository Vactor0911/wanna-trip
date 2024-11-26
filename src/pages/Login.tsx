import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BackgroundImage from "../assets/images/background.png";
import { color } from "../utils/theme";
import {
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import NaverIcon from "../assets/images/naver.png";
import GoogleIcon from "../assets/images/google.png";
import KakaoIcon from "../assets/images/kakao.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Style = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: ${color.background_main};
  z-index: 1;

  &:before {
    content: "";
    position: absolute;
    width: 40%;
    height: 100vh;
    top: 0;
    left: 5%;
    background-image: url(${BackgroundImage});
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    z-index: -1;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 35%;
    min-width: 400px;
    height: 100%;
    margin-right: 10%;
    gap: 2em;
  }

  .title {
    display: flex;
    flex-direction: column;
    width: 100%;
    color: white;
  }
  .title h1 {
    font-size: 2em;
  }
  .title p {
    font-size: 1.5em;
  }

  .button-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .checkbox-container {
    display: flex;
    flex-direction: column;
  }

  .button-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  p.register {
    align-self: center;
    color: white;
    word-spacing: 3px;
    font-size: 1.3em;
  }

  p.register a {
    color: #ebebeb;
    margin-left: 20px;
  }

  .social-login {
    display: flex;
    justify-content: center;
    gap: 1em;
  }

  @media (max-width: 768px) {
    justify-content: center;

    &:before {
      width: 80%;
      left: 10%;
      opacity: 0.3;
    }

    .login-form {
      margin: 0;
      width: 70%;
      min-width: 260px;
    }
  }

  @media (max-width: 480px) {
    &:before {
      width: 100%;
      left: 0;
      opacity: 0.3;
    }

    .button-container {
      flex-direction: column;
      align-items: center;
      align-self: center;
      width: auto;
      gap: 1em;
    }

    .button-wrapper,
    .button-wrapper #btn-login {
      width: 100%;
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  
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
    <Style>
      <div className="login-form">
        <div className="title">
          <h1>여행갈래?</h1>
          <p>세상에서 가장 간단한 계획서</p>
        </div>

        <OutlinedInput
          sx={{
            backgroundColor: "#EBEBEB",
            borderRadius: "10px",
          }}
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required

          startAdornment={
            <InputAdornment position="start">
              <PersonRoundedIcon
                sx={{
                  color: "black",
                  transform: "scale(1.5)",
                  marginRight: "20px",
                }}
              />
            </InputAdornment>
          }
        />

        <OutlinedInput
          sx={{
            backgroundColor: "#EBEBEB",
            borderRadius: "10px",
          }}
          type={isPasswordVisible ? "text" : "password"}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required

          startAdornment={
            <InputAdornment position="start">
              <LockIcon
                sx={{
                  color: "black",
                  transform: "scale(1.5)",
                  marginRight: "20px",
                }}
              />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => {
                  setIsPasswordVisible(!isPasswordVisible);
                }}
              >
                {isPasswordVisible ? (
                  <VisibilityIcon sx={{ color: "black" }} />
                ) : (
                  <VisibilityOffIcon sx={{ color: "black" }} />
                )}
              </IconButton>
            </InputAdornment>
          }
        />

        <div className="button-container">
          <div className="checkbox-container">
            <FormControlLabel
              control={
                <Checkbox
                  size="large"
                  sx={{
                    color: "#EBEBEB",
                  }}
                  checked={isRememberMe} 
                  onChange={handleRememberMeChange}
                />
              }
              label="아이디 저장"
              sx={{
                color: "white",
                textDecoration: "underline",
                transform: "translateY(6px)",
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  size="large"
                  sx={{
                    color: "#EBEBEB",
                  }}
                />
              }
              label="로그인 상태 유지"
              sx={{
                color: "white",
                textDecoration: "underline",
                transform: "translateY(-6px)",
              }}
            />
          </div>
          <div className="button-wrapper">
            <Button
              id="btn-login"
              variant="contained"
              onClick={handleLoginClick}
              sx={{
                borderRadius: "50px",
                fontWeight: "bold",
                fontSize: "1.4em",
                padding: "5px 30px",
              }}
            >
              로그인
            </Button>
          </div>
        </div>

        <p className="register">
          계정이 아직 없으신가요? <Link to="/register">회원가입</Link>
        </p>

        <div className="social-login">
        <IconButton>
            <Avatar src={KakaoIcon} sx={{ width: "60px", height: "60px" }} />
          </IconButton>
          <IconButton>
            <Avatar src={GoogleIcon} sx={{ width: "60px", height: "60px" }} />
          </IconButton>
          <IconButton>
            <Avatar src={NaverIcon} sx={{ width: "60px", height: "60px" }} />
          </IconButton>
        </div>
      </div>
    </Style>
  );
};

export default Login;
