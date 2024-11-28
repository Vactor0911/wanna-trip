import styled from "@emotion/styled"; // 스타일 추가
import { Button } from "@mui/material"; // 버튼 추가
import DownloadIcon from "@mui/icons-material/Download"; // 다운로드 아이콘 추가
import SaveIcon from "@mui/icons-material/Save"; // 저장 아이콘 추가
import { useState } from "react";
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
    gap: 20px;
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
`;

const savebtn = () => {
  alert("저장되었습니다.");
};

const downloadbtn = () => {
  alert("다운로드가 되었습니다.");
};

const NewTemplate = () => {
  const [dayPlans, setDayPlans] = useState<DayPlans>({
    day1: [
      {
        time: "09:00 - 11:00",
        activity: "동대문 시장 쇼핑",
        image: "image_url1",
      },
      { time: "11:20 - 12:00", activity: "점심 식사", image: "image_url2" },
      { time: "12:30 - 14:00", activity: "박물관 방문", image: "image_url3" },
    ],
  });

  const addplanhandler = (dayKey: keyof DayPlans) => {
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
          <Button variant="contained">로그인/회원가입</Button>
        </div>
      </header>
      <div className="main-container">
        <div className="template-title">
          <h2>MyBoard</h2>
          <div className="button-container">
            <Button
              onClick={savebtn}
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              저장하기
            </Button>
            <Button
              onClick={downloadbtn}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              다운로드
            </Button>
          </div>
        </div>
        <div className="board-container">
          <Card
            day="Day 1"
            plans={dayPlans.day1}
            onAddPlan={() => addplanhandler("day1")}
          />
        </div>
        <div className="left-menu"></div>
      </div>
    </Style>
  );
};

export default NewTemplate;
