import {
  AppBar,
  Badge,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { theme } from "../utils";

const Links = [
  { text: "템플릿", to: "/template" },
  { text: "게시판", to: "/" },
  { text: "지도", to: "/" },
  { text: "소식", to: "/" },
];

interface StyledLinkProps {
  to: string;
  children: React.ReactNode;
}

const StyledLink = (props: StyledLinkProps) => {
  const { to, children, ...others } = props;
  return (
    <Link
      to={to}
      style={{ textDecoration: "none", color: "inherit" }}
      {...others}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  return (
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
            <Typography variant="h4">여행갈래</Typography>
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
          <Box color="black">
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
            <IconButton color="inherit">
              <PermIdentityOutlinedIcon fontSize="large" />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
