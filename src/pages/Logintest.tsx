import * as React from "react";
import BackgroundImage from "../assets/images/background.png";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { theme } from "../utils";

import {
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
  Stack,
} from "@mui/material";

import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "../assets/images/google.png";
import KakaoIcon from "../assets/images/kakao.png";
import EmailIcon from "@mui/icons-material/Email";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useAtomValue, useSetAtom } from "jotai";
import {
  wannaTripLoginStateAtom,
  SERVER_HOST,
  kakaoLoginStateAtom,
} from "../state";
import { jwtDecode } from "jwt-decode";
const Logintest = () => {
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
  const setWannaTripLoginState = useSetAtom(wannaTripLoginStateAtom); // useSetAtom 불러오기
  const [, setIsLoading] = useState(false); // 로그인 로딩 상태 추가
  const google = (window as any).google; // 구글 간편 로그인 추가

  // *** 이메일 저장 기능 시작 ***

  // 이메일 저장 체크박스 상태 관리
  const handleEmailSaveChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = event.target.checked; // 체크박스 상태 확인
    setIsEmailSaved(isChecked); // 상태 업데이트

    if (isChecked) {
      localStorage.setItem("savedEmail", email); // 이메일 저장
    } else {
      localStorage.removeItem("savedEmail"); // 저장된 이메일 삭제
    }
  };

  // 이메일 입력 시 동기화
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value; // 입력된 이메일 값
    setEmail(newEmail); // 상태 업데이트

    if (isEmailSaved) {
      localStorage.setItem("savedEmail", newEmail); // 이메일 저장
    }
  };

  // 초기화: 이메일 저장 상태 불러오기
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail"); // 저장된 이메일 가져오기
    if (savedEmail) {
      setEmail(savedEmail); // 이메일 상태 업데이트
      setIsEmailSaved(true); // 이메일 저장 상태 업데이트
    }
  }, []);

  // *** 이메일 저장 기능 끝 ***

  // 카카오 URL의 code를 처리하기 위한 useEffect
  const kakaoLoginState = useAtomValue(kakaoLoginStateAtom); // 카카오 로그인 코드 상태
  useEffect(() => {
    if (kakaoLoginState) {
      handleKakaoLogin(); // 카카오 로그인 함수 호출
    }
  }, []);

  // 구글 간편 로그인 시작
  const handleGoogleLogin = (credentialResponse: any) => {
    // 구글에서 받은 Credential 디코딩
    let decoded: any;
    try {
      decoded = jwtDecode(credentialResponse.credential); // 디코딩 시도
    } catch (error) {
      console.error("구글 Credential 디코딩 실패:", error); // 디코딩 실패 로그
      alert("구글 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요."); // 오류 메시지
      return;
    }

    // 사용자 정보 추출
    const email = decoded.email;
    const name = decoded.name;

    // Step 1: 사용자 정보를 백엔드로 전달하여 로그인 처리
    axios
      .post(`${SERVER_HOST}/api/login/google`, {
        email,
        name,
        loginType: "google",
      })
      .then((response) => {
        const { accessToken, refreshToken, userId } = response.data;

        // 간편 로그인 성공 시 저장된 일반 로그인 이메일 삭제
        localStorage.removeItem("savedEmail");

        // Step 2: 로그인 상태 업데이트
        const wannaTriploginState = {
          isLoggedIn: true,
          userId: userId,
          email: email,
          loginType: "google",
          loginToken: accessToken,
          refreshToken: refreshToken, // RefreshToken 저장
        };

        // Jotai 상태 업데이트
        setWannaTripLoginState(wannaTriploginState);

        // LocalStorage에 저장
        localStorage.setItem(
          "WannaTriploginState",
          JSON.stringify(wannaTriploginState)
        );
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
    const code = kakaoLoginState; // URL에서 code 추출

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
                const { accessToken, refreshToken, userId } =
                  serverResponse.data;

                // 간편 로그인 성공 시 저장된 일반 로그인 이메일 삭제
                localStorage.removeItem("savedEmail");

                // Step 4: 로그인 상태 업데이트
                const WannaTriploginState = {
                  isLoggedIn: true,
                  userId: userId,
                  email: email,
                  loginType: "kakao", //카카오 로그인
                  loginToken: accessToken,
                  refreshToken: refreshToken, // RefreshToken 저장
                };

                // Jotai 상태 업데이트
                setWannaTripLoginState(WannaTriploginState);

                // LocalStorage에 저장
                localStorage.setItem(
                  "WannaTriploginState",
                  JSON.stringify(WannaTriploginState)
                );

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
        const { nickname, token, userId } = response.data;

        // 로그인 성공 메시지
        alert(`[ ${nickname} ]님 로그인에 성공했습니다!`);

        // 로그인 상태 업데이트
        const WannaTriploginState = {
          isLoggedIn: true,
          userId: userId,
          email: email,
          loginType: "normal", //일반 로그인
          loginToken: token,
          refreshToken: "", // 일반 로그인은 RefreshToken이 없을 수도 있음
        };

        // Jotai 상태 업데이트
        setWannaTripLoginState(WannaTriploginState);

        // LocalStorage 업데이트
        if (isEmailSaved) {
          localStorage.setItem("savedEmail", email); // 이메일 저장
        } else {
          localStorage.removeItem("savedEmail"); // 저장된 이메일 삭제
        }

        // LocalStorage에 저장
        localStorage.setItem(
          "WannaTriploginState",
          JSON.stringify(WannaTriploginState)
        );

        // 성공 후 페이지 이동
        navigate("/template");
      })
      .catch((error) => {
        // 로그인 실패 시 처리
        if (isEmailSaved) {
          localStorage.setItem("savedEmail", email); // 저장된 이메일 유지
        } else {
          localStorage.removeItem("savedEmail"); // 이메일 저장 안 된 경우 삭제
          setEmail(""); // 이메일 초기화
        }

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
    <Stack
      direction="row"
      width="100%"
      minHeight="100vh"
      sx={{
        backgroundColor: theme.palette.background.default, // 배경 색상
        px: 4, // 패딩
      }}
    >
      {/* 배경 이미지 */}
      <Stack
        sx={{
          display: { xs: "20%", sm: "flex" }, // 반응형 디스플레이
          width: { sm: "40%", md: "60%" }, // 반응형 너비
          minHeight: "100vh", // 최소 높이
          backgroundImage: `url(${BackgroundImage})`, // 배경 이미지
          backgroundRepeat: "no-repeat", // 배경 반복 없음
          backgroundPosition: "center", // 배경 위치
          backgroundSize: "80%", // 배경 크기
        }}
      />

      {/* 텍스트와 폼 */}
      <Stack
        width="50%" // 화면의 나머지 절반 차지
        justifyContent="center" // 수직 중앙 정렬
        alignItems="center" // 수평 중앙 정렬
        zIndex="1" // 배경보다 위에 위치
        sx={{
          position: "relative", // 상대 위치 설정
        }}
      >
        {/* 메인 제목 */}
        <Typography
          variant="h1" // 제목 스타일
          color="white" // 흰색 텍스트
          fontSize="2.3em" // 글자 크기
          textAlign="center" // 텍스트 중앙 정렬
          width="100%" // 전체 너비
          mb={1} // 아래 여백
        >
          여행갈래?
        </Typography>

        {/* 부제목 */}
        <Typography
          variant="h2" // 부제목 스타일
          color="white" // 흰색 텍스트
          fontSize="1.6em" // 글자 크기
          textAlign="center" // 텍스트 중앙 정렬
          mb={3} // 아래 여백
        >
          세상에서 가장 간단한 계획서
        </Typography>

        {/* 폼 컨테이너 */}
        <Stack width={{ md: "240px", xs: "180px" }} gap={3}>
          {/* 이메일 입력 */}
          <OutlinedInput
            sx={{
              backgroundColor: "#EBEBEB", // 밝은 회색 배경
              borderRadius: "10px", // 둥근 모서리
            }}
            placeholder="이메일" // 입력 필드 힌트 텍스트
            value={email} // email 상태와 바인딩
            onChange={handleEmailChange} // email 상태 업데이트
            required // 필수 입력 필드
            startAdornment={
              <InputAdornment position="start">
                <EmailIcon
                  sx={{
                    color: "black", // 검은색 아이콘
                    transform: "scale(1.5)", // 아이콘 크기 조정
                    marginRight: "20px", // 오른쪽 여백
                  }}
                />
              </InputAdornment>
            }
          />

          {/* 비밀번호 입력 */}
          <OutlinedInput
            sx={{
              backgroundColor: "#EBEBEB", // 밝은 회색 배경
              borderRadius: "10px", // 둥근 모서리
            }}
            type={isPasswordVisible ? "text" : "password"} // 비밀번호 가시성 토글
            placeholder="비밀번호" // 입력 필드 힌트 텍스트
            value={password} // password 상태와 바인딩
            onChange={(e) => setPassword(e.target.value)} // password 상태 업데이트
            required // 필수 입력 필드
            startAdornment={
              <InputAdornment position="start">
                <LockIcon
                  sx={{
                    color: "black", // 검은색 아이콘
                    transform: "scale(1.5)", // 아이콘 크기 조정
                    marginRight: "20px", // 오른쪽 여백
                  }}
                />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setIsPasswordVisible(!isPasswordVisible); // 비밀번호 가시성 토글
                  }}
                >
                  {isPasswordVisible ? (
                    <VisibilityIcon sx={{ color: "black" }} /> // 비밀번호 보임 아이콘
                  ) : (
                    <VisibilityOffIcon sx={{ color: "black" }} /> // 비밀번호 숨김 아이콘
                  )}
                </IconButton>
              </InputAdornment>
            }
          />

          {/* 이메일 저장 체크박스 */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isEmailSaved} // isEmailSaved 상태와 바인딩
                onChange={handleEmailSaveChange} // isEmailSaved 상태 업데이트
                size="large" // 큰 체크박스 크기
                sx={{
                  color: "#EBEBEB", // 밝은 회색
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "1em" }}>이메일 저장</Typography> // 라벨 텍스트
            }
            sx={{
              color: "white", // 흰색 텍스트
            }}
          />

          {/* 로그인 버튼 */}
          <Button
            id="btn-login" // 버튼 ID
            variant="contained" // 컨테이너 스타일 버튼
            onClick={handleLoginClick} // 클릭 시 handleLoginClick 호출
            sx={{
              borderRadius: "50px", // 완전히 둥근 모서리
              fontWeight: "bold", // 굵은 텍스트
              fontSize: "1.4em", // 글자 크기
              padding: "5px 30px", // 패딩
            }}
          >
            로그인
          </Button>

          {/* 회원가입 링크 */}
          <Typography color="white">
            계정이 아직 없으신가요? <Link to="/register">회원가입</Link>{" "}
            {/* 회원가입 페이지로 이동 */}
          </Typography>

          {/* 소셜 로그인 버튼 */}
          <Stack direction="row" justifyContent="center" gap={2}>
            {/* 카카오 로그인 */}
            <IconButton onClick={handleKakaoLogin}>
              <Avatar src={KakaoIcon} sx={{ width: "60px", height: "60px" }} />{" "}
              {/* 카카오 아이콘 */}
            </IconButton>

            {/* 구글 로그인 */}
            <IconButton
              onClick={() => {
                google.accounts.id.initialize({
                  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // 구글 클라이언트 ID
                  callback: handleGoogleLogin, // 구글 로그인 콜백 함수
                });
                google.accounts.id.prompt(); // 구글 로그인 프롬프트
              }}
            >
              <Avatar
                src={GoogleIcon} // 구글 아이콘
                sx={{ width: "60px", height: "60px", cursor: "pointer" }} // 아이콘 스타일
              />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Logintest;
