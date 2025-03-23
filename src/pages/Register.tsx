import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import axios from "axios";

import {
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";

import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LocalOffer as LocalOfferIcon,
} from "@mui/icons-material";

import {
  kakaoLoginStateAtom,
  SERVER_HOST,
  wannaTripLoginStateAtom,
} from "../state";
import { theme } from "../utils/index";
import BackgroundImage from "../assets/images/background.png";

const Register = () => {
  const navigate = useNavigate();
  const setKakaoLoginState = useSetAtom(kakaoLoginStateAtom);
  useEffect(() => {
    setKakaoLoginState(""); // 카카오 로그인 상태 초기화
  }, []);

  // 로그인 된 상태면 템플릿 페이지로 이동
  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);
  if (wannaTripLoginState.isLoggedIn) {
    navigate("/template");
  }

  // 비밀번호 보이기/숨기기 상태
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordCheckVisible, setIsPasswordCheckVisible] = useState(false);

  // 회원가입 관련 상태
  const [email, setEmail] = useState(""); // 사용자 이메일
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  const [password_comparison, setPassword_comparison] = useState(""); // 사용자 비밀번호 재확인
  const [name, setName] = useState(""); // 사용자 이름

  // 회원가입 버튼 클릭
  const Registerbtn = async (e: React.FormEvent) => {
    e.preventDefault();

    // 전송 전 입력값 검증
    if (!email || !password || !password_comparison) {
      console.error("이메일 또는 비밀번호가 비어있으면 안됩니다.");
      alert("이메일 또는 비밀번호가 비어있으면 안됩니다.");
      return;
    }

    if (!name) {
      console.error("닉네임을 입력해주세요.");
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (password !== password_comparison) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 서버로 회원가입 요청 전송
    axios
      .post(`${SERVER_HOST}/api/register`, {
        email: email,
        password: password,
        name: name,
      })
      .then(() => {
        // 사용자에게 성공 메시지 보여주기 (UI 반영)
        alert("회원가입이 성공적으로 완료되었습니다!");
        navigate("/login"); // 회원가입 성공 시 로그인 페이지로 이동
      })
      .catch((error) => {
        // 서버로부터 반환된 에러 메시지 확인
        if (error.response) {
          console.error(
            "서버가 오류를 반환했습니다:",
            error.response.data.message
          );
          alert(`Error: ${error.response.data.message}`);
        } else {
          console.error("요청을 보내는 중 오류가 발생했습니다:", error.message);
          alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
        }
      });
  };

  // 이메일 중복 검사
  const handleCheckEmail = async () => {
    if (!email) {
      alert("이메일을 입력해주세요.");
      return;
    }

    axios
      .post(`${SERVER_HOST}/api/emailCheck`, {
        email: email, // 사용자가 입력한 이메일
      })
      .then((response) => {
        const { success, message } = response.data;

        if (success) {
          alert(message); // "사용 가능한 이메일입니다."
        } else {
          alert(message); // "이미 사용 중인 이메일입니다."
        }
      })
      .catch((error) => {
        console.error("이메일 중복 검사 오류:", error);
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      });
  }; //이메일 중복 검사 끝

  return (
    <Stack
      direction="row"
      width="100%"
      minHeight="100vh"
      sx={{
        backgroundColor: theme.palette.background.default,
        px: 4,
      }}
    >
      {/* 왼쪽: 배경 이미지 영역
          - 모바일(xs)에서는 display: "none" 처리 */}
      <Stack
        sx={{
          display: { xs: "20%", sm: "flex" },
          width: { sm: "40%", md: "60%" },
          minHeight: "100vh",
          backgroundImage: `url(${BackgroundImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "75%",
          opacity: 0.7,
        }}
      />

      {/* 오른쪽: 회원가입 폼 영역
          - 모바일에서는 전체 너비(100%) 사용 */}
      <Stack
        width={{ xs: "100%", sm: "60%", md: "55%" }}
        minHeight="100vh"
        justifyContent="center"
        sx={{
          backgroundColor: theme.palette.background.default,
          px: { xs: 2, sm: 10 },
        }}
      >
        <Typography
          variant="h1"
          color="white"
          fontSize={{ xs: "1.8em", md: "2.2em" }}
          textAlign="left"
        >
          여행갈래?
        </Typography>
        <Typography
          variant="h6"
          color="white"
          fontSize={{ xs: "1.5em", md: "2.2em" }}
          fontWeight={500}
          textAlign="left"
          mb={3}
        >
          세상에서 제일 간단한 계획서
        </Typography>

        {/* 회원가입 폼 */}
        <Stack width="100%" gap={1.8} component="form" onSubmit={Registerbtn}>
          {/* 이메일 입력 */}
          <TextField
            placeholder="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    onClick={handleCheckEmail}
                    sx={{
                      borderRadius: "15px",
                      fontWeight: "bold",
                      fontSize: "0.8em",
                      backgroundColor: "#3871CE",
                      color: "white",
                    }}
                  >
                    중복체크
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: "white", borderRadius: "5px" }}
          />

          {/* 비밀번호 입력 */}
          <TextField
            placeholder="비밀번호"
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    edge="end"
                  >
                    {isPasswordVisible ? (
                      <VisibilityIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                    ) : (
                      <VisibilityOffIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: "white", borderRadius: "5px" }}
          />

          {/* 비밀번호 재입력 */}
          <TextField
            placeholder="비밀번호 재입력"
            type={isPasswordCheckVisible ? "text" : "password"}
            value={password_comparison}
            onChange={(e) => setPassword_comparison(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setIsPasswordCheckVisible(!isPasswordCheckVisible)
                    }
                    edge="end"
                  >
                    {isPasswordCheckVisible ? (
                      <VisibilityIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                    ) : (
                      <VisibilityOffIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: "white", borderRadius: "5px" }}
          />

          {/* 별명 입력 */}
          <TextField
            placeholder="별명"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOfferIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: "white", borderRadius: "5px" }}
          />

          {/* 회원가입 버튼 */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              padding: "12px 0",
              borderRadius: "5px",
              backgroundColor: "#3871CE",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.1em",
              mb: 1,
            }}
          >
            회원가입
          </Button>
        </Stack>

        <Typography color="white" textAlign="center" fontSize={16}>
          이미 계정이 있으신가요?{" "}
          <Link
            to="/login"
            style={{
              color: "white",
              textDecoration: "none",
              textDecorationLine: "underline",
            }}
          >
            로그인
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
};

export default Register;
