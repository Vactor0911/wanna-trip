import React, { useState } from "react";
import styled from "@emotion/styled"; // 스타일 추가
import { Button } from "@mui/material"; // 버튼 추가
import DownloadIcon from "@mui/icons-material/Download"; // 다운로드 아이콘 추가
import SaveIcon from "@mui/icons-material/Save"; // 저장 아이콘 추가
import { useNavigate } from "react-router-dom";
import { Margin } from "@mui/icons-material";
import axios from "axios";

import { useAtomValue, useSetAtom } from "jotai"; // useAtomValue : useSetAtom 값 불러오기, useSetAtom : 값 설정하기
import { loginStateAtom } from "../state"; // loginState 불러오기
import LoginButton from "../components/LoginButton";

import Card from "../components/Card"; // Card 컴포넌트 추가

interface Plan {
  time: string;
  activity: string;
  image: string;
}

interface DayPlans {
  day1: Plan[];
}

const Style = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  height: 100vh;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    padding: 10px 20px;
    background-color: #47536b;
    height: 80px;
  }

  header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    color: white;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    width: calc(100% - 25px);
    height: 100%;

    background-color: #2d405e;
    position: relative;
  }

  .template-title {
    display: flex;
    justify-content: space-between;
    height: 100px;
    align-items: center;

    padding: 10px 50px;
    padding-right: 20px;
    color: white;
  }

  .template-title .button-container {
    display: flex;
    gap: 1em;
  }

  .board-container {
    display: flex;
    padding: 20px 50px;
    background-color: #344056;
    width: 100%;
    height: 100%;
  }

  .left-menu {
    display: flex;
    position: absolute;
    width: 35px;
    height: 100%;

    top: 0;
    left: -25px;
    background-color: #4d5d77;
    transition: width 0.2s ease-in-out;
  }

  .left-menu:hover {
    /* 예시 (호버로 만들거 아님; 알아서 버튼 클릭하면 토글되게 ㄱㄱ) */
    width: 300px;
  }

  .board-container .board-box {
    display: flex;
    flex-direction: column;
    width: 25%;
    height: 100%;
    background-color: #344056;
  }

  .board-container {
    overflow-x: auto; /* 가로 스크롤 허용 */
    max-height: 1000px; /* 최대 높이 제한 */
  }

  @media (max-width: 768px) {
  }

  @media (max-width: 480px) {
  }
