import React, { useState } from "react";
import styled from "@emotion/styled";
import DayColumn from "./Day";
import AddIcon from '@mui/icons-material/Add'; // 플러스 아이콘 추가
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // 복사 아이콘 추가
import DeleteIcon from '@mui/icons-material/Delete'; // 쓰레기통 아이콘 추가
import MenuIcon from '@mui/icons-material/Menu'; // 메뉴 아이콘 추가
import PersonIcon from '@mui/icons-material/Person'; // 사람 아이콘 추가

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
  border-radius: 50px; /* Fully rounded corners */
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* Adding shadow for depth */
  transition: all 0.3s ease;

  &:hover {
    background-color: #475569; /* Slightly darker on hover */
    transform: translateY(-2px); /* Subtle lifting effect */
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.15); /* Enhance shadow on hover */
  }

  &:active {
    transform: translateY(0); /* Reset the lifting effect */
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* Reduce shadow on active */
  }
`;

const LoginButton2 = styled.button`
  background-color: #64748b;
  color: white;
  border: none;
  padding: 0; /* 내부 여백 제거 */
  border-radius: 50%; /* 완전한 원 모양 */
  width: 50px; /* 버튼 크기 설정 */
  height: 50px; /* 버튼 크기 설정 */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* 이미지가 버튼 외부로 넘어가지 않도록 설정 */
  cursor: pointer;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* 버튼 그림자 추가 */
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1); /* 호버 시 확대 효과 */
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(1); /* 클릭 시 원래 크기로 */
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ButtonImage = styled.img`
  width: 100%; /* 버튼 내부를 꽉 채움 */
  height: 100%; /* 버튼 내부를 꽉 채움 */
  object-fit: cover; /* 이미지 비율을 유지하며 채움 */
`;



const Body = styled.div`
  display: flex;
  flex-wrap: nowrap;            // 가로로 나란히 정렬
  gap: 20px;                    // 컬럼 간 간격
  padding: 20px;
  align-items: flex-start;      // 컬럼 높이를 각 내용에 맞춤
  overflow-x: auto;             // 가로 스크롤 활성화

  @media (max-width: 768px) {
    flex-wrap: wrap;            // 모바일에서는 세로로 정렬
    justify-content: center;    // 중앙 정렬
  }
`;

const Template = () => {
  const [dayPlans, setDayPlans] = useState<DayPlans>({
    day1: day1Plans,
    day2: day2Plans,
    day3: day3Plans,
    day4: day4Plans
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

  const LoginButtonIcon = styled(PersonIcon)`
  font-size: 35px; /* 아이콘 크기 조절 */
  color: white; /* 아이콘 색상 */
`;

  return (
    <BoardContainer>
      <Header>
        <Title>여행갈래</Title>
        <LoginButton2><LoginButtonIcon/></LoginButton2>
      </Header>
      <Body>
        <DayColumn day="Day 1" plans={dayPlans.day1} onAddPlan={() => handleAddPlan("day1")} />
        <DayColumn day="Day 2" plans={dayPlans.day2} onAddPlan={() => handleAddPlan("day2")} />
        <DayColumn day="Day 3" plans={dayPlans.day3} onAddPlan={() => handleAddPlan("day3")} />
        <DayColumn day="Day 4" plans={dayPlans.day4} onAddPlan={() => handleAddPlan("day4")} />
      </Body>
    </BoardContainer>
  );
};

export default Template;

const day1Plans = [
  { time: "09:00 - 11:00", activity: "동대문 시장 쇼핑", image: "image_url1" },
  { time: "11:20 - 12:00", activity: "점심 식사", image: "image_url2" },
  { time: "12:30 - 14:00", activity: "박물관 방문", image: "image_url3" },
  { time: "14:30 - 16:00", activity: "서울 구경", image: "image_url3" },
];
const day2Plans = [
  { time: "10:00 - 12:00", activity: "명동 쇼핑", image: "image_url4" },
  { time: "12:30 - 14:00", activity: "한식 식사", image: "image_url5" },
];
const day3Plans = [
  { time: "09:00 - 11:00", activity: "카페 탐방", image: "image_url6" },
  { time: "11:30 - 13:00", activity: "전통시장 구경", image: "image_url7" },
];
const day4Plans = [
  { time: "09:00 - 12:00", activity: "스터디", image: "image_url6" },
  { time: "12:30 - 15:00", activity: "동아리", image: "image_url7" },
];
