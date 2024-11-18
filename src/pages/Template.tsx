import React, { useState } from "react";
import styled from "@emotion/styled";
import DayColumn from "./Day";

interface Plan {
  time: string;
  activity: string;
  image: string;
}

interface DayPlans {
  day1: Plan[];
  day2: Plan[];
  day3: Plan[];
}

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #2f3b4e;
  min-height: 100vh;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #1e293b;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const Title = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const LoginButton = styled.button`
  background-color: #64748b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #475569;
  }
`;

const Body = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  padding: 20px;
  overflow-x: auto;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const Template = () => {
  const [dayPlans, setDayPlans] = useState<DayPlans>({
    day1: day1Plans,
    day2: day2Plans,
    day3: day3Plans,
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
    <BoardContainer>
      <Header>
        <Title>여행갈래</Title>
        <LoginButton>로그인/회원가입</LoginButton>
      </Header>
      <Body>
        <DayColumn day="Day 1" plans={dayPlans.day1} onAddPlan={() => handleAddPlan("day1")} />
        <DayColumn day="Day 2" plans={dayPlans.day2} onAddPlan={() => handleAddPlan("day2")} />
        <DayColumn day="Day 3" plans={dayPlans.day3} onAddPlan={() => handleAddPlan("day3")} />
      </Body>
    </BoardContainer>
  );
};

export default Template;

const day1Plans = [
  { time: "09:00 - 11:00", activity: "동대문 시장 쇼핑", image: "image_url1" },
  { time: "11:20 - 12:00", activity: "점심 식사", image: "image_url2" },
  { time: "12:30 - 14:00", activity: "박물관 방문", image: "image_url3" },
];
const day2Plans = [
  { time: "10:00 - 12:00", activity: "명동 쇼핑", image: "image_url4" },
  { time: "12:30 - 14:00", activity: "한식 식사", image: "image_url5" },
];
const day3Plans = [
  { time: "09:00 - 11:00", activity: "카페 탐방", image: "image_url6" },
  { time: "11:30 - 13:00", activity: "전통시장 구경", image: "image_url7" },
];
