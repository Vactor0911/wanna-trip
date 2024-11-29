import React from "react";
import styled from "@emotion/styled";
import Content from "./Content";
import AddIcon from "@mui/icons-material/Add"; // 플러스 아이콘 추가
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // 복사 아이콘 추가
import DeleteIcon from "@mui/icons-material/Delete"; // 쓰레기통 아이콘 추가
import MenuIcon from "@mui/icons-material/Menu"; // 메뉴 아이콘 추가
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

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
  width: 14em;
  background-color: #D9D9D9;
  padding: 10px;
  margin-right: 10px;
  border-radius: 8px;

  .os-scrollbar {
    --os-size: 10px;
    --os-handle-bg: white;
    --os-handle-border-radius: 2px;
    --os-handle-border: 1px solid #aaa;
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
            fontSize: "1.3em",
          }}
        >
          {day}
        </span>
        <AddIcon
          sx={{
            color: "#black",
            transform: "scale(1.2)",
            marginLeft: "60px",
            cursor: "pointer",
          }}
        />
        <ContentCopyIcon
          sx={{
            color: "#black",
            transform: "scale(1)",
            cursor: "pointer",
            marginLeft: "0.3em",
          }}
        />
        <DeleteIcon
          sx={{
            color: "#black",
            transform: "scale(1)",
            cursor: "pointer",
            marginLeft: "0.3em",
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
