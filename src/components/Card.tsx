import React from "react";
import styled from "@emotion/styled";
import Content from "./Content";

// Props 타입 정의
interface CardProps {
  day: string;
  plans: {
    time: string;
    activity: string;
    image: string;
  }[];
  onAddPlan: () => void;
}

const CardStyle = styled.div`
  width: 300px;
  background-color: #3f4c6b;
  padding: 10px;
  margin-right: 20px;
  border-radius: 8px;

  h2.header {
    font-size: 1.2rem;
    color: #ffffff;
    margin-bottom: 10px;
  }
`;

const Card: React.FC<CardProps> = ({ day, plans }) => {
  return (
    <CardStyle>
      <h2 className="header">{day}</h2>
      {plans.map((plan, index) => (
        <Content
          key={index}
          time={plan.time}
          activity={plan.activity}
          image={plan.image}
        />
      ))}
      <button>+ 계획 추가하기</button>
    </CardStyle>
  );
};

export default Card;
