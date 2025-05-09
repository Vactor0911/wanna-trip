import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BackgroundImage from "../assets/images/background.png";
import LockIcon from "@mui/icons-material/Lock";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; //네이게이트를 사용하기 위해 추가
import axios from "axios";
import {
  kakaoLoginStateAtom,
  SERVER_HOST,
  wannaTripLoginStateAtom,
} from "../state";
import { useAtomValue, useSetAtom } from "jotai";
import { isEmailValid } from "../utils";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";

const Register = () => {
  const [email, setEmail] = useState(""); // 사용자 이메일
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  const [passwordConfirm, setPasswordConfirm] = useState(""); // 사용자 비밀번호 재확인
  const [name, setName] = useState(""); // 사용자 별명
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 비밀번호 보임/숨김
  const [isPasswordConfirmVisible, setIsPasswordCheckVisible] = useState(false); // 비밀번호 확인 보임/숨김

  const navigate = useNavigate(); //네이게이트를 사용하기 위해 추가

  // 카카오 로그인 상태 초기화
  const setKakaoLoginState = useSetAtom(kakaoLoginStateAtom);
  useEffect(() => {
    setKakaoLoginState(""); // 카카오 로그인 상태 초기화
  }, [setKakaoLoginState]);

  // 로그인 된 상태면 템플릿 페이지로 이동
  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);
  if (wannaTripLoginState.isLoggedIn) {
    navigate("/template");
  }

  // 이메일 입력
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    []
  );

  // 인증번호 입력
  const handleConfirmCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmCode(e.target.value.replace(" ", ""));
    },
    []
  );

  // 비밀번호 입력
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    []
  );

  // 비밀번호 재입력 입력
  const handlePasswordConfirmChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordConfirm(e.target.value);
    },
    []
  );

  // 비밀번호 보임/숨김
  const handlePasswordVisibilityChange = useCallback(() => {
    setIsPasswordVisible(!isPasswordVisible);
  }, [isPasswordVisible]);

  // 비밀번호 확인 보임/숨김
  const handlePasswordConfirmVisibilityChange = useCallback(() => {
    setIsPasswordCheckVisible(!isPasswordConfirmVisible);
  }, [isPasswordConfirmVisible]);

  // 별명 입력
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    []
  );

  // 회원가입 버튼 클릭
  const handleRegisterButtonClick = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // 전송 전 입력값 검증
      if (!email || !password || !passwordConfirm) {
        console.error("이메일 또는 비밀번호가 비어있으면 안됩니다.");
        alert("이메일 또는 비밀번호가 비어있으면 안됩니다.");
        return;
      }

      if (!name) {
        console.error("닉네임을 입력해주세요.");
        alert("닉네임을 입력해주세요.");
        return;
      }

      if (password !== passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      // 서버로 회원가입 요청 전송
      axios
        .post(`${SERVER_HOST}/api/auth/register`, {
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
            console.error(
              "요청을 보내는 중 오류가 발생했습니다:",
              error.message
            );
            alert(
              "예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요."
            );
          }
        });
    },
    [email, password, passwordConfirm, name, navigate]
  );

  // 인증번호 요청 버튼 클릭
  const [, setIsConfirmCodeSending] = useState(false);
  const [isConfirmCodeChecked, setIsConfirmCodeChecked] = useState(false); // 인증번호 확인 여부
  const [confirmCode, setConfirmCode] = useState(""); // 인증번호

  const handleConfirmCodeSendButtonClick = useCallback(async () => {
    // 이미 인증번호를 확인했다면 종료
    if (isConfirmCodeChecked) {
      alert("이미 인증번호를 확인했습니다.");
      return;
    }

    // 이메일이 올바르지 않다면 종료
    if (!isEmailValid(email)) {
      alert("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    // 인증번호 요청 API 호출
    try {
      setIsConfirmCodeSending(true);

      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 인증번호 요청
      await axiosInstance.post(
        "/api/auth/sendVerifyEmail",
        {
          email,
          purpose: "verifyEmailCode", // 이메일 인증번호 요청
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF 토큰 추가
          },
        }
      );

      alert("인증번호가 이메일로 발송되었습니다.");
    } catch (error) {
      // 요청 실패 시 알림
      if (axios.isAxiosError(error) && error.response) {
        alert(
          "이메일 전송 실패\n" +
            (error.response.data?.message || "알 수 없는 오류")
        );
      } else {
        console.error("요청 오류:", (error as Error).message);
        alert("예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsConfirmCodeSending(false);
    }
  }, [email, isConfirmCodeChecked]);

  // 인증번호 확인 버튼 클릭
  const handleConfirmCodeCheckButtonClick = useCallback(async () => {
    try {
      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 인증번호 확인 요청
      await axiosInstance.post(
        "/api/auth/verifyEmailCode",
        {
          email,
          code: confirmCode,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF 토큰 추가
          },
        }
      );

      // 요청 성공 처리
      alert("인증번호 확인이 완료되었습니다.");
      setIsConfirmCodeChecked(true); // 인증 성공
    } catch (error) {
      // 요청 실패 처리
      if (axios.isAxiosError(error) && error.response) {
        alert(
          "인증 실패\n" + (error.response.data?.message || "알 수 없는 오류")
        );
      } else {
        console.error("요청 오류:", (error as Error).message);
        alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
      }
    }
  }, [confirmCode, email]);

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
          endAdornment={
            <InputAdornment position="end">
              <Button
                variant="contained"
                onClick={handleConfirmCodeSendButtonClick}
                sx={{
                  px: 2,
                  borderRadius: "50px",
                }}
              >
                <Typography variant="subtitle1">인증 요청</Typography>
              </Button>
            </InputAdornment>
          }
          sx={{
            borderRadius: "10px",
            background: "white",
          }}
        />
        <OutlinedInput
          fullWidth
          placeholder="인증코드"
          value={confirmCode}
          onChange={handleConfirmCodeChange}
          required
          startAdornment={
            <InputAdornment position="start">
              <EmailIcon />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <Button
                variant="contained"
                onClick={handleConfirmCodeCheckButtonClick}
                sx={{
                  px: 2,
                  borderRadius: "50px",
                }}
              >
                <Typography variant="subtitle1">인증 확인</Typography>
              </Button>
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

        {/* 비밀번호 재입력 입력란 */}
        <OutlinedInput
          fullWidth
          type={isPasswordConfirmVisible ? "text" : "password"}
          placeholder="비밀번호 재입력"
          value={passwordConfirm}
          onChange={handlePasswordConfirmChange}
          required
          startAdornment={
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handlePasswordConfirmVisibilityChange}>
                {isPasswordConfirmVisible ? (
                  <VisibilityIcon />
                ) : (
                  <VisibilityOffIcon />
                )}
              </IconButton>
            </InputAdornment>
          }
          sx={{
            borderRadius: "10px",
            background: "white",
          }}
        />

        {/* 병명 입력란 */}
        <OutlinedInput
          fullWidth
          type="text"
          placeholder="별명"
          value={name}
          onChange={handleNameChange}
          required
          startAdornment={
            <InputAdornment position="start">
              <LocalOfferIcon />
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
            md: "row",
          }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          {/* 로그인 페이지 링크 */}
          <Stack direction="row" gap={2}>
            <Typography variant="subtitle1" color="white">
              계정이 이미 있으신가요?
            </Typography>
            <Link
              to="/login"
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
                로그인
              </Typography>
            </Link>
          </Stack>

          {/* 회원가입 버튼 */}
          <Button
            variant="contained"
            onClick={handleRegisterButtonClick}
            sx={{
              padding: 2,
              px: {
                xs: 8,
                md: 4,
              },
              borderRadius: "50px",
            }}
          >
            <Typography variant="h2">회원가입</Typography>
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Register;
