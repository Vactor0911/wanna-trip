import {
  Box,
  ButtonBase,
  Container,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import GithubIcon from "../assets/icons/github.png";
import { useCallback } from "react";
import { useLocation } from "react-router";

const Footer = () => {
  const theme = useTheme();
  const location = useLocation();

  // 깃허브 아이콘 버튼 클릭
  const handleGithubButtonClick = useCallback(() => {
    window.open("https://github.com/Vactor0911/wanna-trip", "_blank");
  }, []);

  // 템플릿 페이지의 경우 푸터 숨김
  if (location.pathname.startsWith("/template/")) {
    return null;
  }
  return (
    <Box borderTop={`1px solid ${theme.palette.divider}`}>
      <Container maxWidth="xl">
        <Stack
          width="100%"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          py={4}
        >
          {/* 좌측 타이포 */}
          <Typography variant="body1">WannaTrip.All right reserved</Typography>

          {/* 깃허브 아이콘 버튼 */}
          <ButtonBase
            sx={{
              borderRadius: "50%",
            }}
            onClick={handleGithubButtonClick}
          >
            <Box component="img" src={GithubIcon} width={40} />
          </ButtonBase>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
