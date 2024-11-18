import React from "react";
import styled from "@emotion/styled";

interface Plan {
  time: string;
  activity: string;
  image: string;
}

interface DayColumnProps {
  day: string;
  plans: Plan[];
  onAddPlan: () => void;
}

const Column = styled.div`
  background-color: #D9D9D9;
  padding: 20px;
  border-radius: 10px;
  min-width: 250px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const DayTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #000;
`;

const PlanCard = styled.div`
  background-color: #EBEBEB;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  color: #000;
`;

const PlanTime = styled.p`
  font-size: 0.9rem;
  color: #000;
`;

const PlanActivity = styled.p`
  font-size: 1rem;
  font-weight: bold;
`;

const AddPlanButton = styled.button`
  background-color: #D9D9D9;
  color: white;
  border: none;
  color: #000;
  padding: 10px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
`;

const DayColumn: React.FC<DayColumnProps> = ({ day, plans, onAddPlan }) => {
  return (
    <Column>
      <DayTitle>{day}</DayTitle>
      {plans.map((plan, index) => (
        <PlanCard key={index}>
          <PlanTime>{plan.time}</PlanTime>
          <PlanActivity>{plan.activity}</PlanActivity>
        </PlanCard>
      ))}
      <AddPlanButton onClick={onAddPlan}>+ 계획 추가하기</AddPlanButton>
    </Column>
  );
};

export default DayColumn;
