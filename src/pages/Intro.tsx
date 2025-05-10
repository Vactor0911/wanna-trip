import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"; //네이게이트를 사용하기 위해 추가
import { useAtomValue, useSetAtom } from "jotai";
import { kakaoLoginStateAtom } from "../state";

const Intro = () => {
  const navigate = useNavigate(); // 페이지 주소 이동을 위한 navigate 함수 선언
  const handleLoginButtonClick = useCallback(() => navigate("/login"), []); // 로그인 페이지로 이동
  const handleStartButtonClick = useCallback(() => navigate("/template"), []); // 템플릿 페이지로 이동

  const setKakaoLoginState = useSetAtom(kakaoLoginStateAtom);
  useEffect(() => {
    // 카카오 로그인 이어서 진행
    if (window.location.href.split("/?/").length > 1) {
      try {
        const link = window.location.href.split("/?/")[1];
        const parsedLink = link.split("&");
        const pageLink = `/${parsedLink[0]}`;

        // 원래의 로그인 페이지로 이동
        navigate(pageLink);

        // 카카오 로그인 코드 저장
        const code = parsedLink[1].substring(5);
        setKakaoLoginState(code);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setKakaoLoginState(""); // 카카오 로그인 코드 초기화
      }
    } else {
      setKakaoLoginState(""); // 카카오 로그인 코드 초기화
    }
  }, []);

  return (
    <>
      {/* 화면 비율에 따른 형식 지정 */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "start", md: "center" }}
        sx={{
          pt: { xs: 3, sm: 10, md: 13 },
        }}
      >
        <Stack gap={{ xs: 2, sm: 5, md: 8 }}>
          {/* 메인 텍스트 */}
          <Stack>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "7vw", sm: "2.8rem", md: "3.7rem" },
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              세상에서 제일{" "}
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                  fontSize: "inherit",
                }}
              >
                간단한 계획서
              </Box>
              는
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "7vw", sm: "3rem", md: "3.7rem" },
                fontWeight: 700,
                lineHeight: 1.3,
                whiteSpace: { xs: "normal", md: "nowrap" },
              }}
            >
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                  fontSize: "inherit",
                }}
              >
                여행갈래
              </Box>
              로 시작!
            </Typography>
            {/* 메인 텍스트 설명 */}
            <Typography
              sx={{
                fontSize: { xs: "3.5vw", sm: "1.3rem", md: "1.4rem" },
                fontWeight: 600,
              }}
            >
              여행 계획을 더욱 빠르고 스마트하게 템플릿으로 만들어보세요!
            </Typography>
          </Stack>

          {/* 시작 버튼 */}
          <Button
            variant="contained"
            onClick={handleStartButtonClick}
            sx={{
              width: { xs: "40vw", sm: "30vw", md: "25vw" },
              height: { xs: "3.5em", sm: "3.5em", md: "4em" },
              borderRadius: "15px",
              fontSize: { xs: "1.2em", sm: "1.5em", md: "1.8em" },
              fontWeight: "600",
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            바로 시작하기
          </Button>
        </Stack>
      </Stack>
    </>
  );
};

export default Intro;
