import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
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
  }, [googleLoginCallback]);

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
    <Stack
      minHeight="100vh"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundColor: "#fff",
        padding: 2,
      }}
    >
      {/* 로고 섹션 */}
      <Typography variant="h3" color="#3288FF" fontWeight="bold" sx={{ mb: 4 }}>
        Wanna Trip
      </Typography>

      {/* 로그인 폼 섹션 */}
      <Stack
        gap={2}
        sx={{
          width: { xs: "90%", sm: "60%", md: "400px" },
        }}
      >
        <Stack display="flex" justifyContent="space-between">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="20%"
          >
            <Typography
              color="text.primary"
              fontWeight="bold"
              fontSize={"15px"}
            >
              로그인
            </Typography>
          </Box>
          <Box width="80%" />

          <Box
            sx={{
              width: "100%",
              height: "2px",
              mt: 1,
              background: "linear-gradient(to right, #3288FF 20%, #ccc 20%)",
            }}
          />
        </Stack>

        {/* 로그인 입력 섹션 */}
        <Stack gap={1}>
          {/* 이메일 입력 필드 */}
          <OutlinedInput
            fullWidth
            type="email"
            placeholder="이메일(아이디)"
            value={email}
            onChange={handleEmailChange}
            startAdornment={
              <InputAdornment position="start">
                <EmailIcon sx={{ color: "#666" }} />
              </InputAdornment>
            }
            sx={{
              borderRadius: "7px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              "&:hover": {
                borderColor: "#3288FF",
              },
              "&.Mui-focused": {
                borderColor: "#3288FF",
              },
              "& .MuiInputBase-input": {
                padding: "12px 14px",
              },
            }}
          />

          {/* 비밀번호 입력 필드 */}

          <OutlinedInput
            fullWidth
            type={isPasswordVisible ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={handlePasswordChange}
            startAdornment={
              <InputAdornment position="start">
                <LockIcon sx={{ color: "#666" }} />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handlePasswordVisibilityChange}>
                  {" "}
                  {/* handleTogglePassword 대신 handlePasswordVisibilityChange 사용 */}
                  {isPasswordVisible ? (
                    <VisibilityIcon sx={{ color: "#666" }} />
                  ) : (
                    <VisibilityOffIcon sx={{ color: "#666" }} />
                  )}
                </IconButton>
              </InputAdornment>
            }
            sx={{
              borderRadius: "7px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              "&:hover": {
                borderColor: "#3288FF",
              },
              "&.Mui-focused": {
                borderColor: "#3288FF",
              },
              "& .MuiInputBase-input": {
                padding: "12px 14px",
              },
            }}
          />

          {/* 체크박스 섹션 */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            ml={1}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={isLoginStateSave}
                  onChange={handleLoginStateSaveChange}
                  color="primary"
                  sx={{ padding: "4px" }}
                />
              }
              label="로그인 상태 유지"
              sx={{
                color: "text.secondary",
                "& .MuiTypography-root": { fontSize: "14px" },
              }}
            />
          </Stack>
        </Stack>

        {/* 로그인 버튼 */}
        <Button
          variant="contained"
          onClick={handleLoginButtonClick}
          disabled={isLoading}
          sx={{
            borderRadius: "10px",
            padding: "12px 0",
            backgroundColor: "#3288FF",
            "&:hover": {
              backgroundColor: "#2a77e0",
            },
          }}
        >
          <Typography
            variant="h6"
            color="white"
            fontWeight="bold"
            sx={{ fontSize: "18px" }}
          >
            로그인
          </Typography>
        </Button>

        {/* 링크 섹션 (아이디 찾기, 비밀번호 찾기, 회원가입) */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          <Stack direction="row" spacing={1}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
                fontSize: "14px",
              }}
            >
              아이디 찾기
            </Typography>
            <Typography variant="body2" color="text.secondary" fontSize="14px">
              |
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
                fontSize: "14px",
              }}
            >
              비밀번호 찾기
            </Typography>
          </Stack>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
                fontSize: "14px",
              }}
            >
              회원가입
            </Typography>
          </Link>
        </Stack>
      </Stack>

      {/* 구분선 - "간편 로그인" */}
      <Box
        sx={{ display: "flex", alignItems: "center", width: "400px", my: 3 }}
      >
        <Box sx={{ flexGrow: 1, height: "1px", backgroundColor: "#ccc" }} />
        <Typography
          variant="body2"
          color="text.secondary"
          fontSize="14px"
          sx={{ mx: 1 }}
        >
          간편 로그인
        </Typography>
        <Box sx={{ flexGrow: 1, height: "1px", backgroundColor: "#ccc" }} />
      </Box>

      {/* 간편 로그인 버튼 */}
      <Stack direction="row" justifyContent="center" gap={2}>
        {/* 카카오 로그인 버튼 */}
        <IconButton onClick={handleKakaoLogin}>
          <Avatar
            src={KakaoIcon}
            alt="Kakao"
            sx={{
              width: {
                xs: "50px",
                sm: "60px",
              },
              height: {
                xs: "50px",
                sm: "60px",
              },
            }}
          />
        </IconButton>

        {/* 구글 로그인 버튼 */}
        <IconButton onClick={handleGoogleLogin}>
          <Avatar
            src={GoogleIcon}
            alt="Google"
            sx={{
              width: {
                xs: "50px",
                sm: "60px",
              },
              height: {
                xs: "50px",
                sm: "60px",
              },
            }}
          />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default Login;
