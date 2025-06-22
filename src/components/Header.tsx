import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  ClickAwayListener,
  Collapse,
  Container,
  Divider,
  IconButton,
  Menu,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { theme } from "../utils/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import FaceRoundedIcon from "@mui/icons-material/FaceRounded";
import { grey } from "@mui/material/colors";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import axiosInstance, {
  getCsrfToken,
  SERVER_HOST,
} from "../utils/axiosInstance";
import { resetStates } from "../utils";
import { wannaTripLoginStateAtom } from "../state";
import { useAtom } from "jotai";
import Logo from "/icons/logo.svg";

const Links = [
  { text: "템플릿", to: "/template" },
  { text: "게시판", to: "/community" },
  { text: "지도", to: "/map" },
  { text: "소식", to: "/news" },
];

const MenuLinks = [
  { text: "내 정보", to: "/myinformation" },
  { text: "내 템플릿", to: "/template" },
  { text: "좋아요 한 게시글", to: "/" },
  { text: "로그아웃", to: "/" },
];

interface StyledLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const StyledLink = (props: StyledLinkProps) => {
  const { to, children, onClick, ...others } = props;
  return (
    <NavLink
      to={to}
      className={({ isActive, isPending }) =>
        isPending ? "pending" : isActive ? "active" : ""
      }
      css={{
        textDecoration: "none",
        color: theme.palette.black.main,
        transition: "color 0.3s",
        "&.active": { color: theme.palette.primary.main },
      }}
      onClick={onClick}
      {...others}
    >
      {children}
    </NavLink>
  );
};

