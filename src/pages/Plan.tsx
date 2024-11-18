import React from 'react';
import styled from "@emotion/styled";

// Props 타입 정의
interface PlanCardProps {
  time: string;
  activity: string;
  image: string;
}

const CardContainer = styled.div`
  background-color: #F5F5F5;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
`;

const Time = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Activity = styled.div`
  font-size: 1rem;
  margin-bottom: 5px;
  text-align: center;
`;

const Image = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
`;

const Plan: React.FC<PlanCardProps> = ({ time, activity, image }) => {
  return (
    <CardContainer>
      <Time>{time}</Time>
      <Activity>{activity}</Activity>
      <Image src={image} alt={activity} />
    </CardContainer>
  );
};

export default Plan;
