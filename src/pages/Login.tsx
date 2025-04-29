import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import BackgroundImage from "../assets/images/background.png";
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

import { useAtomValue, useSetAtom } from "jotai"; // useSetAtom 불러오기
import {
  wannaTripLoginStateAtom,
  kakaoLoginStateAtom,
  Permission,
} from "../state"; // WannaTripLoginStateAtom 불러오기
import { jwtDecode } from "jwt-decode"; // named export로 가져오기 // 토큰 디코딩을 위해 설치 필요: npm install jwt-decode - 구글은 필요한 듯

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
  const [, setIsLoading] = useState(false); // 로그인 로딩 상태 추가

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

  // 이메일 저장 체크박스 변경
  const handleEmailSaveChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      setIsEmailSaved(isChecked);

      if (isChecked) {
        localStorage.setItem("savedEmail", email); // 이메일 저장
      } else {
        localStorage.removeItem("savedEmail"); // 저장된 이메일 삭제
      }
    },
    [email]
  );

  // 구글 간편 로그인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google = (window as any).google; // 구글 간편 로그인 추가

  const googleLoginCallback = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (credentialResponse: any) => {
      // 구글에서 받은 Credential 디코딩
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let decoded: any;
      try {
        decoded = jwtDecode(credentialResponse.credential);
      } catch (error) {
        console.error("구글 Credential 디코딩 실패:", error);
        alert("구글 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        return;
      }

      // 사용자 정보 추출
      const googleEmail = decoded.email;
      const googleName = decoded.name;

      try {
        // Step 1: CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();

        // Step 2: 사용자 정보를 백엔드로 전달하여 로그인 처리
        const response = await axiosInstance.post(
          "/api/auth/login/google",
          {
            googleEmail,
            googleName,
          },
          {
            headers: {
              "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
            },
          }
        );

        const { accessToken, permissions, name, userUuid } = response.data;
        setAccessToken(accessToken); // Access Token 업데이트

        let enumPermission = Permission.USER;
        switch (permissions) {
          case "admin":
            enumPermission = Permission.ADMIN;
            break;
          case "superadmin":
            enumPermission = Permission.SUPER_ADMIN;
            break;
        }

        // Step 3: 로그인 상태 업데이트
        const newWannaTriploginState = {
          isLoggedIn: true, // 로그인 상태 boolean
          userUuid: userUuid, // 로그인된 사용자의 UUID
          email: email,
          name: name,
          loginType: "google", // 구글글 로그인
          permission: enumPermission, // 사용자 권한 string
        };

        // Jotai 상태 업데이트
        setWannaTripLoginState(newWannaTriploginState);

        // 일단 구글은 로그인 상태 유지로 저장. 추가적인 기능구현 해야함
        localStorage.setItem(
          "WannaTriploginState",
          JSON.stringify(newWannaTriploginState)
        );

        // Step 4: 성공 메시지 및 페이지 이동
        alert(`${name}님 환영합니다!`);
        navigate("/template");
      } catch (error) {
        // 에러 처리
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
  const kakaoLoginState = useAtomValue(kakaoLoginStateAtom); // 카카오 로그인 코드 상태
  const setKakaoLoginState = useSetAtom(kakaoLoginStateAtom); // 카카오 로그인 코드 상태 업데이트

  const handleKakaoLogin = useCallback(async () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID; // 카카오에서 발급받은 Client ID
    const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI; // 카카오에서 등록한 Redirect URI

    const code = kakaoLoginState; // URL에서 code 추출

    if (!code) {
      // 카카오 로그인 화면으로 이동
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code&prompt=login`;

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
            // 카카오 서버에서 받아야 하는 필수 정보들
            grant_type: "authorization_code",
            client_id: KAKAO_CLIENT_ID,
            redirect_uri: KAKAO_REDIRECT_URI,
            code: code,
          },
        }
      );

      const accessToken = tokenResponse.data.access_token; // 발급된 Access Token

      const csrfToken = await getCsrfToken();

      // Step 3: 사용자 정보를 서버로 전달 (DB 저장/갱신 요청)
      const serverResponse = await axiosInstance.post(
        "/api/auth/login/kakao",
        {
          KaKaoAccessToken: accessToken,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
          },
        }
      );

      const {
        accessToken: serverAccessToken,
        userUuid,
        permissions,
        name,
      } = serverResponse.data;
      setAccessToken(serverAccessToken); // Access Token 업데이트

      let enumPermission = Permission.USER;
      switch (permissions) {
        case "admin":
          enumPermission = Permission.ADMIN;
          break;
        case "superadmin":
          enumPermission = Permission.SUPER_ADMIN;
          break;
      }

      // Step 4: 로그인 상태 업데이트
      const newWannaTriploginState = {
        isLoggedIn: true, // 로그인 상태 boolean
        userUuid: userUuid, // 로그인된 사용자의 UUID
        email: email,
        name: name,
        loginType: "kakao", // 카카오 로그인
        permission: enumPermission, // 사용자 권한 string
      };

      // Jotai 상태 업데이트
      setWannaTripLoginState(newWannaTriploginState);

      // 일단 카카오는 로그인 상태 유지로 저장. 추가적인 기능구현 해야함
      localStorage.setItem(
        "WannaTriploginState",
        JSON.stringify(newWannaTriploginState)
      );

      // Step 5: URL의 code 제거
      window.history.replaceState(null, "", "/login");

      // 로그인 성공 메시지
      alert(`[ ${name} ]님 환영합니다!`);

      // 성공 후 페이지 이동
      navigate("/template");
    } catch (error) {
      // 각 단계에서 발생한 에러 처리
      console.error("카카오 로그인 실패:", error);
      alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  }, [email, kakaoLoginState, navigate, setWannaTripLoginState]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      setKakaoLoginState(code); // 상태에 저장
      // URL의 code 제거 (새로고침이나 공유 대비)
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [setKakaoLoginState]);

  // 카카오 URL내 코드 처리
  useEffect(() => {
    if (kakaoLoginState) {
      handleKakaoLogin(); // 카카오 로그인 함수 호출
    }
  }, [handleKakaoLogin, kakaoLoginState]);

  // 로그인 상태 유지/해제
  const handleLoginStateSaveChange = useCallback(() => {
    setIsLoginStateSave((prev) => !prev);
  }, []);

  // 일반 로그인 기능 시작
  const handleLoginButtonClick = useCallback(async () => {
    // 입력값 검증
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true); // 로딩 상태 활성화

    try {
      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 서버에 로그인 요청
      const response = await axiosInstance.post(
        "/api/auth/login",
        {
          email: email,
          password: password,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
          },
        }
      );

      // Step 3: 로그인 성공 처리
      const { name, userUuid, permissions, accessToken } = response.data;
      setAccessToken(accessToken); // Access Token 저장

      let enumPermission = Permission.USER;
      switch (permissions) {
        case "admin":
          enumPermission = Permission.ADMIN;
          break;
        case "superadmin":
          enumPermission = Permission.SUPER_ADMIN;
          break;
      }

      // 로그인 상태 업데이트
      const newWannaTriploginState = {
        isLoggedIn: true, // 로그인 상태 boolean
        userUuid: userUuid, // 로그인된 사용자의 UUID
        email: email,
        name: name,
        loginType: "normal", // 일반 로그인
        permission: enumPermission, // 사용자 권한 string
      };

      // Jotai 상태 업데이트
      setWannaTripLoginState(newWannaTriploginState);

      //  로그인 상태 유지 체크 시 localStorage, 아니면 sessionStorage 에 저장
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

      // 로그인 성공 메시지
      alert(`[ ${name} ]님 환영합니다!`);

      // 성공 후 페이지 이동
      navigate("/template");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("서버 오류:", error.response.data.message);
        alert(error.response.data.message || "로그인 실패");
      } else {
        console.error("요청 오류:", (error as Error).message);
        alert("예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.");
      }

      // 로그인 실패 시 비밀번호 초기화
      setPassword("");
    }
  }, [email, isLoginStateSave, navigate, password, setWannaTripLoginState]);
  // 일반 로그인 기능 끝

  return (
    <Stack
      minHeight="100vh"
      direction="row"
      justifyContent="center"
      alignItems="center"
      position="relative"
      padding={2}
      gap={{
        md: 10,
        lg: 20,
      }}
    >
      <Box
        component="img"
        src={BackgroundImage}
        alt="logo"
        width={{
          xs: "75%",
          sm: "60%",
          md: "40%",
        }}
        maxWidth="600px"
        position={{
          xs: "absolute",
          md: "relative",
        }}
        zIndex={-1}
        sx={{
          aspectRatio: "1/1",
          opacity: {
            xs: "0.25",
            md: "1",
          },
        }}
      />

      <Stack
        width={{
          xs: "90%",
          sm: "60%",
          md: "50%",
        }}
        maxWidth="500px"
        justifyContent="center"
        gap={2}
      >
        <Stack>
          {/* 제목 */}
          <Typography variant="h1" color="white">
            여행갈래?
          </Typography>
          <Typography variant="h2" color="white" fontWeight={500}>
            세상에서 가장 간단한 계획서
          </Typography>
        </Stack>

        {/* 이메일 입력란 */}
        <OutlinedInput
          fullWidth
          type="email"
          placeholder="이메일"
          value={email}
          onChange={handleEmailChange}
          required
          startAdornment={
            <InputAdornment position="start">
              <EmailIcon />
            </InputAdornment>
          }
          sx={{
            borderRadius: "10px",
            background: "white",
          }}
        />

        {/* 비밀번호 입력란 */}
        <OutlinedInput
          fullWidth
          type={isPasswordVisible ? "text" : "password"}
          placeholder="비밀번호"
          value={password}
          onChange={handlePasswordChange}
          required
          startAdornment={
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handlePasswordVisibilityChange}>
                {isPasswordVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </InputAdornment>
          }
          sx={{
            borderRadius: "10px",
            background: "white",
          }}
        />

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          gap={2}
          justifyContent="space-between"
          alignItems="center"
        >
          {/* 체크박스 컨테이너 */}
          <Stack
            color="white"
            sx={{
              "& svg": {
                transform: "scale(1.25)",
              },
              "& input:not(:checked) + svg": {
                fill: "white",
              },
            }}
          >
            {/* 이메일 저장 체크박스 */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={isEmailSaved}
                    onChange={handleEmailSaveChange}
                  />
                }
                label="이메일 저장"
              />
            </Box>

            {/* 로그인 상태 유지 체크박스 */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={isLoginStateSave}
                    onChange={handleLoginStateSaveChange}
                  />
                }
                label="로그인 상태 유지"
              />
            </Box>
          </Stack>

          {/* 로그인 버튼 */}
          <Box>
            <Button
              variant="contained"
              onClick={handleLoginButtonClick}
              sx={{
                padding: 2,
                px: {
                  xs: 8,
                  sm: 4,
                },
                borderRadius: "50px",
              }}
            >
              <Typography variant="h2">로그인</Typography>
            </Button>
          </Box>
        </Stack>

        {/* 회원가입 링크 */}
        <Stack direction="row" gap={2} justifyContent="center">
          <Typography variant="subtitle1" color="white">
            계정이 아직 없으신가요?
          </Typography>
          <Link
            to="/register"
            style={{
              textDecoration: "none",
            }}
          >
            <Typography
              variant="subtitle1"
              color="primary"
              fontWeight="bold"
              sx={{
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              회원가입
            </Typography>
          </Link>
        </Stack>

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
    </Stack>
  );
};

export default Login;
