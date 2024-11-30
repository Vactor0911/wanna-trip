import React, { useState } from "react";
import styled from "@emotion/styled";
import Content from "./Content";
import AddIcon from "@mui/icons-material/Add"; // 플러스 아이콘
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // 복사 아이콘
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"; // 삭제 아이콘
import MenuIcon from "@mui/icons-material/Menu"; // 메뉴 아이콘
import { Button, IconButton } from "@mui/material";

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
  min-width: 16em;
  width: 250px;
  background-color: #d9d9d9;
  padding: 10px;
  margin-right: 10px;
  border-radius: 8px;

  .card-menu-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    position: relative;
  }

  .card-menu-title {
    font-size: 1.25em;
    font-weight: bold;
    font-color: #1e1e1e;
  }

  .icon-wrapper {
    display: flex;
    gap: 1px;
    align-items: center;
  }

  .hover-icon {
    opacity: 0;
    transform: scale(0);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .card-menu-container:hover .hover-icon {
    opacity: 1;
    transform: scale(1);
  }

  .card-container {
    overflow-y: scroll;
    max-height: 380px;
  }

  @media (max-width: 768px) {
    &:before {
      width: 10%;
    }
  }

  @media (max-width: 480px) {
  }
`;

const Card = ({ day, plans, onAddPlan }: CardProps) => {
  const [isMenuHovered, setIsMenuHovered] = useState(false);

  const handleMouseEnter = () => setIsMenuHovered(true);
  const handleMouseLeave = () => setIsMenuHovered(false);

  return (
    <CardStyle>
      <div
        className="card-menu-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 제목 */}
        <div className="card-menu-title">{day}</div>

        {/* 기본 아이콘 */}
        <div className="icon-wrapper">
          <IconButton size="small">
            <AddIcon
              sx={{
                color: "black",
                transform: "scale(1.2)",
                cursor: "pointer",
              }}
            />
          </IconButton>
          <IconButton size="small">
            <ContentCopyIcon
              sx={{
                color: "black",
                transform: "scale(1)",
                cursor: "pointer",
              }}
            />
          </IconButton>
          <IconButton size="small">
            <DeleteOutlineIcon
              sx={{
                color: "black",
                transform: "scale(1.2)",
                cursor: "pointer",
              }}
            />
          </IconButton>

          {/* 마우스를 올렸을 때만 보이는 아이콘 */}
          {isMenuHovered && (
            <IconButton size="small" className="hover-icon">
              <MenuIcon
                sx={{
                  color: "black",
                  transform: "scale(1.2)",
                  cursor: "pointer",
                }}
              />
            </IconButton>
          )}
        </div>
      </div>

      {/* 계획 내용 */}
      <div className="card-container">
        {plans.map((plan, index) => (
          <Content
            key={index}
            time={plan.time}
            activity={plan.activity}
            image={plan.image}
          />
        ))}
      </div>

      {/* 버튼 */}
      <Button
        onClick={onAddPlan}
        startIcon={
          <AddIcon
            sx={{
              color: "black",
              transform: "scale(1)",
              cursor: "pointer",
            }}
          />
        }
        sx={{
          fontSize: "16px",
          color: "#1E1E1E",
          fontWeight: 650,
        }}
      >
        계획 추가하기
      </Button>
    </CardStyle>
  );
};

export default Card;
