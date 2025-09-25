import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import OutlinedTextField from "../components/OutlinedTextField";
import PlainLink from "../components/PlainLinkProps";
import SectionHeader from "../components/SectionHeader";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useLocation, useNavigate } from "react-router";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import axios from "axios";
import { isPasswordCombinationValid, isPasswordLengthValid } from "../utils";

const ChangePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(""); // 사용자 이메일
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  const [passwordConfirm, setPasswordConfirm] = useState(""); // 사용자 비밀번호 재확인
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 비밀번호 보임/숨김
  const [isPasswordConfirmVisible, setIsPasswordCheckVisible] = useState(false); // 비밀번호 확인 보임/숨김
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태

  // 이메일 정보 가져오기
  useEffect(() => {
    // location.state에서 이메일 정보 가져오기 (FindPassword에서 전달됨)
    const stateEmail = location.state?.email;
    const fromFindPassword = location.state?.fromFindPassword;

    if (fromFindPassword && stateEmail) {
      setEmail(stateEmail);
    } else {
      // 직접 접근하거나 잘못된 경로로 온 경우 로그인 페이지로 리다이렉트
      alert("잘못된 접근입니다. 비밀번호 찾기를 통해 다시 시도해주세요.");
      navigate("/find-password");
    }
  }, [location.state, navigate]);

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

  // 비밀번호 변경 제출
  const handleSubmit = useCallback(async () => {
    // 입력 검증
    if (!password || !passwordConfirm) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (isPasswordLengthValid(password) === false) {
      alert("비밀번호는 8자리 이상이어야 합니다.");
      return;
    }

    if (isPasswordCombinationValid(password) === false) {
      alert("비밀번호는 영문, 숫자, 특수문자(!@#$%^&*?)를 포함해야 합니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 비밀번호 재설정 API 호출
      await axiosInstance.post(
        "/auth/resetPassword",
        {
          email,
          password,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      alert(
        "비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다."
      );
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(
          "비밀번호 변경 실패\n" +
            (error.response.data?.message || "알 수 없는 오류")
        );
      } else {
        console.error("요청 오류:", (error as Error).message);
        alert("예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, passwordConfirm, navigate]);

  return (
    <Container maxWidth="xs">
      <Stack minHeight="100vh" justifyContent="center" pb={29.2}>
        <Stack gap={6}>
          {/* 로고 링크 버튼*/}
          <PlainLink to="/">
            <Typography variant="h3" color="primary" textAlign="center">
              Wanna Trip
            </Typography>
          </PlainLink>

          <Stack gap={1}>
            {/* 비밀번호 찾기 헤더 */}
            <SectionHeader title="비밀번호 변경" />

            {/* 이메일 입력란 */}
            <Stack gap={1}>
              <Stack direction="row" gap={1} mt={1}>
                <Box flex={1}>
                  <OutlinedTextField
                    label="아이디(이메일)"
                    value={email}
                    readOnly
                  />
                </Box>
              </Stack>
            </Stack>

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

            {/* 비밀번호 재확인 입력란 */}
            <OutlinedTextField
              label="비밀번호 재확인"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              type={isPasswordConfirmVisible ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handlePasswordConfirmVisibilityChange}
                    edge="end"
                  >
                    {isPasswordConfirmVisible ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />

            {/* 비밀번호 변경 버튼 */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                mt: 2,
                borderRadius: "8px",
                height: "48px",
              }}
            >
              <Typography>
                {isSubmitting ? "변경 중..." : "비밀번호 변경"}
              </Typography>
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default ChangePassword;
