import { useState, useCallback } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import OutlinedTextField from "../components/OutlinedTextField";
import PlainLink from "../components/PlainLinkProps";
import SectionHeader from "../components/SectionHeader";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import axios from "axios";

const FindPassword = () => {
  const [email, setEmail] = useState(""); // 사용자 이메일
  const [isConfirmCodeSending, setIsConfirmCodeSending] = useState(false); // 인증번호 전송 중 여부
  const [isConfirmCodeSent, setIsConfirmCodeSent] = useState(false); // 인증번호 전송 여부
  const [confirmCode, setConfirmCode] = useState(""); // 인증번호
  const [confirmTimeLeft, setConfirmTimeLeft] = useState(300); // 인증번호 입력 남은 시간
  const [isConfirmCodeChecked, setIsConfirmCodeChecked] = useState(false); // 인증번호 확인 여부

  // 아이디(이메일) 입력
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    []
  );

  // 인증번호 전송 버튼 클릭
  const handleConfirmCodeSendButtonClick = useCallback(async () => {
    // 이미 인증번호를 확인했다면 종료
    if (isConfirmCodeChecked) {
      alert("이미 인증번호를 확인했습니다.");
      return;
    }

    // 이메일이 올바르지 않다면 종료
    // if (!isEmailValid(email)) {
    //   alert("유효한 이메일 주소를 입력해주세요.");
    //   return;
    // }

    // 인증번호 요청 API 호출
    try {
      setIsConfirmCodeSending(true);

      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 인증번호 요청
      await axiosInstance.post(
        "/auth/sendVerifyEmail",
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

      setIsConfirmCodeSent(true); // 인증번호 전송 여부를 true로 설정
      setConfirmTimeLeft(300); // 타이머를 5분(300초)으로 초기화
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

  // 인증번호 입력
  const handleConfirmCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmCode(e.target.value.replace(" ", ""));
    },
    []
  );

  // 타이머 시간 포맷팅
  const getFormattedTime = useCallback(() => {
    // 남은 시간이 0 이하일 경우
    if (confirmTimeLeft <= 0) {
      return "시간초과";
    }

    // 이미 인증번호를 확인한 경우
    if (isConfirmCodeChecked) {
      return "인증완료";
    }

    const minutes = Math.floor(confirmTimeLeft / 60);
    const seconds = confirmTimeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [confirmTimeLeft, isConfirmCodeChecked]);

  // 인증번호 확인 버튼 클릭
  const handleConfirmCodeCheckButtonClick = useCallback(async () => {
    // 이미 확인된 인증번호라면 종료
    if (isConfirmCodeChecked) {
      alert("이미 인증번호를 확인했습니다.");
      return;
    }

    try {
      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 인증번호 확인 요청
      await axiosInstance.post(
        "/auth/verifyEmailCode",
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
  }, [confirmCode, email, isConfirmCodeChecked]);

  return (
    <Container maxWidth="xs">
      <Stack minHeight="100vh" justifyContent="center" pb={45.2}>
        <Stack gap={6}>
          {/* 로고 링크 버튼*/}
          <PlainLink to="/">
            <Typography variant="h3" color="primary" textAlign="center">
              Wanna Trip
            </Typography>
          </PlainLink>

          <Stack gap={1}>
            {/* 비밀번호 찾기 헤더 */}
            <SectionHeader title="비밀번호 찾기" />

            {/* 이메일 입력란 */}
            <Stack gap={1}>
              {/* 아이디(이메일) 입력란 */}
              <Stack direction="row" gap={1} mt={1}>
                <Box flex={1}>
                  <OutlinedTextField
                    label="아이디(이메일)"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </Box>

                {/* 인증 요청 버튼 */}
                <Button
                  variant="outlined"
                  loading={isConfirmCodeSending}
                  onClick={handleConfirmCodeSendButtonClick}
                  sx={{
                    borderRadius: "8px",
                  }}
                >
                  <Typography>인증요청</Typography>
                </Button>
              </Stack>

              {/* 인증번호 입력란 */}
              <Stack
                direction="row"
                gap={1}
                display={isConfirmCodeSent ? "flex" : "none"}
              >
                <Box flex={2}>
                  <OutlinedTextField
                    label="인증번호"
                    value={confirmCode}
                    onChange={handleConfirmCodeChange}
                  />
                </Box>

                {/* 남은 인증 시간 */}
                <Typography
                  variant="subtitle1"
                  alignSelf="center"
                  sx={{
                    width: "65px",
                    color: isConfirmCodeChecked
                      ? "success" // 인증 완료 시 초록색
                      : confirmTimeLeft <= 0
                      ? "error" // 시간 초과 시 빨간색
                      : "primary", // 평상시 파란색
                  }}
                >
                  {getFormattedTime()}
                </Typography>

                {/* 인증 확인 버튼 */}
                <Button
                  variant="outlined"
                  onClick={handleConfirmCodeCheckButtonClick}
                  sx={{
                    ml: 2,
                    borderRadius: "8px",
                  }}
                >
                  <Typography>인증확인</Typography>
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default FindPassword;
