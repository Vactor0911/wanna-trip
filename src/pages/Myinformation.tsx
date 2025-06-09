import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  IconButton,
  InputAdornment,
  Avatar,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CreateIcon from "@mui/icons-material/Create";
import PersonIcon from "@mui/icons-material/Person";
import OutlinedTextField from "../components/OutlinedTextField";
import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";

const Myinformation = () => {
  const [nickname, setNickname] = useState("서허니"); // Initial nickname
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null); // Add profileImage state

  const handleNicknameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNickname(e.target.value);
    },
    []
  );

  const handlePasswordChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
      },
    []
  );

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

  const handleProfileClick = useCallback(() => {
    // TODO: Add profile image upload logic here
    console.log("Profile image clicked");
  }, []);

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
                sx={{
                  width: 98,
                  height: 98,
                  backgroundColor: "#e0e0e0",
                  position: "relative",
                }}
              >
                <PersonIcon sx={{ fontSize: "75px", color: "gray" }} />
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
                value="gomdoli4471@gmail.com"
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
                sx={{
                  borderRadius: "8px",
                  width: "80px",
                }}
              >
                <Typography>수정</Typography>
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
              sx={{
                borderRadius: "8px",
                width: "80px",
                height: "36px",
              }}
            >
              <Typography>확인</Typography>
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
    </Container>
  );
};
export default Myinformation;
