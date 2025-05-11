import { theme } from '../utils/index';
import BackgroundImage from '../assets/images/background.png';
import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { kakaoLoginStateAtom, wannaTripLoginStateAtom } from '../state';
import { useCallback, useEffect } from 'react';

const Main = () => {
  const navigate = useNavigate(); // 페이지 주소 이동을 위한 navigate 함수 선언
  const handleLoginButtonClick = useCallback(() => navigate('/login'), []); // 로그인 페이지로 이동
  const handleStartButtonClick = useCallback(() => navigate('/template'), []); // 템플릿 페이지로 이동

  // 로그인 된 상태면 템플릿 페이지로 이동
  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);
  if (wannaTripLoginState.isLoggedIn) {
    navigate('/template');
  }

  const setKakaoLoginState = useSetAtom(kakaoLoginStateAtom);
  useEffect(() => {
    // 카카오 로그인 이어서 진행
    if (window.location.href.split('/?/').length > 1) {
      try {
        const link = window.location.href.split('/?/')[1];
        const parsedLink = link.split('&');
        const pageLink = `/${parsedLink[0]}`;

        // 원래의 로그인 페이지로 이동
        navigate(pageLink);

        // 카카오 로그인 코드 저장
        const code = parsedLink[1].substring(5);
        setKakaoLoginState(code);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setKakaoLoginState(''); // 카카오 로그인 코드 초기화
      }
    } else {
      setKakaoLoginState(''); // 카카오 로그인 코드 초기화
    }
  }, []);

  return (
    <Stack
      width="100%"
      minHeight="100vh"
      justifyContent="center"
      alignItems="center"
      gap={3}
      sx={{
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        zIndex: 1,
        '&:before': {
          content: '""',
          position: 'absolute',
          width: '88%',
          height: '88%',
          backgroundImage: `url(${BackgroundImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          opacity: 0.3,
          zIndex: -1,
        },
      }}
    >
      <Typography variant="h1" color="white" fontSize="4em">
        여행갈래?
      </Typography>
      <Typography
        variant="h2"
        color="white"
        fontSize="2.3em"
        fontWeight={700}
        textAlign="center"
      >
        세상에서 가장 간단한 계획서
      </Typography>
      <Stack width={{ md: '240px', xs: '180px' }} gap={3}>
        <Button
          onClick={handleStartButtonClick}
          variant="contained"
          sx={{
            padding: '16px 0',
          }}
        >
          <Typography variant="h1">시작하기</Typography>
        </Button>
        <Button
          onClick={handleLoginButtonClick}
          variant="contained"
          sx={{
            padding: '16px 0',
          }}
        >
          <Typography variant="h1">로그인</Typography>
        </Button>
      </Stack>
    </Stack>
  );
};

export default Main;
