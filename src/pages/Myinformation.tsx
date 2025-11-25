import { useState, useCallback, useEffect, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CreateIcon from "@mui/icons-material/Create";
import FaceRoundedIcon from "@mui/icons-material/FaceRounded";
import { grey } from "@mui/material/colors";
import OutlinedTextField from "../components/OutlinedTextField";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import axiosInstance, {
  getCsrfToken,
  SERVER_HOST,
} from "../utils/axiosInstance";
import { useAtom } from "jotai";
import { wannaTripLoginStateAtom } from "../state";
import { resetStates } from "../utils";
import imageCompression from "browser-image-compression";
import { useSnackbar } from "notistack";

// 내 정보 인터페이스
interface UserInfo {
  userId: number;
  email: string;
  nickname: string;
  profileImage: string | null;
}

const Myinformation = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);

  // 작업 상태
  const [isNicknameUpdating, setIsNicknameUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  // 계정 탈퇴 관련 상태
  const [loginState, setWannaTripLoginState] = useAtom(wannaTripLoginStateAtom);
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

        // userData.profileImage가 null 또는 빈 문자열이 아닐 때만 URL 설정
        if (userData.profileImage) {
          setProfileImage(`${SERVER_HOST}${userData.profileImage}`);
        } else {
          setProfileImage(null); // 명시적으로 null 설정하여 기본 아이콘 표시되도록 함
        }
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

  // 프로필 이미지 클릭 처리
  const handleProfileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 이미지 압축 함수
  const compressImage = async (file: File): Promise<File> => {
    // 1MB 이하면 압축하지 않음
    if (file.size <= 1024 * 1024) return file;

    const options = {
      maxSizeMB: 1, // 최대 1MB
      maxWidthOrHeight: 1024, // 최대 해상도 1024px
      initialQuality: 0.8, // 초기 품질 80%
      useWebWorker: true,
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("이미지 압축 실패:", error);
      return file; // 압축 실패 시 원본 반환
    }
  };

  // 파일 변경 핸들러
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 파일 타입 검증
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        enqueueSnackbar(
          "지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP 형식만 업로드할 수 있습니다.",
          { variant: "error" }
        );
        return;
      }

      try {
        setIsUploading(true);

        // 이미지 압축
        const compressedFile = await compressImage(file);

        // 파일 크기 검증 (4MB)
        if (compressedFile.size > 4 * 1024 * 1024) {
          enqueueSnackbar("파일 크기는 4MB를 초과할 수 없습니다.", {
            variant: "error",
          });
          return;
        }

        // FormData 생성
        const formData = new FormData();
        formData.append("profileImage", compressedFile);

        // CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();

        // 업로드 API 호출
        const response = await axiosInstance.post(
          "/auth/me/profile-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRF-Token": csrfToken,
            },
          }
        );

        if (response.data.success) {
          // 캐시 방지를 위한 타임스탬프 추가
          const imageUrl = `${SERVER_HOST}${
            response.data.data.profileImage
          }?t=${new Date().getTime()}`;
          setProfileImage(imageUrl);

          // 이미지 버전 증가 (강제 리렌더링 유도)
          setImageVersion((prev) => prev + 1);

          // 성공 메시지 표시
          enqueueSnackbar("프로필 이미지가 성공적으로 업로드되었습니다.", {
            variant: "success",
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("프로필 이미지 업로드 실패:", err);
        enqueueSnackbar(
          err.response?.data?.message || "이미지 업로드에 실패했습니다.",
          { variant: "error" }
        );
      } finally {
        setIsUploading(false);
        // 파일 입력 초기화
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [enqueueSnackbar]
  );

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
      enqueueSnackbar("닉네임을 입력해주세요.", { variant: "error" });
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
        enqueueSnackbar("닉네임이 성공적으로 변경되었습니다.", {
          variant: "success",
        });

        // 사용자 정보 다시 불러오기
        fetchUserInfo();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("닉네임 변경 실패:", err);
      enqueueSnackbar(
        err.response?.data?.message || "닉네임 변경에 실패했습니다.",
        { variant: "error" }
      );
    } finally {
      setIsNicknameUpdating(false);
    }
  }, [nickname, enqueueSnackbar, fetchUserInfo]);

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
      enqueueSnackbar("현재 비밀번호를 입력해주세요.", { variant: "error" });
      return;
    }

    if (!newPassword) {
      enqueueSnackbar("새 비밀번호를 입력해주세요.", { variant: "error" });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      enqueueSnackbar("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.", {
        variant: "error",
      });
      return;
    }

    // 현재 비밀번호와 새 비밀번호가 동일한지 확인
    if (currentPassword === newPassword) {
      enqueueSnackbar("새 비밀번호는 기존 비밀번호와 달라야 합니다.", {
        variant: "error",
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
        enqueueSnackbar("비밀번호가 성공적으로 변경되었습니다.", {
          variant: "success",
        });

        // 비밀번호 입력 필드 초기화
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("비밀번호 변경 실패:", err);
      enqueueSnackbar(
        err.response?.data?.message || "비밀번호 변경에 실패했습니다.",
        { variant: "error" }
      );
    } finally {
      setIsPasswordUpdating(false);
    }
  }, [currentPassword, newPassword, confirmNewPassword, enqueueSnackbar]);

  // 계정 탈퇴 다이얼로그 열기
  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
    setDeleteConfirmPassword("");
  };

  // 계정 탈퇴 다이얼로그 닫기
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteConfirmPassword("");
  };

  // 계정 탈퇴 처리
  const handleDeleteAccount = useCallback(async () => {
    // 일반 계정이고 비밀번호가 비어있으면 검증
    if (loginState.loginType === "normal" && !deleteConfirmPassword.trim()) {
      enqueueSnackbar("계정 탈퇴를 위해 비밀번호를 입력해주세요.", {
        variant: "error",
      });
      return;
    }

    try {
      setIsDeleting(true);

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 계정 탈퇴 API 호출
      const response = await axiosInstance.post(
        "/auth/me/delete",
        { password: deleteConfirmPassword },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 로그인 상태 초기화
        resetStates(setWannaTripLoginState);

        // 다이얼로그 닫기
        handleCloseDeleteDialog();

        // 성공 알림 후 로그인 페이지로 이동
        alert("계정이 성공적으로 탈퇴되었습니다.");
        navigate("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("계정 탈퇴 실패:", err);
      enqueueSnackbar(
        err.response?.data?.message || "계정 탈퇴에 실패했습니다.",
        { variant: "error" }
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    loginState.loginType,
    deleteConfirmPassword,
    enqueueSnackbar,
    setWannaTripLoginState,
    navigate,
  ]);

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
          {/* 프로필 사진 섹션 */}
          <Stack direction="row" alignItems="center" gap={2}>
            <IconButton
              onClick={handleProfileClick}
              sx={{ p: 0, "&:hover": { backgroundColor: "transparent" } }}
              disabled={isUploading}
            >
              <Avatar
                key={`profile-image-${imageVersion}`} // 버전이 바뀔 때마다 Avatar를 강제로 리렌더링
                // 프로필 이미지가 없을 경우 기본 아이콘 표시
                src={profileImage || undefined}
                sx={{
                  width: 98,
                  height: 98,
                  backgroundColor: theme.palette.primary.main, // 헤더와 동일한 배경색
                  position: "relative",
                }}
              >
                {/* 프로필 이미지가 없을 경우 기본 아이콘 표시 */}
                {!profileImage && (
                  <FaceRoundedIcon
                    sx={{
                      width: "90%",
                      height: "90%",
                      color: grey[100], // 헤더와 동일한 아이콘 색상
                    }}
                  />
                )}
                {/* 업로드 중 로딩 표시 */}
                {isUploading && (
                  <CircularProgress
                    size={40}
                    sx={{
                      position: "absolute",
                      color: "white",
                    }}
                  />
                )}
              </Avatar>

              {/* 편집 아이콘 */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.palette.primary.main,
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

            {/* 숨겨진 파일 입력 */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
            />

            {/* 이미지 업로드 안내 */}
            <Stack gap={1}>
              <Typography variant="body2" color="textSecondary">
                98x98픽셀 이상, 4MB 이하의 사진을 권장합니다.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                지원 형식: JPG, PNG, GIF, WEBP
              </Typography>
              <Button
                onClick={handleProfileClick}
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

        {/* 비밀번호 변경 섹션 */}
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

        {/* 계정 탈퇴 섹션 */}
        <Stack mt={4}>
          <Button
            variant="text"
            onClick={handleOpenDeleteDialog}
            sx={{
              color: "red",
              p: 0,
              minWidth: "auto",
              justifyContent: "flex-start",
              "&:hover": {
                backgroundColor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            <Typography variant="body2">계정 탈퇴</Typography>
          </Button>
        </Stack>
        {/* 계정 탈퇴 확인 다이얼로그 */}
        <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
          <DialogTitle>계정 탈퇴 확인</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 1 }}>
              계정을 탈퇴하시면 모든 데이터가 삭제됩니다.
            </Typography>
            <Typography variant="body1">
              정말로{" "}
              <Box
                component="span"
                sx={{ color: "error.main", fontWeight: "bold" }}
              >
                탈퇴
              </Box>
              하시겠습니까?
            </Typography>

            {loginState.loginType === "normal" && (
              <OutlinedTextField
                label="비밀번호 확인"
                type="password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                autoComplete="current-password"
                fullWidth
                margin="dense"
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>취소</Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              sx={{ color: "red" }}
            >
              {isDeleting ? <CircularProgress size={24} /> : "확인"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
};
export default Myinformation;
