import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "../assets/images/google.png";
import KakaoIcon from "../assets/images/kakao.png";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useAtomValue, useSetAtom } from "jotai";
import { wannaTripLoginStateAtom, kakaoLoginStateAtom } from "../state";
import { jwtDecode } from "jwt-decode";

import { getCsrfToken } from "../utils/axiosInstance";
import { theme } from "../utils/theme";
import OutlinedTextField from "../components/OutlinedTextField";
import PlainLink from "../components/PlainLinkProps";
import SectionHeader from "../components/SectionHeader";
import {
  getKakaoToken,
  googleLogin,
  handleAccountLinking,
  kakaoLogin,
  normalLogin,
  processLoginSuccess,
} from "../utils/loginUtils";

const Login = () => {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 로그인 된 상태면 템플릿 페이지로 이동
  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);
  if (wannaTripLoginState.isLoggedIn) {
    // navigate("/template");
    navigate("/userTemplates");
  }

  // 로그인 기능 추가
  const [email, setEmail] = useState(""); // 이메일 값
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  const [isEmailSaved, setIsEmailSaved] = useState(false); // 이메일 저장 여부
  const [isLoginStateSave, setIsLoginStateSave] = useState(false); // 로그인 상태 유지 여부
  const setWannaTripLoginState = useSetAtom(wannaTripLoginStateAtom); // 로그인 상태

  // 카카오 간편 로그인
  const kakaoLoginState = useAtomValue(kakaoLoginStateAtom);
  const setKakaoLoginState = useSetAtom(kakaoLoginStateAtom);

  // 이메일 입력값 변경
  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newEmail = event.target.value;
      setEmail(newEmail);

      if (isEmailSaved) {
        localStorage.setItem("savedEmail", newEmail); // 저장된 이메일 업데이트
      }
    },
    [isEmailSaved]
  );

  // 초기화: 이메일 저장 상태 불러오기
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setIsEmailSaved(true);
    }
  }, []);

  // 비밀번호 입력값 변경
  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    []
  );

  // 비밀번호 표시/숨김 변경
  const handlePasswordVisibilityChange = useCallback(() => {
    setIsPasswordVisible(!isPasswordVisible);
  }, [isPasswordVisible]);

  // 구글 간편 로그인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google = (window as any).google; // 구글 간편 로그인 추가

  // 구글 로그인 콜백 리팩토링
  const googleLoginCallback = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (credentialResponse: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let decoded: any;
      try {
        // 1. 구글 인증 정보 디코딩
        try {
          decoded = jwtDecode(credentialResponse.credential);
        } catch (error) {
          console.error("구글 Credential 디코딩 실패:", error);
          alert("구글 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
          return;
        }

        const googleEmail = decoded.email;
        const googleName = decoded.name;

        // 2. 구글 로그인 API 호출
        const response = await googleLogin(googleEmail, googleName);

        // 3. 계정 연동 필요 확인
        if (response.data.accountExists) {
          // 계정 연동 처리
          const linkingResult = await handleAccountLinking({
            existingType: response.data.existingLoginType,
            email: response.data.email,
            socialInfo: response.data.socialInfo,
            csrfToken: await getCsrfToken(),
          });

          // 연동 성공 시 로그인 처리
          if (linkingResult.success && linkingResult.data) {
            processLoginSuccess(
              linkingResult.data,
              setWannaTripLoginState,
              true,
              { email: response.data.email }
            );

            alert(`계정 연동 성공! ${linkingResult.data.name}님 환영합니다!`);
            // navigate("/template");
            navigate("/userTemplates");
          }
          return;
        }

        // 4. 일반 로그인 처리
        const loginState = processLoginSuccess(
          response.data,
          setWannaTripLoginState,
          true,
          { email: googleEmail, loginType: "google" }
        );

        alert(`${loginState.userName}님 환영합니다!`);
        // navigate("/template");
        navigate("/userTemplates");
      } catch (error) {
        console.error("구글 로그인 처리 중 오류:", error);
        alert("구글 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    },
    [navigate, setWannaTripLoginState]
  );

  // 구글 로그인 버튼 클릭 시 호출
  const handleGoogleLogin = useCallback(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: googleLoginCallback,
    });
    google.accounts.id.prompt();
  }, [google.accounts.id, googleLoginCallback]);

  // 카카오 간편 로그인
  const handleKakaoLogin = useCallback(async () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

    const code = kakaoLoginState;

    if (!code) {
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code&prompt=login`;
      window.location.href = kakaoAuthUrl;
      return;
    }

    try {
      // 1. 카카오 토큰 요청 (loginUtils의 getKakaoToken 함수 사용)
      const tokenResponse = await getKakaoToken(code);
      const accessToken = tokenResponse.data.access_token;

      // 2. 카카오 로그인 요청 (loginUtils의 kakaoLogin 함수 사용)
      const serverResponse = await kakaoLogin(accessToken);

      // 3. 계정 연동 필요 확인
      if (serverResponse.data.accountExists) {
        // 계정 연동 처리 (loginUtils의 handleAccountLinking 함수 사용)
        const linkingResult = await handleAccountLinking({
          existingType: serverResponse.data.existingLoginType,
          email: serverResponse.data.email,
          socialInfo: serverResponse.data.socialInfo,
          csrfToken: await getCsrfToken(),
        });

        // 연동 성공 시 로그인 처리
        if (linkingResult.success && linkingResult.data) {
          processLoginSuccess(
            linkingResult.data,
            setWannaTripLoginState,
            true,
            { email: serverResponse.data.email }
          );

          alert(`계정 연동 성공! ${linkingResult.data.name}님 환영합니다!`);
          // navigate("/template");
          navigate("/userTemplates");
        }
        return;
      }

      // 4. 일반 로그인 처리
      const loginState = processLoginSuccess(
        serverResponse.data,
        setWannaTripLoginState,
        true,
        { email: serverResponse.data.email || "", loginType: "kakao" }
      );

      window.history.replaceState(null, "", "/login");
      alert(`[ ${loginState.userName} ]님 환영합니다!`);
      // navigate("/template");
      navigate("/userTemplates");
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
      setKakaoLoginState(""); // 오류 시 상태 초기화
      alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  }, [kakaoLoginState, navigate, setKakaoLoginState, setWannaTripLoginState]);

  // 카카오 로그인 상태 초기화
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      setKakaoLoginState(code);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [setKakaoLoginState]);

  // 카카오 로그인 상태 변경 시 로그인 처리
  useEffect(() => {
    if (kakaoLoginState) {
      handleKakaoLogin();
    }
  }, [handleKakaoLogin, kakaoLoginState]);

  // 로그인 상태 유지/해제
  const handleLoginStateSaveChange = useCallback(() => {
    setIsLoginStateSave((prev) => !prev);
  }, []);

  // 일반 로그인 기능
  const handleLoginButtonClick = useCallback(async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      // 1. 일반 로그인 요청 (loginUtils의 normalLogin 함수 사용)
      const response = await normalLogin(email, password);

      // 2. 로그인 성공 처리 (loginUtils의 processLoginSuccess 함수 사용)
      const loginState = processLoginSuccess(
        response.data,
        setWannaTripLoginState,
        isLoginStateSave, // 로그인 상태 유지 옵션에 따라 저장 방식 결정
        { email, loginType: "normal" }
      );

      alert(`[ ${loginState.userName} ]님 환영합니다!`);
      // navigate("/template");
      navigate("/userTemplates");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("서버 오류:", error.response.data.message);
        alert(error.response.data.message || "로그인 실패");
      } else {
        console.error("요청 오류:", (error as Error).message);
        alert("예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.");
      }

      setPassword("");
    }
  }, [email, isLoginStateSave, navigate, password, setWannaTripLoginState]);

  return (
    <Container maxWidth="xs">
      <Stack minHeight="100vh" justifyContent="center">
        <Stack gap={8}>
          {/* 로고 링크 버튼 */}
          <PlainLink to="/">
            <Typography variant="h3" color="primary" textAlign="center">
              Wanna Trip
            </Typography>
          </PlainLink>

          <Stack gap={1}>
            {/* 로그인 헤더 */}
            <SectionHeader title="로그인" />

            {/* 아이디 입력란 */}
            <Box mt={1}>
              <OutlinedTextField
                label="아이디(이메일)"
                value={email}
                onChange={handleEmailChange}
              />
            </Box>

            {/* 비밀번호 입력란 */}
            <OutlinedTextField
              label="비밀번호"
              value={password}
              onChange={handlePasswordChange}
              type={isPasswordVisible ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handlePasswordVisibilityChange}
                    edge="end"
                  >
                    {isPasswordVisible ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />

            {/* 로그인 상태 유지 체크박스 */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    name="로그인 상태 유지"
                    checked={isLoginStateSave}
                    onChange={handleLoginStateSaveChange}
                  />
                }
                label="로그인 상태 유지"
              />
            </Box>

            {/* 로그인 버튼 */}
            <Button variant="contained" onClick={handleLoginButtonClick}>
              <Typography variant="h5">로그인</Typography>
            </Button>

            <Stack direction="row">
              <Stack direction="row" gap={1} alignItems="center">
                {/* 아이디 찾기 링크 */}
                <PlainLink to="/">
                  <Typography color="divider">아이디 찾기</Typography>
                </PlainLink>

                <Box
                  width="1px"
                  height="60%"
                  borderRadius="50px"
                  sx={{
                    background: theme.palette.divider,
                  }}
                />

                {/* 비밀번호 찾기 링크 */}
                <PlainLink to="/">
                  <Typography color="divider">비밀번호 찾기</Typography>
                </PlainLink>
              </Stack>

              {/* 회원가입 링크 */}
              <Box flex={1} display="flex" justifyContent="flex-end">
                <PlainLink to="/register">
                  <Typography color="divider">회원가입</Typography>
                </PlainLink>
              </Box>
            </Stack>
          </Stack>

          <Stack gap={4}>
            {/* 간편 로그인 구분선 */}
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                flex={1}
                height="1px"
                borderRadius="50px"
                sx={{
                  background: theme.palette.divider,
                }}
              />
              <Typography>간편 로그인</Typography>
              <Box
                flex={1}
                height="1px"
                borderRadius="50px"
                sx={{
                  background: theme.palette.divider,
                }}
              />
            </Stack>

            {/* 간편 로그인 버튼 */}
            <Stack direction="row" justifyContent="center" gap={8}>
              {[
                {
                  src: KakaoIcon,
                  alt: "카카오 로그인",
                  onClick: handleKakaoLogin,
                },
                {
                  src: GoogleIcon,
                  alt: "구글 로그인",
                  onClick: handleGoogleLogin,
                },
              ].map(({ src, alt, onClick }, index) => (
                <Box key={`social-login-${index}`}>
                  <IconButton
                    disableRipple
                    onClick={onClick}
                    sx={{
                      padding: 0,
                    }}
                  >
                    <Box component="img" width="60px" src={src} alt={alt} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Login;
