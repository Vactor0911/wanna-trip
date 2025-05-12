import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PlainLink from "../components/PlainLinkProps";
import SectionHeader from "../components/SectionHeader";
import OutlinedTextField from "../components/OutlinedTextField";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { ReactNode, useCallback, useEffect, useState } from "react";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import axios from "axios";
import { useAtomValue } from "jotai";
import { wannaTripLoginStateAtom } from "../state";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Tooltip from "../components/Tooltip";

// 이용약관 데이터
interface TermsOfService {
  title: string;
  isOptional: boolean;
  content: ReactNode;
}

const termsOfServices: TermsOfService[] = [
  {
    title: "개인정보 수집 및 이용약관 동의",
    isOptional: false,
    content: (
      <Typography variant="subtitle1">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque
        corrupti recusandae voluptate adipisci aliquam fugiat deserunt omnis
        maxime earum neque debitis, quasi perferendis! Qui nihil distinctio
        doloremque voluptatem corrupti est.
      </Typography>
    ),
  },
  {
    title: "위치 정보 이용약관 동의",
    isOptional: true,
    content: (
      <Typography variant="subtitle1">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque
        corrupti recusandae voluptate adipisci aliquam fugiat deserunt omnis
        maxime earum neque debitis, quasi perferendis! Qui nihil distinctio
        doloremque voluptatem corrupti est. Lorem ipsum dolor sit amet
        consectetur adipisicing elit. Qui, porro cumque necessitatibus quisquam
        sunt dolores nemo itaque et corporis totam deserunt veniam, tenetur
        reiciendis perferendis quia consectetur vel mollitia magnam?
      </Typography>
    ),
  },
];

