import React from "react";
import styled from "@emotion/styled";
import Content from "./Content";
import AddIcon from "@mui/icons-material/Add"; // 플러스 아이콘 추가
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // 복사 아이콘 추가
import DeleteIcon from "@mui/icons-material/Delete"; // 쓰레기통 아이콘 추가
import MenuIcon from "@mui/icons-material/Menu"; // 메뉴 아이콘 추가

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
  background-color: #D9D9D9;
  padding: 10px;
  margin-right: 20px;
  border-radius: 8px;

  h2.header {
    font-size: 1.2rem;
    color: #1E1E1E;
    margin-bottom: 10px;
  }

  card-menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Card: React.FC<CardProps> = ({ day, plans }) => {
  return (
    <CardStyle>
      <div className="card-menu">
        <span
          style={{
            color: "black",
            fontSize: "2em",
            marginLeft: "10px", // 여기에서 왼쪽 여백을 추가
          }}
        >
          {day}
        </span>
        <AddIcon
          sx={{
            color: "#black",
            transform: "scale(1.5)",
            marginLeft: "70px",
            cursor: "pointer",
          }}
        />
        <ContentCopyIcon
          sx={{
            color: "#black",
            transform: "scale(1.2)",
            marginLeft: "15px",
            cursor: "pointer",
          }}
        />
        <DeleteIcon
          sx={{
            color: "#black",
            transform: "scale(1.2)",
            marginLeft: "15px",
            cursor: "pointer",
          }}
        />
      </div>
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
