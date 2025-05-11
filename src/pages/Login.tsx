import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Stack,
  Typography,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Avatar,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "../assets/images/google.png";
import KakaoIcon from "../assets/images/kakao.png";

import axios from "axios";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { setAccessToken } from "../utils/accessToken";
import { useAtomValue, useSetAtom } from "jotai";
import {
  wannaTripLoginStateAtom,
  kakaoLoginStateAtom,
  Permission,
} from "../state";
import { jwtDecode } from "jwt-decode";

// Login 컴포넌트
const Login: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [email, setEmail] = useState<string>(""); // 이메일 입력값
  const [password, setPassword] = useState<string>(""); // 비밀번호 입력값
  const [showPassword, setShowPassword] = useState<boolean>(false); // 비밀번호 보임/숨김 상태
  const [isEmailSaved, setIsEmailSaved] = useState<boolean>(false); // 이메일 저장 여부
  const [isLoginStateSave, setIsLoginStateSave] = useState<boolean>(false); // 로그인 상태 유지 여부
  const [isLoading, setIsLoading] = useState<boolean>(false); // 로딩 상태

  // Jotai 상태 관리
  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);
  const setWannaTripLoginState = useSetAtom(wannaTripLoginStateAtom);
  const kakaoLoginState = useAtomValue(kakaoLoginStateAtom);
  const setKakaoLoginState = useSetAtom(kakaoLoginStateAtom);

  // 로그인 상태 확인 후 리다이렉트
  useEffect(() => {
    if (wannaTripLoginState.isLoggedIn) {
      navigate("/template");
    }
  }, [wannaTripLoginState.isLoggedIn, navigate]);

  // 이메일 저장 상태 초기화
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setIsEmailSaved(true);
    }
  }, []);

  // 이메일 입력 처리
  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newEmail = event.target.value;
      setEmail(newEmail);
      if (isEmailSaved) {
        localStorage.setItem("savedEmail", newEmail);
      }
    },
    [isEmailSaved]
  );

  // 비밀번호 입력 처리
  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    []
  );

  // 비밀번호 보임/숨김 토글 처리
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // 이메일 저장 체크박스 처리
  const handleEmailSaveChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      setIsEmailSaved(isChecked);
      if (isChecked) {
        localStorage.setItem("savedEmail", email);
      } else {
        localStorage.removeItem("savedEmail");
      }
    },
    [email]
  );

  // 로그인 상태 유지 체크 처리
  const handleLoginStateSaveChange = useCallback(() => {
    setIsLoginStateSave((prev) => !prev);
  }, []);

  // 일반 로그인 처리
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
        { email, password },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      const { name, userUuid, permissions, accessToken } = response.data;
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

      const newWannaTripLoginState = {
        isLoggedIn: true,
        userUuid,
        email,
        name,
        loginType: "normal",
        permission: enumPermission,
      };

      setWannaTripLoginState(newWannaTripLoginState);

      if (isLoginStateSave) {
        localStorage.setItem(
          "WannaTripLoginState",
          JSON.stringify(newWannaTripLoginState)
        );
      } else {
        sessionStorage.setItem(
          "WannaTripLoginState",
          JSON.stringify(newWannaTripLoginState)
        );
      }

      alert(`[ ${name} ]님 환영합니다!`);
      navigate("/template");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.message || "로그인 실패");
      } else {
        alert("예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.");
      }
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLoginStateSave, navigate, setWannaTripLoginState]);

  // 구글 로그인 처리
  const google = (window as any).google;

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

        const newWannaTripLoginState = {
          isLoggedIn: true,
          userUuid,
          email: googleEmail,
          name,
          loginType: "google",
          permission: enumPermission,
        };

        setWannaTripLoginState(newWannaTripLoginState);
        localStorage.setItem(
          "WannaTripLoginState",
          JSON.stringify(newWannaTripLoginState)
        );

        alert(`${name}님 환영합니다!`);
        navigate("/template");
      } catch (error) {
        console.error("구글 로그인 처리 중 오류:", error);
        alert("구글 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    },
    [navigate, setWannaTripLoginState]
  );

  const handleGoogleLogin = useCallback(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: googleLoginCallback,
    });
    google.accounts.id.prompt();
  }, [googleLoginCallback]);

  // 카카오 로그인 처리
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

      const newWannaTripLoginState = {
        isLoggedIn: true,
        userUuid,
        email,
        name,
        loginType: "kakao",
        permission: enumPermission,
      };

      setWannaTripLoginState(newWannaTripLoginState);
      localStorage.setItem(
        "WannaTripLoginState",
        JSON.stringify(newWannaTripLoginState)
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
        spacing={2}
        sx={{
          width: { xs: "90%", sm: "60%", md: "400px" },
        }}
      >
        {/* 로그인 타이틀 */}
        <Box sx={{ position: "relative", mb: 2 }}>
          <Typography
            variant="h6"
            color="text.primary"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            로그인
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: "2px",
              background: "linear-gradient(to right, #3288FF 20%, #ccc 20%)",
              position: "absolute",
              bottom: 0,
              left: 0,
            }}
          />
        </Box>

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
            borderRadius: "10px",
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
          type={showPassword ? "text" : "password"}
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
              <IconButton onClick={handleTogglePassword}>
                {showPassword ? (
                  <VisibilityIcon sx={{ color: "#666" }} />
                ) : (
                  <VisibilityOffIcon sx={{ color: "#666" }} />
                )}
              </IconButton>
            </InputAdornment>
          }
          sx={{
            borderRadius: "10px",
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
        >
          <Stack direction="row" spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isEmailSaved}
                  onChange={handleEmailSaveChange}
                  color="primary"
                  sx={{ padding: "4px" }}
                />
              }
              label="이메일 저장"
              sx={{
                color: "text.secondary",
                "& .MuiTypography-root": { fontSize: "14px" },
              }}
            />
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
