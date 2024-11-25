import React, { useState } from 'react';
import styled from "@emotion/styled";
import DayColumn from './Day'; // 같은 폴더 내에 위치

const BoardContainer = styled.div`
  display: flex;
  padding: 0px;
  background-color: #2f3b4e;
  min-height: 100vh;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  font-size: 1.5rem;
  color: #FFFFFF;
`;

const Body = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  font-size: 1.5rem;
  color: #FFFFFF;
`;

const Template = () => {
  return (
    <BoardContainer>
      <Header>
        <div>여행갈래</div>
        <button>로그인/회원가입</button>
      </Header>
      <Body>
        <DayColumn day="Day 1" plans={day1Plans} />
        <DayColumn day="Day 2" plans={day2Plans} />
        <DayColumn day="Day 3" plans={day3Plans} />
        {/* 필요한 만큼 DayColumn 추가 */}
      </Body>
    </BoardContainer>
  );
};

export default Template;

const day1Plans = [
  { time: "09:00 - 11:00", activity: "동대문 시장 쇼핑", image: "image_url1" },
  { time: "11:20 - 12:00", activity: "점심 식사", image: "image_url2" },
  { time: "12:30 - 14:00", activity: "박물관 방문", image: "image_url3" }
];
const day2Plans = [
  { time: "10:00 - 12:00", activity: "명동 쇼핑", image: "image_url4" },
  { time: "12:30 - 14:00", activity: "한식 식사", image: "image_url5" },
];
const day3Plans = [
  { time: "09:00 - 11:00", activity: "카페 탐방", image: "image_url6" },
  { time: "11:30 - 13:00", activity: "전통시장 구경", image: "image_url7" }
];
