import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  IconButton,
  InputAdornment,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CreateIcon from "@mui/icons-material/Create";
import PersonIcon from "@mui/icons-material/Person";
import OutlinedTextField from "../components/OutlinedTextField";
import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";

// 내 정보 인터페이스
interface UserInfo {
  userId: number;
  email: string;
  nickname: string;
  profileImage: string | null;
}

const Myinformation = () => {
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 입력 필드 상태
  const [nickname, setNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // 현재 비밀번호
  const [newPassword, setNewPassword] = useState(""); // 새 비밀번호
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // 새 비밀번호 확인

  // 비밀번호 표시 여부 상태
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState(false);

  // 이미지 상태
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 작업 상태
  const [isNicknameUpdating, setIsNicknameUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  // 알림 상태
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // 사용자 정보 로딩
  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 사용자 정보 조회 API 호출
      const response = await axiosInstance.get("/auth/me", {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        const userData = response.data.data;
        setUserInfo(userData);
        setNickname(userData.nickname);
        setProfileImage(userData.profileImage);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("사용자 정보 조회 실패:", err);
      setError(
        err.response?.data?.message || "사용자 정보를 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 사용자 정보 로딩
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // 닉네임 변경 입력
  const handleNicknameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNickname(e.target.value);
    },
    []
  );

  // 닉네임 변경 요청
  const handleUpdateNickname = useCallback(async () => {
    // 입력값 검증
    if (!nickname.trim()) {
      setSnackbar({
        open: true,
        message: "닉네임을 입력해주세요.",
        severity: "error",
      });
      return;
    }

    try {
      setIsNicknameUpdating(true);

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 닉네임 변경 API 호출
      const response = await axiosInstance.patch(
        "/auth/me/nickname",
        { nickname },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "닉네임이 성공적으로 변경되었습니다.",
          severity: "success",
        });

        // 사용자 정보 다시 불러오기
        fetchUserInfo();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("닉네임 변경 실패:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "닉네임 변경에 실패했습니다.",
        severity: "error",
      });
    } finally {
      setIsNicknameUpdating(false);
    }
  }, [nickname, fetchUserInfo]);

  // 비밀번호 변경 입력 핸들러
  const handlePasswordChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
      },
    []
  );

  // 비밀번호 표시/숨김 토글 핸들러
  const handlePasswordVisibilityToggle = useCallback(
    (
        setter: React.Dispatch<React.SetStateAction<boolean>>,
        currentVisibility: boolean
      ) =>
      () => {
        setter(!currentVisibility);
      },
    []
  );

  // 비밀번호 변경 요청
  const handleUpdatePassword = useCallback(async () => {
    // 입력값 검증
    if (!currentPassword) {
      setSnackbar({
        open: true,
        message: "현재 비밀번호를 입력해주세요.",
        severity: "error",
      });
      return;
    }

    if (!newPassword) {
      setSnackbar({
        open: true,
        message: "새 비밀번호를 입력해주세요.",
        severity: "error",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSnackbar({
        open: true,
        message: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        severity: "error",
      });
      return;
    }

    // 현재 비밀번호와 새 비밀번호가 동일한지 확인
    if (currentPassword === newPassword) {
      setSnackbar({
        open: true,
        message: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
        severity: "error",
      });
      return;
    }

    // // 비밀번호 복잡성 검증 - utils의 함수 사용
    // if (!isPasswordLengthValid(newPassword)) {
    //   setSnackbar({
    //     open: true,
    //     message: "비밀번호는 8자 이상이어야 합니다.",
    //     severity: "error",
    //   });
    //   return;
    // }

    // if (!isPasswordCombinationValid(newPassword)) {
    //   setSnackbar({
    //     open: true,
    //     message:
    //       "비밀번호는 영문, 숫자, 특수문자(!@#$%^&*?)를 모두 포함해야 합니다.",
    //     severity: "error",
    //   });
    //   return;
    // }

    try {
      setIsPasswordUpdating(true);

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 비밀번호 변경 API 호출
      const response = await axiosInstance.patch(
        "/auth/me/password",
        {
          currentPassword,
          newPassword,
          confirmNewPassword,
        },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "비밀번호가 성공적으로 변경되었습니다.",
          severity: "success",
        });

        // 비밀번호 입력 필드 초기화
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("비밀번호 변경 실패:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "비밀번호 변경에 실패했습니다.",
        severity: "error",
      });
    } finally {
      setIsPasswordUpdating(false);
    }
  }, [currentPassword, newPassword, confirmNewPassword]);

  // 프로필 이미지 클릭 핸들러 (추후 구현)
  const handleProfileClick = useCallback(() => {
    // 프로필 이미지 업로드 기능은 추후 구현 예정
    console.log("Profile image clicked - to be implemented");
  }, []);

  // 알림 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <Container maxWidth="xs">
        <Stack height="100vh" justifyContent="center" alignItems="center">
          <CircularProgress />
          <Typography mt={2}>사용자 정보를 불러오는 중입니다...</Typography>
        </Stack>
      </Container>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <Container maxWidth="xs">
        <Stack height="100vh" justifyContent="center" alignItems="center">
          <Typography color="error">{error}</Typography>
          <Button variant="contained" onClick={fetchUserInfo} sx={{ mt: 2 }}>
            다시 시도
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Stack mt={7} gap={4}>
        {/* 내정보 */}
        <Stack gap={3}>
          <SectionHeader title="내정보" />
          {/* Profile Picture Section */}
          <Stack direction="row" alignItems="center" gap={2}>
            <IconButton
              onClick={handleProfileClick}
              sx={{ p: 0, "&:hover": { backgroundColor: "transparent" } }}
            >
              <Avatar
                // 프로필 이미지가 없을 경우 기본 아이콘 표시
                src={profileImage || undefined}
                sx={{
                  width: 98,
                  height: 98,
                  backgroundColor: "#e0e0e0",
                  position: "relative",
                }}
              >
                {/* 프로필 이미지가 없을 경우 기본 아이콘 표시 */}
                {!profileImage && (
                  <PersonIcon sx={{ fontSize: "75px", color: "gray" }} />
                )}
              </Avatar>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#d9d9d9",
                  borderRadius: "50%",
                  p: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "2px solid white",
                }}
              >
                <CreateIcon sx={{ color: "white", fontSize: "16px" }} />
              </Box>
            </IconButton>

            {/* 최소 규격 & 업로드 */}
            <Stack gap={1}>
              <Typography variant="body2" color="textSecondary">
                98x98픽셀 이상, 4MB 이하에 사진이 권장합니다.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderRadius: "8px",
                  width: "100px",
                  height: "36px",
                }}
              >
                <Typography>업로드</Typography>
              </Button>
            </Stack>
          </Stack>

          <Stack gap={1}>
            {/* 이메일 */}
            <Stack>
              <OutlinedTextField
                label="아이디(이메일)"
                value={userInfo?.email || ""}
                readOnly
              />
            </Stack>

            {/* 별명 변경 */}
            <Stack direction="row" gap={0.7}>
              <Box flex={3}>
                <OutlinedTextField
                  label="닉네임(별명)"
                  value={nickname}
                  onChange={handleNicknameChange}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={handleUpdateNickname}
                disabled={isNicknameUpdating}
                sx={{
                  borderRadius: "8px",
                  width: "80px",
                }}
              >
                {isNicknameUpdating ? (
                  <CircularProgress size={20} />
                ) : (
                  <Typography>수정</Typography>
                )}
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {/* Change Password Section */}
        <Stack gap={1}>
          <SectionHeader title="비밀번호 변경" />
          <OutlinedTextField
            label="현재 비밀번호"
            type={isCurrentPasswordVisible ? "text" : "password"}
            value={currentPassword}
            onChange={handlePasswordChange(setCurrentPassword)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handlePasswordVisibilityToggle(
                    setIsCurrentPasswordVisible,
                    isCurrentPasswordVisible
                  )}
                  edge="end"
                >
                  {isCurrentPasswordVisible ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
          <OutlinedTextField
            label="새 비밀번호"
            type={isNewPasswordVisible ? "text" : "password"}
            value={newPassword}
            onChange={handlePasswordChange(setNewPassword)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handlePasswordVisibilityToggle(
                    setIsNewPasswordVisible,
                    isNewPasswordVisible
                  )}
                  edge="end"
                >
                  {isNewPasswordVisible ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
          <OutlinedTextField
            label="새 비밀번호 확인"
            type={isConfirmNewPasswordVisible ? "text" : "password"}
            value={confirmNewPassword}
            onChange={handlePasswordChange(setConfirmNewPassword)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handlePasswordVisibilityToggle(
                    setIsConfirmNewPasswordVisible,
                    isConfirmNewPasswordVisible
                  )}
                  edge="end"
                >
                  {isConfirmNewPasswordVisible ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleUpdatePassword}
              disabled={isPasswordUpdating}
              sx={{
                borderRadius: "8px",
                width: "80px",
                height: "36px",
              }}
            >
              {isPasswordUpdating ? (
                <CircularProgress size={20} />
              ) : (
                <Typography>확인</Typography>
              )}
            </Button>
          </Box>
        </Stack>

        {/* Account Deletion Section */}
        <Stack mt={4}>
          <Link to="#" style={{ textDecoration: "none" }}>
            <Typography variant="body2" sx={{ color: "red" }}>
              계정 탈퇴
            </Typography>
          </Link>
        </Stack>
      </Stack>

      {/* 알림 메시지 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
export default Myinformation;
