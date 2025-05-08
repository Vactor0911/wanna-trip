import {
  AppBar,
  Avatar,
  Badge,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { theme } from "../utils";
import { useCallback, useRef, useState } from "react";
import FaceRoundedIcon from "@mui/icons-material/FaceRounded";
import { green } from "@mui/material/colors";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const Links = [
  { text: "템플릿", to: "/template" },
  { text: "게시판", to: "/" },
  { text: "지도", to: "/" },
  { text: "소식", to: "/" },
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
}

const StyledLink = (props: StyledLinkProps) => {
  const { to, children, ...others } = props;
  return (
    <NavLink
      to={to}
      className={({ isActive, isPending }) =>
        isPending ? "pending" : isActive ? "active" : ""
      }
      css={{
        textDecoration: "none",
        color: "inherit",
        transition: "color 0.3s",
        "&.active": { color: theme.palette.primary.main },
      }}
      {...others}
    >
      {children}
    </NavLink>
  );
};

const Header = () => {
  const profileAnchorElement = useRef<HTMLButtonElement | null>(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleProfileMenuClose = useCallback(() => {
    setIsProfileMenuOpen(false);
  }, []);

  const handleProfileButtonClick = useCallback(() => {
    setIsProfileMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* 헤더 */}
      <AppBar
        color="info"
        sx={{
          boxShadow: "none",
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
            >
              {Links.map((link, index) => (
                <StyledLink key={`link-${index}`} to={link.to}>
                  <Typography variant="h5" fontWeight={500}>
                    {link.text}
                  </Typography>
                </StyledLink>
              ))}
            </Stack>

            {/* 아이콘 버튼 */}
            <Stack direction="row" gap={1} color="black">
              {/* 라이트/다크 모드 버튼 */}
              <IconButton color="inherit">
                <DarkModeOutlinedIcon fontSize="large" />
              </IconButton>

              {/* 알림 버튼 */}
              <IconButton color="inherit">
                <Badge badgeContent={100} color="primary" overlap="circular">
                  <NotificationsNoneOutlinedIcon fontSize="large" />
                </Badge>
              </IconButton>

              {/* 프로필 버튼 */}
              <IconButton
                color="inherit"
                ref={profileAnchorElement}
                onClick={handleProfileButtonClick}
              >
                <PermIdentityOutlinedIcon fontSize="large" />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
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
          width="300px"
          p={1}
          gap={1.5}
          sx={{
            paddingX: 2,
          }}
        >
          <Stack direction="row" alignItems="center" gap={1} color="black">
            {/* 프로필 이미지 */}
            <Avatar
              sx={{
                bgcolor: green[500],
              }}
            >
              <FaceRoundedIcon
                fontSize="large"
                sx={{
                  color: "black",
                }}
              />
            </Avatar>

            {/* 프로필 이름 */}
            <Typography variant="h5">홍길동님</Typography>

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
                    "--variant-textBg": "black",
                    "--variant-outlinedBg": "black",
                  },
                  "&:hover > .MuiTypography-root": {
                    color: "white",
                  },
                }}
              >
                <Typography variant="h6" color="black" fontWeight={500}>
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
