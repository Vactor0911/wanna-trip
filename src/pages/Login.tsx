import { useState, useEffect, useCallback, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
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
import {
  wannaTripLoginStateAtom,
  kakaoLoginStateAtom,
  Permission,
} from "../state";
import { jwtDecode } from "jwt-decode";

import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { setAccessToken } from "../utils/accessToken";
import { theme } from "../utils";
import OutlinedTextField from "../components/OutlinedTextField";

// 링크 컴포넌트
interface StyledLinkProps {
  to: string;
  children: ReactNode;
}

const StyledLink = (props: StyledLinkProps) => {
  const { to, children, ...others } = props;

  return (
    <Link
      to={to}
      {...others}
      css={{
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 로그인 된 상태면 템플릿 페이지로 이동
  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);
  if (wannaTripLoginState.isLoggedIn) {
    navigate("/template");
  }

  // 로그인 기능 추가
  const [email, setEmail] = useState(""); // 이메일 값
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  const [isEmailSaved, setIsEmailSaved] = useState(false); // 이메일 저장 여부
  const [isLoading, setIsLoading] = useState(false); // 로그인 로딩 상태 추가

  const [isLoginStateSave, setIsLoginStateSave] = useState(false); // 로그인 상태 유지 여부
  const setWannaTripLoginState = useSetAtom(wannaTripLoginStateAtom); // 로그인 상태

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
  const google = (window as any).google; // 구글 간편 로그인 추가

  const googleLoginCallback = useCallback(
    async (credentialResponse: any) => {
      let decoded: any;
      try {
        decoded = jwtDecode(credentialResponse.credential);
      } catch (error) {
        console.error("구글 Credential 디코딩 실패:", error);
        alert("구글 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        return;
      }

      const googleEmail = decoded.email;
      const googleName = decoded.name;

      try {
        const csrfToken = await getCsrfToken();
        const response = await axiosInstance.post(
          "/api/auth/login/google",
          { googleEmail, googleName },
          { headers: { "X-CSRF-Token": csrfToken } }
        );

        const { accessToken, permissions, name, userUuid } = response.data;
        setAccessToken(accessToken);

        let enumPermission = Permission.USER;
        switch (permissions) {
          case "admin":
            enumPermission = Permission.ADMIN;
            break;
          case "superadmin":
            enumPermission = Permission.SUPER_ADMIN;
            break;
        }

        const newWannaTriploginState = {
          isLoggedIn: true,
          userUuid: userUuid,
          email: email,
          name: name,
          loginType: "google",
          permission: enumPermission,
        };

        setWannaTripLoginState(newWannaTriploginState);
        localStorage.setItem(
          "WannaTriploginState",
          JSON.stringify(newWannaTriploginState)
        );

        alert(`${name}님 환영합니다!`);
        navigate("/template");
      } catch (error) {
        console.error("구글 로그인 처리 중 오류:", error);
        alert("구글 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    },
    [email, navigate, setWannaTripLoginState]
  );

  const handleGoogleLogin = useCallback(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: googleLoginCallback,
    });
    google.accounts.id.prompt();
  }, [google.accounts.id, googleLoginCallback]);

  // 카카오 간편 로그인
  const kakaoLoginState = useAtomValue(kakaoLoginStateAtom);
  const setKakaoLoginState = useSetAtom(kakaoLoginStateAtom);

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
      const tokenResponse = await axios.post(
        "https://kauth.kakao.com/oauth/token",
        null,
        {
          params: {
            grant_type: "authorization_code",
            client_id: KAKAO_CLIENT_ID,
            redirect_uri: KAKAO_REDIRECT_URI,
            code,
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;
      const csrfToken = await getCsrfToken();
      const serverResponse = await axiosInstance.post(
        "/api/auth/login/kakao",
        { KaKaoAccessToken: accessToken },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      const {
        accessToken: serverAccessToken,
        userUuid,
        permissions,
        name,
      } = serverResponse.data;
      setAccessToken(serverAccessToken);

      let enumPermission = Permission.USER;
      switch (permissions) {
        case "admin":
          enumPermission = Permission.ADMIN;
          break;
        case "superadmin":
          enumPermission = Permission.SUPER_ADMIN;
          break;
      }

      const newWannaTriploginState = {
        isLoggedIn: true,
        userUuid: userUuid,
        email: email,
        name: name,
        loginType: "kakao",
        permission: enumPermission,
      };

      setWannaTripLoginState(newWannaTriploginState);
      localStorage.setItem(
        "WannaTriploginState",
        JSON.stringify(newWannaTriploginState)
      );

      window.history.replaceState(null, "", "/login");
      alert(`[ ${name} ]님 환영합니다!`);
      navigate("/template");
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
      alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  }, [email, kakaoLoginState, navigate, setWannaTripLoginState]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      setKakaoLoginState(code);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [setKakaoLoginState]);

  useEffect(() => {
    if (kakaoLoginState) {
      handleKakaoLogin();
    }
  }, [handleKakaoLogin, kakaoLoginState]);

  // 로그인 상태 유지/해제
  const handleLoginStateSaveChange = useCallback(() => {
    setIsLoginStateSave((prev) => !prev);
  }, []);

  // 일반 로그인 기능 시작
  const handleLoginButtonClick = useCallback(async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const csrfToken = await getCsrfToken();
      const response = await axiosInstance.post(
        "/api/auth/login",
        { email: email, password: password },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      const { name, userUuid, permissions } = response.data;
      setAccessToken(response.data.accessToken);

      let enumPermission = Permission.USER;
      switch (permissions) {
        case "admin":
          enumPermission = Permission.ADMIN;
          break;
        case "superadmin":
          enumPermission = Permission.SUPER_ADMIN;
          break;
      }

      const newWannaTriploginState = {
        isLoggedIn: true,
        userUuid: userUuid,
        email: email,
        name: name,
        loginType: "normal",
        permission: enumPermission,
      };

      setWannaTripLoginState(newWannaTriploginState);

      if (isLoginStateSave) {
        localStorage.setItem(
          "WannaTriploginState",
          JSON.stringify(newWannaTriploginState)
        );
      } else {
        sessionStorage.setItem(
          "WannaTriploginState",
          JSON.stringify(newWannaTriploginState)
        );
      }

      alert(`[ ${name} ]님 환영합니다!`);
      navigate("/template");
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
          <StyledLink to="/">
            <Typography variant="h3" color="primary" textAlign="center">
              Wanna Trip
            </Typography>
          </StyledLink>

          <Stack gap={1}>
            {/* 로그인 헤더 */}
            <Stack>
              <Typography
                variant="h6"
                display="inline"
                alignSelf="flex-start"
                padding="6px 32px"
                position="relative"
                sx={{
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    left: "0",
                    bottom: "-2.4px",
                    width: "100%",
                    height: "2.4px",
                    background: theme.palette.primary.main,
                    borderTopLeftRadius: "50px",
                    borderBottomLeftRadius: "50px",
                    zIndex: 2,
                  },
                }}
              >
                로그인
              </Typography>
              <Divider />
            </Stack>

            {/* 아이디 입력란 */}
            <OutlinedTextField label="아이디(이메일)" />

            {/* 비밀번호 입력란 */}
            <Box mt={1}>
              <OutlinedTextField
                label="비밀번호"
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
            </Box>

            {/* 로그인 상태 유지 체크박스 */}
            <Box>
              <FormControlLabel
                control={<Checkbox name="로그인 상태 유지" />}
                label="로그인 상태 유지"
              />
            </Box>

            {/* 로그인 버튼 */}
            <Button variant="contained">
              <Typography variant="h5">로그인</Typography>
            </Button>

            <Stack direction="row">
              <Stack direction="row" gap={1} alignItems="center">
                {/* 아이디 찾기 링크 */}
                <StyledLink to="/">
                  <Typography color="divider">아이디 찾기</Typography>
                </StyledLink>

                <Box
                  width="1px"
                  height="60%"
                  borderRadius="50px"
                  sx={{
                    background: theme.palette.divider,
                  }}
                />

                {/* 비밀번호 찾기 링크 */}
                <StyledLink to="/">
                  <Typography color="divider">비밀번호 찾기</Typography>
                </StyledLink>
              </Stack>

              {/* 회원가입 링크 */}
              <Box flex={1} display="flex" justifyContent="flex-end">
                <StyledLink to="/register">
                  <Typography color="divider">회원가입</Typography>
                </StyledLink>
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