// 회원가입 컴포넌트 정의
const Register: React.FC = () => {
  const [email, setEmail] = useState(""); // 사용자 이메일
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  const [passwordConfirm, setPasswordConfirm] = useState(""); // 사용자 비밀번호 재확인
  const [name, setName] = useState(""); // 사용자 별명
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 비밀번호 보임/숨김
  const [isPasswordConfirmVisible, setIsPasswordCheckVisible] = useState(false); // 비밀번호 확인 보임/숨김
  const [isConfirmCodeSending, setIsConfirmCodeSending] = useState(false); // 인증번호 전송 중 여부
  const [isConfirmCodeSent, setIsConfirmCodeSent] = useState(false); // 인증번호 전송 여부
  const [confirmCode, setConfirmCode] = useState(""); // 인증번호
  const [confirmTimeLeft, setConfirmTimeLeft] = useState(300); // 인증번호 입력 남은 시간
  const [isConfirmCodeChecked, setIsConfirmCodeChecked] = useState(false); // 인증번호 확인 여부
  const [isTermAgreed, setIsTermAgreed] = useState(
    Array.from({ length: termsOfServices.length }, () => false)
  ); // 이용약관 동의 여부
  const [isTermExpanded, setIsTermExpanded] = useState(
    Array.from({ length: termsOfServices.length }, () => false)
  ); // 이용약관 펼치기 여부

  const navigate = useNavigate(); //네이게이트를 사용하기 위해 추가

  // 로그인 된 상태면 템플릿 페이지로 이동
  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);
  if (wannaTripLoginState.isLoggedIn) {
    navigate("/template");
  }

  // 아이디(이메일) 입력
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    []
  );

  // 인증번호 입력 타이머
  useEffect(() => {
    if (!isConfirmCodeSent || confirmTimeLeft <= 0 || isConfirmCodeChecked) {
      return;
    }

    const confirmCodeTimer = setInterval(() => {
      setConfirmTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(confirmCodeTimer); // 컴포넌트 언마운트 시 타이머 정리
  }, [isConfirmCodeChecked, confirmTimeLeft, isConfirmCodeSent]);

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

  // 닉네임(별명) 입력
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    []
  );

  // 이용약관 전체 동의 버튼 클릭
  const handleTermAgreeAllButtonClick = useCallback(() => {
    const newCondition = isTermAgreed.some((agreed) => agreed) ? false : true;
    setIsTermAgreed(
      Array.from({ length: termsOfServices.length }, () => newCondition)
    );
  }, [isTermAgreed]);

  // 이용약관 동의 버튼 클릭
  const handleTermAgreeButtonClick = useCallback(
    (index: number) => {
      const newIsTermAgreed = [
        ...isTermAgreed.slice(0, index),
        !isTermAgreed[index],
        ...isTermAgreed.slice(index + 1),
      ];
      setIsTermAgreed(newIsTermAgreed);
    },
    [isTermAgreed]
  );

  // 이용약관 펼치기 버튼 클릭
  const handleExpandTermButtonClick = useCallback(
    (index: number) => {
      const newIsTermExpanded = [
        ...isTermExpanded.slice(0, index),
        !isTermExpanded[index],
        ...isTermExpanded.slice(index + 1),
      ];
      setIsTermExpanded(newIsTermExpanded);
    },
    [isTermExpanded]
  );

  const allRequiredAgreed = termsOfServices.every(
    (term, index) => term.isOptional || isTermAgreed[index]
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

      if (!isConfirmCodeChecked) {
        console.error("이메일 인증을 완료해주세요.");
        alert("이메일 인증을 완료해주세요.");
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

      if (!allRequiredAgreed) {
        alert("필수 약관에 모두 동의해 주세요.");
        return;
      }

      try {
        // CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();

        // 이용약관 동의 여부 확인
        const termsData = {
          privacy: isTermAgreed[0], // 첫 번째 항목: 개인정보 수집 및 이용약관 (필수)
          location: isTermAgreed[1], // 두 번째 항목: 위치 정보 이용약관 (선택)
        };

        // 서버로 회원가입 요청 전송
        await axiosInstance.post(
          "/auth/register",
          {
            email: email,
            password: password,
            name: name,
            terms: termsData,
          },
          {
            headers: {
              "X-CSRF-Token": csrfToken, // CSRF 토큰 추가
            },
          }
        );

        // 성공 처리
        alert("회원가입이 성공적으로 완료되었습니다!");
        navigate("/login"); // 회원가입 성공 시 로그인 페이지로 이동
      } catch (error) {
        // 에러 처리
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data;
          console.error("서버가 오류를 반환했습니다:", errorData.message);

          if (errorData.loginType) {
            // 특정 로그인 타입이 제공된 경우
            const loginTypeName =
              errorData.loginType === "kakao"
                ? "카카오"
                : errorData.loginType === "google"
                ? "구글"
                : "일반";

            const goToLogin = confirm(
              `이미 ${loginTypeName} 계정으로 가입된 이메일입니다.\n로그인 페이지로 이동하시겠습니까?`
            );

            if (goToLogin) {
              navigate("/login");
            }
          } else {
            // 기존 메시지 표시
            alert(`Error: ${errorData.message}`);
          }
        } else {
          console.error(
            "요청을 보내는 중 오류가 발생했습니다:",
            (error as Error).message
          );
          alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
        }
      }
    },
    [
      email,
      password,
      passwordConfirm,
      isConfirmCodeChecked,
      name,
      allRequiredAgreed,
      isTermAgreed,
      navigate,
    ]
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
      <Stack
        minHeight="100vh"
        justifyContent="center"
        sx={{
          paddingY: 10,
        }}
      >
        <Stack gap={3}>
          {/* 로고 링크 버튼 */}
          <PlainLink to="/">
            <Typography variant="h4" color="primary">
              Wanna Trip
            </Typography>
          </PlainLink>

          {/* 사용자 정보 입력 폼 */}
          <Stack gap={1}>
            {/* 헤더 */}
            <SectionHeader title="아이디/비밀번호" />

            {/* 아이디(이메일) */}
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
                      ? "#19df79" // 인증 완료 시 초록색
                      : confirmTimeLeft <= 0
                      ? "error.main" // 시간 초과 시 빨간색
                      : "primary.main", // 평상시 파란색
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

            {/* 별명 입력란 */}
            <OutlinedTextField
              label="닉네임(별명)"
              value={name}
              onChange={handleNameChange}
            />
          </Stack>

          {/* 이용약관 컨테이너 */}
          <Stack gap={1}>
            {/* 헤더 */}
            <SectionHeader title="이용약관" />

            {/* 전체 동의하기 체크박스 */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    name="전체 동의하기"
                    checked={isTermAgreed.every((agreed) => agreed)}
                    indeterminate={
                      isTermAgreed.some((agreed) => agreed) &&
                      !isTermAgreed.every((agreed) => agreed)
                    }
                    onChange={handleTermAgreeAllButtonClick}
                  />
                }
                label={<Typography variant="h6">전체 동의하기</Typography>}
              />
            </Box>

            {/* 약관 동의 항목 */}
            {termsOfServices.map((term, index) => (
              <Stack key={`term-${index}`}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {/* 약관 동의 체크박스 */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={term.title}
                        checked={isTermAgreed[index]}
                        onChange={() => handleTermAgreeButtonClick(index)}
                      />
                    }
                    label={
                      <Stack
                        direction="row"
                        width="100%"
                        gap={1}
                        fontWeight="bold"
                        alignItems="center"
                      >
                        {/* 선택/필수 */}
                        <Typography
                          variant="subtitle1"
                          color={term.isOptional ? "divider" : "primary"}
                          fontWeight="inherit"
                          whiteSpace="nowrap"
                        >
                          [{term.isOptional ? "선택" : "필수"}]
                        </Typography>

                        {/* 이용약관 제목 */}
                        <Typography
                          variant="subtitle1"
                          fontWeight="inherit"
                          sx={{
                            wordBreak: "keep-all",
                          }}
                        >
                          {term.title}
                        </Typography>
                      </Stack>
                    }
                  />

                  {/* 약관 펼치기/접기 버튼 */}
                  <Box flex={1} display="flex" justifyContent="flex-end">
                    <Tooltip
                      title={isTermExpanded[index] ? "접기" : "펼치기"}
                      placement="top"
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleExpandTermButtonClick(index)}
                      >
                        <ExpandMoreRoundedIcon
                          sx={{
                            transform: isTermExpanded[index]
                              ? "rotate(180deg)"
                              : "none",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Stack>
                <Paper
                  variant="outlined"
                  sx={{
                    marginLeft: "32px",
                    paddingLeft: 2,
                    paddingRight: 1,
                    paddingY: 1,
                  }}
                >
                  <Collapse
                    in={isTermExpanded[index]}
                    collapsedSize={60}
                    sx={{
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {term.content}
                  </Collapse>
                </Paper>
              </Stack>
            ))}
          </Stack>

          <Stack gap={0.5}>
            {/* 회원가입 버튼 */}
            <Button
              variant="contained"
              onClick={handleRegisterButtonClick}
              disabled={!allRequiredAgreed} // 필수 약관에 동의하지 않으면 비활성화
            >
              <Typography variant="h5">회원가입</Typography>
            </Button>

            {/* 로그인 페이지 링크 */}
            <Box alignSelf="flex-end">
              <PlainLink to="/login">
                <Typography variant="subtitle1" color="divider">
                  이미 계정이 있으신가요?
                </Typography>
              </PlainLink>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Register;
