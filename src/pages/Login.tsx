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
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "../assets/images/google.png";
import KakaoIcon from "../assets/images/kakao.png";
import EmailIcon from "@mui/icons-material/Email";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useSetAtom } from "jotai"; // useSetAtom 불러오기
import { loginStateAtom, SERVER_HOST } from "../state"; // loginStateAtom 불러오기
import { jwtDecode } from "jwt-decode"; // named export로 가져오기 // 토큰 디코딩을 위해 설치 필요: npm install jwt-decode - 구글은 필요한 듯

const Style = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: ${color.background_main};
  z-index: 1;

  .login-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 35%;
    min-width: 400px;
    height: 100%;
    margin-right: 10%;
    gap: 1em;
  }

  &:before {
    content: "";
    position: absolute;
    width: 35%;
    height: 100vh;
    top: 0;
    left: 9%;
    background-image: url(${BackgroundImage});
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    z-index: -1;
  }

  .button-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 10px;
  }
  .title {
    display: flex;
    flex-direction: column;
    width: 100%;
    color: white;
  }
  .title h1 {
    font-size: 2.3em;
  }
  .title p {
    font-size: 1.6em;
  }

  .checkbox-container {
    display: flex;
    flex-direction: column;
  }

  p.register {
    align-self: center;
    color: white;
    word-spacing: 3px;
    font-size: 1.3em;
  }

  p.register a {
    color: ${color.link};
    margin-left: 5px;
    text-decoration: none;
  }

  p.register a:hover {
    text-decoration: underline;
  }

  .social-login {
    display: flex;
    justify-content: center;
    gap: 1.5em;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
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
      width: 88%;
      left: 6%;
      opacity: 0.3;
    }

    .button-container {
      flex-direction: column;
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

  // 이메일 저장 기능 추가- 필요

  // 로그인 기능 추가
  const [email, setEmail] = useState(""); // 이메일 값
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  const setLoginState = useSetAtom(loginStateAtom); // useSetAtom 불러오기
  const [isLoading, setIsLoading] = useState(false); // 로그인 로딩 상태 추가
  const google = (window as any).google; // 구글 간편 로그인 추가

  // URL의 code를 처리하기 위한 useEffect
  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (code) {
      handleKakaoLogin(); // 카카오 로그인 함수 호출
    }
  }, []);

  //구글 간편 로그인 시작
  const handleGoogleLogin = (credentialResponse: any) => {
    // 구글에서 받은 Credential 디코딩
    let decoded: any;
    try {
      decoded = jwtDecode(credentialResponse.credential);
    } catch (error) {
      console.error("구글 Credential 디코딩 실패:", error);
      alert("구글 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    // 사용자 정보 추출
    const email = decoded.email;
    const name = decoded.name;

    console.log("구글 로그인 성공:", { email, name });

    // Step 1: 사용자 정보를 백엔드로 전달하여 로그인 처리
    axios
      .post(`${SERVER_HOST}/api/login/google`, {
        email,
        name,
        loginType: "google",
      })
      .then((response) => {
        const { accessToken, refreshToken } = response.data;

        // Step 2: 로그인 상태 업데이트
        const loginState = {
          isLoggedIn: true,
          email: email,
          loginType: "google",
          loginToken: accessToken,
          refreshToken: refreshToken, // RefreshToken 저장
        };

        // Jotai 상태 업데이트
        setLoginState(loginState);

        // LocalStorage에 저장
        localStorage.setItem("loginState", JSON.stringify(loginState));
      })
      .then(() => {
        // Step 3: 성공 메시지 및 페이지 이동
        alert(`${name}님 환영합니다!`);
        navigate("/template");
      })
      .catch((error) => {
        // 에러 처리
        console.error("구글 로그인 처리 중 오류:", error);
        alert("구글 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      });
  }; //구글 간편 로그인 끝

  // 카카오 간편 로그인 시작
  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID; // 카카오에서 발급받은 Client ID
    const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI; // 카카오에서 등록한 Redirect URI
    const code = new URL(window.location.href).searchParams.get("code"); // URL에서 code 추출

    if (!code) {
      // 카카오 로그인 화면으로 이동
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code&prompt=login`;
      window.location.href = kakaoAuthUrl;
      return;
    }

    axios
      // Step 1: 카카오 서버에서 Access Token 발급
      .post("https://kauth.kakao.com/oauth/token", null, {
        params: {
          grant_type: "authorization_code",
          client_id: KAKAO_CLIENT_ID,
          redirect_uri: KAKAO_REDIRECT_URI,
          code: code,
        },
      })
      .then((tokenResponse) => {
        const accessToken = tokenResponse.data.access_token; // 발급된 Access Token

        // Step 2: 사용자 정보 가져오기
        return axios
          .get("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          .then((userInfoResponse) => {
            const { id, properties, kakao_account } = userInfoResponse.data; // 사용자 정보
            const email = kakao_account.email || `${id}@kakao.com`; // 이메일이 없으면 ID 기반으로 생성
            const nickname = properties.nickname; // 사용자 닉네임

            // Step 3: 사용자 정보를 서버로 전달 (DB 저장/갱신 요청)
            return axios
              .post(`${SERVER_HOST}/api/login/kakao`, {
                email,
                name: nickname,
                loginType: "kakao", // 간편 로그인 타입 전달
                token: accessToken,
              })
              .then((serverResponse) => {
                const { accessToken, refreshToken } = serverResponse.data;

                // Step 4: 로그인 상태 업데이트
                const loginState = {
                  isLoggedIn: true,
                  email: email,
                  loginType: "kakao", //카카오 로그인
                  loginToken: accessToken,
                  refreshToken: refreshToken, // RefreshToken 저장
                };

                // Jotai 상태 업데이트
                setLoginState(loginState);

                // LocalStorage에 저장
                localStorage.setItem("loginState", JSON.stringify(loginState));

                // 서버 응답 처리
                console.log("로그인 성공:", serverResponse.data.message);

                // 로그인 성공 메시지 표시
                alert(`${nickname}님 환영합니다!`);

                // Step 5: URL의 code 제거
                window.history.replaceState(null, "", "/login");

                // 성공 후 페이지 이동
                navigate("/template");
              });
          });
      })
      .catch((error) => {
        // 각 단계에서 발생한 에러 처리
        console.error("카카오 로그인 실패:", error);
        alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
      });
  }; // 카카오 간편 로그인 끝

  //일반 로그인 기능 시작
  const handleLoginClick = (e: React.FormEvent) => {
    e.preventDefault();

    // 입력값 검증
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true); // 로딩 상태 활성화

    // 서버에 로그인 요청
    axios
      .post(`${SERVER_HOST}/api/login`, {
        email: email,
        password: password,
      })
      .then((response) => {
        const { nickname, token } = response.data;

        // 로그인 성공 메시지
        alert(`[ ${nickname} ]님 로그인에 성공했습니다!`);

        // 로그인 상태 업데이트
        const loginState = {
          isLoggedIn: true,
          email: email,
          loginType: "normal", //일반 로그인
          loginToken: token,
          refreshToken: "", // 일반 로그인은 RefreshToken이 없을 수도 있음
        };

        // Jotai 상태 업데이트
        setLoginState(loginState);

        // LocalStorage에 저장
        localStorage.setItem("loginState", JSON.stringify(loginState));

        // 성공 후 페이지 이동
        navigate("/template");
      })
      .catch((error) => {
        if (error.response) {
          console.error("서버 오류:", error.response.data.message);
          alert(error.response.data.message || "로그인 실패");
        } else {
          console.error("요청 오류:", error.message);
          alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
        }

        // 로그인 실패 시 비밀번호 초기화
        setPassword("");
      })
      .finally(() => {
        setIsLoading(false); // 로딩 상태 비활성화
      });
  }; //일반 로그인 기능 끝

  return (
    <Style>
      <div className="login-form">
        {/* 타이틀 */}
        <div className="title">
          <h1>여행갈래?</h1>
          <p>세상에서 가장 간단한 계획서</p>
        </div>

        {/* 아이디 입력 */}
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
              <EmailIcon
                sx={{
                  color: "black",
                  transform: "scale(1.5)",
                  marginRight: "20px",
                }}
              />
            </InputAdornment>
          }
        />

        <div className="wrapper">
          {/* 비밀번호 입력 */}
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
            // 비밀번호 보임/안보임
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

          {/* 버튼과 체크박스 */}
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
                label={
                  <Typography sx={{ fontSize: "1em" }}>이메일 저장</Typography>
                }
                sx={{
                  color: "white",
                }}
              />

              {/* 로그인 상태 유지는 다음 학기에 추가 예정 */}
              {/* <FormControlLabel
                control={
                  <Checkbox
                    size="large"
                    sx={{
                      color: "#EBEBEB",
                      transform: "translateX(5px)",
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "1em" }}>
                    로그인 상태 유지
                  </Typography>
                }
                sx={{
                  color: "white",
                  transform: "translate(-5px, 6px)",
                }}
              /> */}
            </div>
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

        {/* 회원가입 링크 */}
        <p className="register">
          계정이 아직 없으신가요? <Link to="/register">회원가입</Link>
        </p>

        {/* 소셜 로그인 */}
        <div className="social-login">
          <IconButton onClick={handleKakaoLogin}>
            <Avatar src={KakaoIcon} sx={{ width: "60px", height: "60px" }} />
          </IconButton>
          <IconButton
            onClick={() => {
              google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleLogin,
              });
              google.accounts.id.prompt();
            }}
          >
            <Avatar
              src={GoogleIcon}
              sx={{ width: "60px", height: "60px", cursor: "pointer" }}
            />
          </IconButton>
        </div>
      </div>
    </Style>
  );
};

export default Login;
