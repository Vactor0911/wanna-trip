import { useState } from "react";
import styled from "@emotion/styled";
import Card from "../components/Card"; // 같은 폴더 내에 위치
import AddIcon from "@mui/icons-material/Add"; // 플러스 아이콘 추가
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // 복사 아이콘 추가
import DeleteIcon from "@mui/icons-material/Delete"; // 쓰레기통 아이콘 추가
import MenuIcon from "@mui/icons-material/Menu"; // 메뉴 아이콘 추가
import LoginButton from "../components/LoginButton";

interface Plan {
  time: string;
  activity: string;
  image: string;
}

interface DayPlans {
  day1: Plan[];
  day2: Plan[];
  day3: Plan[];
  day4: Plan[];
}

const Style = styled.div`
  display: flex;
  padding: 0px;
  background-color: #2f3b4e;
  min-height: 100vh;
  color: white;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    font-size: 1.5rem;
    color: #ffffff;
    font-weight: bold;
  }

  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .body {
    display: flex;
    flex-wrap: nowrap; // 가로로 나란히 정렬
    gap: 20px; // 컬럼 간 간격
    padding: 20px;
    align-items: flex-start; // 컬럼 높이를 각 내용에 맞춤
    overflow-x: auto; // 가로 스크롤 활성화

    @media (max-width: 768px) {
      flex-wrap: wrap; // 모바일에서는 세로로 정렬
      justify-content: center; // 중앙 정렬
    }
  }
`;

const ButtonImage = styled.img`
  width: 100%; /* 버튼 내부를 꽉 채움 */
  height: 100%; /* 버튼 내부를 꽉 채움 */
  object-fit: cover; /* 이미지 비율을 유지하며 채움 */
`;

const Template = () => {
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
      { time: "09:00 - 12:00", activity: "스터디", image: "image_url6" },
      { time: "12:30 - 15:00", activity: "동아리", image: "image_url7" },
    ],
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
        <div className="title">여행갈래</div>
        <LoginButton />
      </header>
      <div className="body">
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
      </div>
    </Style>
  );
};

export default Template;
