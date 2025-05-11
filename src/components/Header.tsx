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
import { useCallback, useRef, useState } from "react";
import FaceRoundedIcon from "@mui/icons-material/FaceRounded";
import { grey } from "@mui/material/colors";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { getAccessToken } from "../utils/accessToken";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { resetStates } from "../utils";
import { wannaTripLoginStateAtom } from "../state";
import { useAtom } from "jotai";
import { jwtDecode } from "jwt-decode";

const Links = [
  { text: "템플릿", to: "/template" },
  { text: "게시판", to: "/community" },
  { text: "지도", to: "/map" },
  { text: "소식", to: "/news" },
];

const MenuLinks = [
  { text: "내 정보", to: "/" },
  { text: "좋아요 한 게시글", to: "/" },
  { text: "내가 쓴 댓글", to: "/" },
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

interface JwtPayload {
  name: string;
  // 필요한 다른 필드가 있다면 추가
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 네비게이션 훅
  const profileAnchorElement = useRef<HTMLButtonElement | null>(null); // 프로필 메뉴 앵커 요소
  const navMenuButtonAnchorElement = useRef<HTMLButtonElement | null>(null); // 네비게이션 메뉴 버튼 앵커 요소

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // 프로필 메뉴 열림 여부
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false); // 네비게이션 메뉴 열림 여부

  const [loginState, setWannaTripLoginState] = useAtom(wannaTripLoginStateAtom); // 로그인 상태
  const { isLoggedIn } = loginState; // 로그인 상태에서 isLoggedIn 추출

  // 프로필 메뉴 닫기
  const handleProfileMenuClose = useCallback(() => {
    setIsProfileMenuOpen(false);
  }, []);

  // 프로필 메뉴 버튼 클릭
  const handleProfileButtonClick = useCallback(() => {
    setIsProfileMenuOpen((prev) => !prev);
  }, []);

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
    },
    [navigate]
  );

  // 액세스 토큰 가져오기 및 디코드
  const token = getAccessToken();
  let userName = "홍길동님";
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      userName = decoded.name;
    } catch (error) {
      console.error("토큰 디코드 오류:", error);
    }
  }

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
        //TODO: 이거 리셋 함수 해줘요
        await resetStates(setWannaTripLoginState); // 상태 초기화
        setIsProfileMenuOpen(false);
        

        alert("로그아웃이 성공적으로 완료되었습니다."); // 성공 메시지

        navigate("/"); // 메인 페이지로 이동
      } else {
        alert("로그아웃 처리에 실패했습니다."); // 실패 메시지
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요."); // 에러 메시지
    }
  }, [isLoggedIn, navigate, setWannaTripLoginState]);
  // 로그아웃 기능 구현 끝

  // 로그인, 회원가입 페이지에서는 헤더 숨김
  if (location.pathname === "/login" || location.pathname === "/register") {
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
                <Typography variant="h4" color="primary">
                  Wanna Trip
                </Typography>
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
                  <Badge badgeContent={100} color="primary" overlap="circular">
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
                    color={
                      location.pathname == link.to
                        ? "primary"
                        : theme.palette.black.main
                    }
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
              sx={{
                width: "36px",
                height: "36px",
                bgcolor: theme.palette.primary.main,
              }}
            >
              <FaceRoundedIcon
                sx={{
                  width: "90%",
                  height: "90%",
                  color: grey[100],
                }}
              />
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
                onClick={
                  link.text === "로그아웃" ? handleLogoutClick : undefined
                }
              >
                <Typography
                  variant="subtitle1"
                  color={theme.palette.black.main}
                  fontWeight={500}
                >
                  {link.text}
                </Typography>
              </Button>
            ))}
          </Stack>
        </Stack>
      </Menu>
    </>
  );
};

export default Header;
