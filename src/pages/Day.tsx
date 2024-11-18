import React from 'react';
import styled from "@emotion/styled";
import PlanCard from './Plan';

// Props 타입 정의
interface DayColumnProps {
  day: string;
  plans: {
    time: string;
    activity: string;
    image: string;
  }[];
}

const ColumnContainer = styled.div`
  width: 300px;
  background-color: #3F4C6B;
  padding: 10px;
  margin-right: 20px;
  border-radius: 8px;
`;

const DayHeader = styled.h2`
  font-size: 1.2rem;
  color: #FFFFFF;
  margin-bottom: 10px;
`;

const Day: React.FC<DayColumnProps> = ({ day, plans }) => {
  return (
    <ColumnContainer>
      <DayHeader>{day}</DayHeader>
      {plans.map((plan, index) => (
        <PlanCard key={index} time={plan.time} activity={plan.activity} image={plan.image} />
      ))}
      <button>+ 계획 추가하기</button>
    </ColumnContainer>
  );
};

export default Day;
