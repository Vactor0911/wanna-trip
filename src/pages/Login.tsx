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

import { useSetAtom } from "jotai";     // useSetAtom 불러오기
import { loginStateAtom } from "../state";  // loginStateAtom 불러오기




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
  
  // 아이디 저장 기능 추가- 필요

  

  // 로그인 기능 추가
  const [email, setEmail] = useState(''); // 이메일 값
  const [password, setPassword] = useState(''); // 사용자 비밀번호
  const PORT = 3005; // 임의로 로컬서버라 이건 알아서 수정하면 됨
  const HOST = 'http://localhost'; // 임의로 로컬서버라 이건 알아서 수정하면 됨
  const setLoginState = useSetAtom(loginStateAtom); // useSetAtom 불러오기
  const [isLoading, setIsLoading] = useState(false); // 로그인 로딩 상태 추가
  
  // URL의 code를 처리하기 위한 useEffect
  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (code) {
      handleKakaoLogin(); // 카카오 로그인 함수 호출
    }
  }, []);

  // 카카오 간편 로그인 시작
  const handleKakaoLogin = async () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID; // 카카오에서 발급받은 Client ID
    const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI; // 카카오에서 등록한 Redirect URI
    const code = new URL(window.location.href).searchParams.get("code"); // URL에서 code 추출
  
    if (!code) {
      // 카카오 로그인 화면으로 이동
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
      window.location.href = kakaoAuthUrl;
      return;
    }
  
    try {
      // Step 1: 카카오 서버에서 Access Token 발급
      const tokenResponse = await axios.post(
        "https://kauth.kakao.com/oauth/token",
        null,
        {
          params: {
            grant_type: "authorization_code",
            client_id: KAKAO_CLIENT_ID,
            redirect_uri: KAKAO_REDIRECT_URI,
            code: code,
          },
        }
      );
  
      const accessToken = tokenResponse.data.access_token;
  
      // Step 2: 사용자 정보 가져오기
      const userInfoResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      const { id, properties, kakao_account } = userInfoResponse.data;
      const email = kakao_account.email || `${id}@kakao.com`; // 이메일이 없으면 ID 기반으로 생성
      const nickname = properties.nickname;
  
      // Step 3: 사용자 정보를 서버로 전달 (DB 저장/갱신 요청)
      const serverResponse = await axios.post(`${HOST}:${PORT}/api/login/kakao`, {
        email,
        name: nickname,
        loginType: "kakao", // 간편 로그인 타입 전달
        token: accessToken,
      });
  
      // Step 4: 로그인 상태 업데이트
      setLoginState({
        isLoggedIn: true,
        email: email,
        loginType: "kakao",
        loginToken: accessToken,
      });

      // 서버 응답 처리
      console.log("로그인 성공:", serverResponse.data.message);

      // 로그인 성공 메시지 표시
      alert(`${nickname}님 환영합니다!`);

      // Step 5: URL의 code 제거
      window.history.replaceState(null, "", "/login");

      navigate("/template"); // 성공 후 페이지 이동

    } catch (error) {
      console.error("카카오 로그인 실패:", error);
      alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
    }

    
  };// 카카오 간편 로그인 시작
    
  
    //일반 로그인 기능 시작
    const handleLoginClick = async (e: React.FormEvent) => {
      e.preventDefault();
    
      // 입력값 검증
      if (!email || !password) {
        alert("이메일과 비밀번호를 입력해 주세요.");
        return;
      }
    
      setIsLoading(true); // 로딩 상태 활성화
      try {
        // POST /api/login 요청
        const response = await axios.post(`${HOST}:${PORT}/api/login`, {
          email: email,
          password: password,
        });
    
        // 서버 응답에서 사용자 정보 추출
        const { nickname } = response.data;
    
        // 로그인 성공 메시지
        alert(`[ ${nickname} ]님 로그인에 성공했습니다!`);
    
        // 로그인 상태 업데이트 그냥 둬도 됨
        setLoginState({
          isLoggedIn: true,
          email: email,
          loginType: "normal", // 일반 로그인
          loginToken: response.data.token,
        });
    
        // 성공 후 페이지 이동
        navigate("/template");
      } catch (error: any) {
        if (error.response) {
          console.error("서버 오류:", error.response.data.message);
          alert(error.response.data.message || "로그인 실패");
        } else {
          console.error("요청 오류:", error.message);
          alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
        }
        setPassword(""); // 로그인 실패 시 비밀번호 초기화
      } finally {
        setIsLoading(false); // 로딩 상태 비활성화
      }
    };  //일반 로그인 기능 끝

  
  
  
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
          <IconButton onClick={handleKakaoLogin}>
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