// 헤더 숨기는 페이지 목록
const hiddenPages = [
  "/login",
  "/register",
  "/find-password",
  "/change-password",
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 네비게이션 훅
  const profileAnchorElement = useRef<HTMLButtonElement | null>(null); // 프로필 메뉴 앵커 요소
  const navMenuButtonAnchorElement = useRef<HTMLButtonElement | null>(null); // 네비게이션 메뉴 버튼 앵커 요소

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // 프로필 메뉴 열림 여부
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false); // 네비게이션 메뉴 열림 여부

  const [loginState, setWannaTripLoginState] = useAtom(wannaTripLoginStateAtom); // 로그인 상태
  const { isLoggedIn } = loginState; // 로그인 상태에서 isLoggedIn 추출

  // 프로필 이미지 관련련
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState(0); // (캐시 방지용)

  const [userName, setUserName] = useState<string>("사용자"); // 사용자 이름 초기값

  // 프로필 이미지 URL을 가져오는 함수
  const fetchUserProfile = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const csrfToken = await getCsrfToken();
      const response = await axiosInstance.get("/auth/me", {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        // 사용자 데이터
        const userData = response.data.data;

        // nickname 정보 저장 (백엔드에서 받아온 nickname 사용)
        if (userData.nickname) {
          setUserName(userData.nickname);
        }

        if (userData.profileImage) {
          // 프로필 이미지 URL 구성 (캐시 방지용 타임스탬프 추가)
          const imageUrl = `${SERVER_HOST}${
            userData.profileImage
          }?t=${new Date().getTime()}`;
          setProfileImage(imageUrl);
          // 이미지 버전 증가 ( 캐시 방지용 )
          setImageVersion((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error("사용자 프로필 정보 로드 실패:", err);
    }
  }, [isLoggedIn]);

  // useEffect 추가
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn, fetchUserProfile]);

  // 프로필 메뉴 닫기
  const handleProfileMenuClose = useCallback(() => {
    setIsProfileMenuOpen(false);
  }, []);

  // 프로필 메뉴 버튼 클릭
  const handleProfileButtonClick = useCallback(() => {
    // 메뉴를 열 때 최신 프로필 이미지 가져오기
    if (!isProfileMenuOpen) {
      fetchUserProfile(); // 메뉴가 열릴 때만 프로필 다시 가져오기
    }
    setIsProfileMenuOpen((prev) => !prev);
  }, [isProfileMenuOpen, fetchUserProfile]);

  // 네비게이션 메뉴 닫기
  const handleNavMenuClose = useCallback(
    (event: Event | React.SyntheticEvent) => {
      if (
        navMenuButtonAnchorElement.current &&
        navMenuButtonAnchorElement.current.contains(event.target as HTMLElement)
      ) {
        return;
      }
      setIsNavMenuOpen(false);
    },
    []
  );

  // 네비게이션 메뉴 버튼 클릭
  const handleNavMenuButtonClick = useCallback(() => {
    setIsNavMenuOpen((prev) => !prev);
  }, []);

  // 네비게이션 메뉴 링크 버튼 클릭
  const handleNavMenuLinkButtonClick = useCallback(
    (to: string) => {
      navigate(to);
      setIsNavMenuOpen(false);
      setIsProfileMenuOpen(false);
    },
    [navigate]
  );

  // 로그아웃 기능 구현 시작
  const handleLogoutClick = useCallback(async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    // CSRF 토큰 가져오기
    const csrfToken = await getCsrfToken();

    const response = await axiosInstance.post(
      "/auth/logout",
      {},
      {
        headers: {
          "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
        },
      }
    );

    try {
      if (response.data.success) {
        // Jotai 상태
        await resetStates(setWannaTripLoginState); // 상태 초기화
        setIsProfileMenuOpen(false);

        alert("로그아웃이 성공적으로 완료되었습니다."); // 성공 메시지
      } else {
        alert("로그아웃 처리에 실패했습니다."); // 실패 메시지
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요."); // 에러 메시지
    }
  }, [isLoggedIn, setWannaTripLoginState]);
  // 로그아웃 기능 구현 끝

  // 로그인, 회원가입 페이지에서는 헤더 숨김
  if (hiddenPages.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* 헤더 */}
      <AppBar
        color="info"
        position="relative"
        sx={{
          boxShadow: "none",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            borderBottom: `2px solid ${theme.palette.divider}`,
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              disableGutters
              sx={{
                height: "80px",
              }}
            >
              {/* 로고 */}
              <StyledLink to="/">
                <Stack direction="row" alignItems="center" gap={2}>
                  {/* 로고 아이콘 */}
                  <Box
                    component="img"
                    src={Logo}
                    height={42}
                    borderRadius={1}
                  />

                  {/* 로고 텍스트 */}
                  <Typography variant="h4" color="primary">
                    Wanna Trip
                  </Typography>
                </Stack>
              </StyledLink>

              {/* 네비게이션 바 */}
              <Stack
                direction="row"
                gap={{
                  sm: 3,
                  md: 5,
                  lg: 7,
                  xl: 10,
                }}
                justifyContent="center"
                flexGrow={1}
                display={{
                  xs: "none",
                  sm: "flex",
                }}
              >
                {Links.map((link, index) => (
                  <StyledLink key={`nav-link-${index}`} to={link.to}>
                    <Typography variant="h5" fontWeight={500}>
                      {link.text}
                    </Typography>
                  </StyledLink>
                ))}
              </Stack>

              {/* 아이콘 버튼 */}
              <Stack
                direction="row"
                gap={{
                  xs: 0.5,
                  sm: 1,
                }}
                color={theme.palette.black.main}
                justifyContent="flex-end"
                alignItems="center"
                flexGrow={{
                  xs: 1,
                  sm: 0,
                }}
                sx={{
                  "& > .MuiIconButton-root svg": {
                    fontSize: {
                      xs: "1.5rem",
                      sm: "2rem",
                    },
                  },
                }}
              >
                {/* 라이트/다크 모드 버튼 */}
                <IconButton color="inherit" size="small">
                  <DarkModeOutlinedIcon />
                </IconButton>

                {/* 알림 버튼 */}
                <IconButton color="inherit" size="small">
                  <Badge badgeContent={0} color="primary" overlap="circular">
                    <NotificationsNoneOutlinedIcon />
                  </Badge>
                </IconButton>

                {/* 프로필 버튼 */}
                <IconButton
                  color="inherit"
                  size="small"
                  ref={profileAnchorElement}
                  onClick={handleProfileButtonClick}
                >
                  <PermIdentityOutlinedIcon />
                </IconButton>

                {/* 네비게이션 메뉴 버튼 */}
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={handleNavMenuButtonClick}
                  ref={navMenuButtonAnchorElement}
                  sx={{
                    display: {
                      sm: "none",
                    },
                  }}
                >
                  <MenuRoundedIcon />
                </IconButton>
              </Stack>
            </Toolbar>
          </Container>
        </Box>

        {/* 모바일용 네비게이션 메뉴 */}
        <ClickAwayListener onClickAway={handleNavMenuClose}>
          <Collapse
            in={isNavMenuOpen}
            sx={{
              boxShadow: 3,
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100vw",
              background: "white",
            }}
          >
            <Stack p={1} paddingX={4} gap={0.5}>
              {Links.map((link, index) => (
                <Button
                  key={`mobile-nav-link-${index}`}
                  onClick={() => handleNavMenuLinkButtonClick(link.to)}
                  sx={{
                    justifyContent: "flex-start",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={500}
                    color={location.pathname == link.to ? "primary" : "black"}
                  >
                    {link.text}
                  </Typography>
                </Button>
              ))}
            </Stack>
          </Collapse>
        </ClickAwayListener>
      </AppBar>

      {/* 프로필 메뉴 */}
      <Menu
        anchorEl={profileAnchorElement.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
      >
        {isLoggedIn ? (
          // 로그인 상태일 때
          <Stack
            width="250px"
            p={1}
            gap={1.5}
            sx={{
              paddingX: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              color={theme.palette.black.main}
            >
              {/* 프로필 이미지 */}
              <Avatar
                key={`profile-image-${imageVersion}`}
                src={profileImage || undefined}
                sx={{
                  width: "36px",
                  height: "36px",
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {!profileImage && (
                  <FaceRoundedIcon
                    sx={{
                      width: "90%",
                      height: "90%",
                      color: grey[100],
                    }}
                  />
                )}
              </Avatar>

              {/* 프로필 이름 */}
              <Typography variant="h6">{userName}</Typography>

              {/* 닫기 버튼 */}
              <Stack flex={1} alignItems="flex-end">
                <IconButton color="inherit" onClick={handleProfileMenuClose}>
                  <CloseRoundedIcon />
                </IconButton>
              </Stack>
            </Stack>

            <Divider />

            {/* 링크 버튼 */}
            <Stack gap={0.5}>
              {MenuLinks.map((link, index) => (
                <Button
                  key={`menu-link-${index}`}
                  color="info"
                  sx={{
                    justifyContent: "flex-start",
                    borderRadius: "50px",
                    pl: 2,
                    "&:hover": {
                      "--variant-containedBg": "white",
                      "--variant-textBg": theme.palette.primary.main,
                      "--variant-outlinedBg": theme.palette.primary.main,
                    },
                    "&:hover > .MuiTypography-root": {
                      color: "white",
                    },
                  }}
                  onClick={() => {
                    if (link.text === "로그아웃") {
                      handleLogoutClick();
                    } else {
                      navigate(link.to); // 해당 경로로 이동
                      setIsProfileMenuOpen(false); // 메뉴 닫기
                    }
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="black"
                    fontWeight={500}
                  >
                    {link.text}
                  </Typography>
                </Button>
              ))}
            </Stack>
          </Stack>
        ) : (
          // 로그인 상태가 아닐 때
          <Stack p="8px 16px" gap={1}>
            {/* 문구 */}
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: "12px" }}
            >
              여행갈래로 계획을 더 쉽고 편리하게
            </Typography>

            {/* 로그인 버튼 */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleProfileMenuClose();
                navigate("/login");
              }}
              sx={{
                height: "60px",
                borderRadius: "6px",
                textTransform: "none",
              }}
            >
              <Typography variant="h6">Wanna Trip 로그인</Typography>
            </Button>
          </Stack>
        )}
      </Menu>
    </>
  );
};

export default Header;