`;

const Template = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/login");
  // const [email, setEmail] = useState(''); // 사용자 이메일
  // const [password, setPassword] = useState(''); // 사용자 비밀번호

  const PORT = 3005; // server/index.js 에 설정한 포트 번호 - 임의로 로컬서버라 이건 알아서 수정하면 됨
  const HOST = "http://localhost"; // 임의로 로컬서버라 이건 알아서 수정하면 됨
  const { isLoggedIn, email, loginType, loginToken } =
    useAtomValue(loginStateAtom); // 로그인 상태 읽기
  const setLoginState = useSetAtom(loginStateAtom); // 상태 업데이트

  // Access Token 갱신 함수
  const refreshAccessToken = () => {
    return axios
      .post(`${HOST}:${PORT}/api/token/refresh`, { email })
      .then((response) => {
        const newToken = response.data.token;
        setLoginState((prevState) => ({
          ...prevState,
          loginToken: newToken, // 갱신된 토큰 저장
        }));
        return newToken; // 갱신된 토큰 반환
      })
      .catch((error) => {
        console.error("Access Token 갱신 실패:", error);
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        setLoginState({
          isLoggedIn: false, // 로그인 상태 초기화
          email: "", // 이메일 초기화
          loginType: "normal", // 로그인 타입 초기화
          loginToken: "", // 토큰 초기화
        });
        navigate("/login"); // 로그인 페이지로 이동
      });
  };

  // 로그아웃 기능 구현 시작
  const handleLogoutClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다."); // 로그인 상태가 아닌 경우 알림
      return;
    }

    let currentToken = loginToken;

    // Access Token 갱신 (카카오 간편 로그인 사용자만 처리)
    const refreshTokenPromise =
      loginType === "kakao" && !currentToken
        ? refreshAccessToken().then((newToken) => {
            currentToken = newToken; // 갱신된 토큰을 설정
          })
        : Promise.resolve(); // 일반 로그인 사용자는 바로 진행

    refreshTokenPromise
      .then(() => {
        // 로그아웃 요청 (카카오 간편 로그인 또는 일반 로그인 모두 처리)
        return axios.post(`${HOST}:${PORT}/api/logout`, {
          email: email,
          token: loginType === "kakao" ? currentToken : null, // 카카오: 토큰 전달, 일반: null
        });
      })
      .then((response) => {
        if (response.data.success) {
          alert("로그아웃이 성공적으로 완료되었습니다."); // 성공 메시지
          setLoginState({
            isLoggedIn: false, // 로그인 상태 초기화
            email: "", // 이메일 초기화
            loginType: "normal", // 로그인 타입 초기화
            loginToken: "", // 토큰 초기화
          });
          navigate("/login"); // 로그인 페이지로 이동
        } else {
          alert("로그아웃 처리에 실패했습니다."); // 실패 메시지
        }
      })
      .catch((error) => {
        alert("로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요."); // 에러 메시지
      });
  }; // 로그아웃 기능 구현 끝

  const [dayPlans, setDayPlans] = useState<DayPlans>({
    day1: [
      {
        time: "09:00 - 11:00",
        activity: "동대문 시장 쇼핑",
        image: "image_url1",
      },
      { time: "11:20 - 12:00", activity: "점심 식사", image: "image_url2" },
      { time: "12:30 - 14:00", activity: "박물관 방문", image: "image_url3" },
      { time: "14:30 - 16:00", activity: "서울 구경", image: "image_url3" },
    ],
    day2: [
      { time: "10:00 - 12:00", activity: "명동 쇼핑", image: "image_url4" },
      { time: "12:30 - 14:00", activity: "한식 식사", image: "image_url5" },
    ],
    day3: [
      { time: "09:00 - 11:00", activity: "카페 탐방", image: "image_url6" },
      { time: "11:30 - 13:00", activity: "전통시장 구경", image: "image_url7" },
    ],
    day4: [
      { time: "09:00 - 12:00", activity: "스터디", image: "image_url8" },
      { time: "12:30 - 15:00", activity: "동아리", image: "image_url9" },
    ],
    day5: [],
    day6: [],
    day7: [],
    day8: [],
    day9: [],
    day10: [],
    day11: [],
  });

  const handleAddPlan = (dayKey: keyof DayPlans) => {
    const newPlan = {
      time: "시간 미정",
      activity: "새로운 활동",
      image: "image_url_new",
    };

    setDayPlans((prevPlans) => ({
      ...prevPlans,
      [dayKey]: [...prevPlans[dayKey], newPlan],
    }));
  };

  return (
    <Style>
      <header>
        <div className="container">
          <h2 className="title">여행갈래</h2>
        </div>
        <div className="container">
          <div style={{ display: "flex", gap: "20px" }}>
            {isLoggedIn ? (
              // 로그아웃 기능 추가
              <LoginButton onClick={handleLogoutClick} />
            ) : (
              <Button variant="contained" onClick={handleLoginClick}>
                로그인/회원가입
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="main-container">
        <div className="template-title">
          <h2>MyBoard</h2>
          <div className="button-container">
            <Button variant="contained" startIcon={<DownloadIcon />}>
              저장하기
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />}>
              다운로드
            </Button>
          </div>
        </div>
        <div className="board-container">
          <Card
            day="Day 1"
            plans={dayPlans.day1}
            onAddPlan={() => handleAddPlan("day1")}
          />
          <Card
            day="Day 2"
            plans={dayPlans.day2}
            onAddPlan={() => handleAddPlan("day2")}
          />
          <Card
            day="Day 3"
            plans={dayPlans.day3}
            onAddPlan={() => handleAddPlan("day3")}
          />
          <Card
            day="Day 4"
            plans={dayPlans.day4}
            onAddPlan={() => handleAddPlan("day4")}
          />

          <Card
            day="Day 5"
            plans={dayPlans.day5}
            onAddPlan={() => handleAddPlan("day5")}
          />
          <Card
            day="Day 6"
            plans={dayPlans.day6}
            onAddPlan={() => handleAddPlan("day6")}
          />
          <Card
            day="Day 7"
            plans={dayPlans.day7}
            onAddPlan={() => handleAddPlan("day7")}
          />

          <Card
            day="Day 8"
            plans={dayPlans.day8}
            onAddPlan={() => handleAddPlan("day8")}
          />
          <Card
            day="Day 9"
            plans={dayPlans.day9}
            onAddPlan={() => handleAddPlan("day9")}
          />
          <Card
            day="Day 10"
            plans={dayPlans.day10}
            onAddPlan={() => handleAddPlan("day10")}
          />

          <Card
            day="Day 11"
            plans={dayPlans.day11}
            onAddPlan={() => handleAddPlan("day11")}
          />
        </div>
        <div className="left-menu"></div>
      </div>
    </Style>
  );
};

export default Template;
