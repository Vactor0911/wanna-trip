import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  Typography,
  OutlinedInput,
  Button,
  Box,
  Checkbox,
} from "@mui/material";

// 회원가입 컴포넌트 정의
const Register: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [email, setEmail] = useState<string>(""); // 사용자 이메일 입력값
  const [password, setPassword] = useState<string>(""); // 비밀번호 입력값
  const [passwordConfirm, setPasswordConfirm] = useState<string>(""); // 비밀번호 재확인 입력값
  const [name, setName] = useState<string>(""); // 닉네임 입력값
  const [isLoading, setIsLoading] = useState<boolean>(false); // 로딩 상태
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false); // 이메일 인증 상태
  const [isTermsAgreed, setIsTermsAgreed] = useState<boolean>(false); // 전체 동의 상태
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState<boolean>(false); // 개인정보 동의 상태
  const [isLocationAgreed, setIsLocationAgreed] = useState<boolean>(false); // 위치기반 동의 상태

  // 오류 상태 관리 (붉은색 테두리 표시용)
  const [errors, setErrors] = useState<{
    email: boolean;
    password: boolean;
    passwordConfirm: boolean;
    name: boolean;
  }>({
    email: false,
    password: false,
    passwordConfirm: false,
    name: false,
  });

  // 이메일 입력 처리 함수
  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value);
      setErrors((prev) => ({ ...prev, email: false }));
      setIsEmailVerified(false); // 이메일 변경 시 인증 상태 초기화
    },
    []
  );

  // 비밀번호 입력 처리 함수
  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
      setErrors((prev) => ({ ...prev, password: false }));
    },
    []
  );

  // 비밀번호 재확인 입력 처리 함수
  const handlePasswordConfirmChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordConfirm(event.target.value);
      setErrors((prev) => ({ ...prev, passwordConfirm: false }));
    },
    []
  );

  // 닉네임 입력 처리 함수
  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
      setErrors((prev) => ({ ...prev, name: false }));
    },
    []
  );

  // 이메일 인증 요청 처리 함수
  const handleVerifyEmail = () => {
    if (!email) {
      alert("이메일을 입력해주세요.");
      setErrors((prev) => ({ ...prev, email: true }));
      return;
    }
    // 이메일 인증 요청 (모의 로직)
    alert("인증 요청이 완료되었습니다. 이메일을 확인해 주세요.");
    setIsEmailVerified(true); // 인증 완료 상태로 설정
  };

  // 전체 동의 체크 처리 함수
  const handleAllTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsTermsAgreed(checked);
    setIsPrivacyAgreed(checked);
    setIsLocationAgreed(checked);
  };

  // 개인정보 동의 체크 처리 함수
  const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPrivacyAgreed(event.target.checked);
    setIsTermsAgreed(event.target.checked && isLocationAgreed);
  };

  // 위치기반 동의 체크 처리 함수
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLocationAgreed(event.target.checked);
    setIsTermsAgreed(event.target.checked && isPrivacyAgreed);
  };

  // 회원가입 버튼 클릭 처리 함수
  const handleRegisterButtonClick = useCallback(async () => {
    // 입력값 검증
    const newErrors = {
      email: !email || !isEmailVerified,
      password: !password,
      passwordConfirm: !passwordConfirm || password !== passwordConfirm,
      name: !name,
    };

    setErrors(newErrors);

    // 오류 또는 약관 미동의 시 종료
    if (Object.values(newErrors).some((error) => error)) {
      alert("모든 필드를 입력하고 이메일 인증 및 비밀번호를 일치시켜 주세요.");
      return;
    }
    if (!isPrivacyAgreed) {
      alert("개인정보 수집 및 이용에 동의해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 서버에 회원가입 요청 (모의 API 호출)
      alert("회원가입이 성공적으로 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      alert("회원가입 실패. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }, [
    email,
    password,
    passwordConfirm,
    name,
    isEmailVerified,
    isPrivacyAgreed,
    navigate,
  ]);

  // 공통 입력 필드 스타일 정의
  const inputFieldStyles = (error: boolean) => ({
    borderRadius: "7px",
    backgroundColor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    border: error ? "2px solid red" : "1px solid #ccc",
    "&:hover": {
      border: error ? "2px solid red" : "1px solid #3288FF",
    },
    "&.Mui-focused": {
      border: error ? "2px solid red" : "1px solid #3288FF",
    },
    "& .MuiInputBase-input": {
      padding: "12px 14px",
    },
  });

  return (
    <Stack
      minHeight="100vh"
      justifyContent="center"
      alignItems="center"
      gap={2}
      sx={{
        backgroundColor: "#fff",
        padding: 2,
      }}
    >
      <Stack
        gap={3}
        sx={{
          width: { xs: "90%", sm: "60%", md: "400px" },
        }}
      >
        {/* 로고 섹션 */}
        <Typography
          variant="h5"
          color="#3288FF"
          fontWeight="bold"
          sx={{ mb: 3, mr: 35, mt: 1, fontSize: "24px" }}
        >
          Wanna Trip
        </Typography>

        {/* 아이디/비밀번호 타이틀 섹션 */}
        <Stack gap={2}>
          <Stack display="flex" justifyContent="space-between">
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="35%"
            >
              <Typography
                color="text.primary"
                fontWeight="bold"
                fontSize={"15px"}
              >
                로그인/회원가입
              </Typography>
            </Box>
            <Box width="80%" />

            <Box
              sx={{
                width: "100%",
                height: "2px",
                mt: 1,
                background: "linear-gradient(to right, #3288FF 35%, #ccc 20%)",
              }}
            />
          </Stack>
          {/* 입력 필드 섹션 */}
          <Stack gap={1}>
            {/* 이메일 입력과 인증요청 버튼을 한 행에 나눠 배치 */}
            <Stack direction="row" spacing={1}>
              {/* 이메일 입력 필드 */}
              <OutlinedInput
                fullWidth
                type="email"
                placeholder="이메일(아이디)"
                value={email}
                onChange={handleEmailChange}
                sx={inputFieldStyles(errors.email)}
              />
              {/* 인증요청 버튼 */}
              <Button
                variant="outlined"
                color="primary"
                onClick={handleVerifyEmail}
                disabled={isLoading || isEmailVerified}
                sx={{
                  width: "120px",
                  borderRadius: "7px",
                  backgroundColor: "transparent",
                  color: isEmailVerified ? "#ccc" : "#3288FF",
                  borderColor: "#3288FF",
                  borderWidth: "1px",
                  "&:hover": {
                    borderColor: isEmailVerified ? "#ccc" : "#3288FF",
                    backgroundColor: "transparent",
                  },
                }}
              >
                <Typography variant="subtitle1" sx={{ fontSize: "14px" }}>
                  {isEmailVerified ? "인증완료" : "인증요청"}
                </Typography>
              </Button>
            </Stack>

            {/* 비밀번호 입력 필드 */}
            <OutlinedInput
              fullWidth
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={handlePasswordChange}
              sx={inputFieldStyles(errors.password)}
            />

            {/* 비밀번호 재확인 입력 필드 */}
            <OutlinedInput
              fullWidth
              type="password"
              placeholder="비밀번호 재확인"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              sx={inputFieldStyles(errors.passwordConfirm)}
            />

            {/* 닉네임 입력 필드 */}
            <OutlinedInput
              fullWidth
              type="text"
              placeholder="닉네임(별명)"
              value={name}
              onChange={handleNameChange}
              sx={inputFieldStyles(errors.name)}
            />
          </Stack>
        </Stack>

        {/* 이용약관 섹션 */}
        <Stack gap={1}>
          <Stack display="flex" justifyContent="space-between">
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="35%"
            >
              <Typography
                color="text.primary"
                fontWeight="bold"
                fontSize={"15px"}
              >
                이용약관
              </Typography>
            </Box>
            <Box width="80%" />

            <Box
              sx={{
                width: "100%",
                height: "2px",
                mt: 1,
                background: "linear-gradient(to right, #3288FF 35%, #ccc 20%)",
              }}
            />
          </Stack>
          {/* 이용약관 설명 */}
          <Stack gap={1}>
            {/* 전체 동의하기 체크박스 */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Checkbox
                checked={isTermsAgreed}
                onChange={handleAllTermsChange}
                color="primary"
              />
              <Typography variant="h6" fontWeight="bold">
                전체 동의하기
              </Typography>
            </Stack>

            {/* [필수] 개인정보 수집 및 이용 섹션 */}
            <Stack>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={isPrivacyAgreed}
                  onChange={handlePrivacyChange}
                  color="primary"
                />
                <Typography variant="body2">
                  <span style={{ color: "#3288FF" }}>[필수]</span> 개인정보 수집
                  및 이용
                </Typography>
              </Box>
              {/* 개인정보 동의 내용 박스 */}
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  p: 1,
                  ml: "42px",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  개인정보 수집 및 이용에 대한 동의 (필수 항목)
                  <br />
                  개인정보보호법에 따라 네이버에 회원가입 신청하시는 분께
                  수집하는 개인정보의 항목, 개인정보의 수집 및 이용목적,
                  개인정보의 보유 및 이용기간, 동의 거부권 및 동의 거부 시
                  불이익에 관한 사항을 안내 드리오니 자세히 읽은 후 동의하여
                  주시기 바랍니다.
                </Typography>
              </Box>
            </Stack>

            <Stack>
              {/* [선택] 위치기반서비스 이용약관 섹션 */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={isLocationAgreed}
                  onChange={handleLocationChange}
                  color="primary"
                />
                <Typography variant="body2">
                  <span style={{ color: "#666" }}>[선택]</span> 위치기반서비스
                  이용약관
                </Typography>
              </Box>
              {/* 위치기반서비스 동의 내용 박스 */}
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  p: 1,
                  ml: "42px",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  위치기반서비스 이용약관에 동의하시면, 위치를 활용한 광고 정보
                  수신 등을 포함하는 네이버 위치기반 서비스를 이용할 수
                  있습니다.
                  <br />제 1 조 (목적)
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
        {/* 회원가입 버튼 */}
        <Button
          variant="contained"
          onClick={handleRegisterButtonClick}
          disabled={
            isLoading ||
            !isPrivacyAgreed ||
            !isEmailVerified ||
            Object.values(errors).some((error) => error)
          }
          sx={{
            borderRadius: "10px",
            padding: "12px 0",
            backgroundColor: "#3288FF",
            "&:hover": { backgroundColor: "#2a77e0" },
            width: "100%", // 버튼 길이 전체로 확장
            alignSelf: "flex-end",
            mt: 2,
          }}
        >
          <Typography
            variant="h6"
            color="white"
            fontWeight="bold"
            sx={{ fontSize: "18px" }}
          >
            회원가입
          </Typography>
        </Button>
      </Stack>
    </Stack>
  );
};

export default Register;
