import React, { useState } from "react";
import styled from "@emotion/styled";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton, Button } from "@mui/material";

// Plan 타입 정의
interface Plan {
  time: string; // 계획 시간
  activity: string; // 계획 활동명
}

// 카드 데이터 타입 정의
interface CardData {
  id: number; // 카드의 고유 ID
  day: string; // Day 이름
  plans: Plan[]; // 계획 리스트
}

// 스타일 정의
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
  }

  .icon-wrapper {
    display: flex;
    gap: 1px;
    align-items: center;
  }

  .card-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 380px;
    gap: 10px; /* 계획 간 여백 */
  }

  .add-plan-button {
    align-self: flex-start; /* 왼쪽 위로 이동 */
    margin-top: 10px;
  }

  .plan {
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* 텍스트 왼쪽 정렬 */
    padding: 10px;
    background-color: white;
    border-radius: 5px;
    word-wrap: break-word; /* 긴 텍스트 줄바꿈 */
    width: 100%;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  }

  .plan textarea {
    width: 100%;
    resize: none; /* 텍스트 영역 크기 조정 비활성화 */
    border: none;
    outline: none;
    font-size: 14px;
    line-height: 1.5;
    overflow-wrap: break-word; /* 글씨 넘어가지 않도록 처리 */
    background: none;
  }
`;

const Card = () => {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: 1,
      day: "Day 1",
      plans: [
        { time: "09:00 - 11:00", activity: "" },
        { time: "11:20 - 12:00", activity: "" },
      ],
    },
  ]);

  // 카드 추가 함수
  const handleAddCard = (id: number) => {
    const newCard: CardData = {
      id: cards.length + 1,
      day: "",
      plans: [],
    };

    const cardIndex = cards.findIndex((card) => card.id === id);
    const updatedCards = [
      ...cards.slice(0, cardIndex + 1),
      newCard,
      ...cards.slice(cardIndex + 1),
    ];

    const reorderedCards = updatedCards.map((card, index) => ({
      ...card,
      day: `Day ${index + 1}`,
      id: index + 1,
    }));

    setCards(reorderedCards);
  };

  // 카드 복사 함수
  const handleCopyCard = (id: number) => {
    const cardToCopy = cards.find((card) => card.id === id);

    if (cardToCopy) {
      const cardIndex = cards.findIndex((card) => card.id === id);
      const copiedCard: CardData = {
        ...cardToCopy,
        id: cards.length + 1,
        day: "",
      };

      const updatedCards = [
        ...cards.slice(0, cardIndex + 1),
        copiedCard,
        ...cards.slice(cardIndex + 1),
      ];

      const reorderedCards = updatedCards.map((card, index) => ({
        ...card,
        day: `Day ${index + 1}`,
        id: index + 1,
      }));

      setCards(reorderedCards);
    }
  };

  // 카드 삭제 함수
  const handleDeleteCard = (id: number) => {
    const updatedCards = cards
      .filter((card) => card.id !== id)
      .map((card, index) => ({
        ...card,
        day: `Day ${index + 1}`,
        id: index + 1,
      }));

    setCards(updatedCards);
  };

  // 계획 추가 함수
  const handleAddPlan = (id: number) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              plans: [
                ...card.plans,
                { time: "시간 미정", activity: "" },
              ],
            }
          : card
      )
    );
  };

  // 계획 내용 변경 함수
  const handlePlanChange = (
    cardId: number,
    planIndex: number,
    newActivity: string
  ) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              plans: card.plans.map((plan, index) =>
                index === planIndex ? { ...plan, activity: newActivity } : plan
              ),
            }
          : card
      )
    );
  };

  return (
    <>
      {cards.map((card) => (
        <CardStyle key={card.id}>
          <div className="card-menu-container">
            <div className="card-menu-title">{card.day}</div>
            <div className="icon-wrapper">
              <IconButton size="small" onClick={() => handleAddCard(card.id)}>
                <AddIcon sx={{ color: "black", transform: "scale(1.2)" }} />
              </IconButton>
              <IconButton size="small" onClick={() => handleCopyCard(card.id)}>
                <ContentCopyIcon
                  sx={{ color: "black", transform: "scale(1)" }}
                />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteCard(card.id)}
              >
                <DeleteOutlineIcon
                  sx={{ color: "black", transform: "scale(1.2)" }}
                />
              </IconButton>
            </div>
          </div>

          <div className="card-container">
            {card.plans.map((plan, index) => (
              <div className="plan" key={index}>
                <div>{plan.time}</div>
                <textarea
                  value={plan.activity}
                  placeholder="일정 내용"
                  onChange={(e) =>
                    handlePlanChange(card.id, index, e.target.value)
                  }
                  rows={1}
                  style={{
                    width: "100%",
                    padding: "5px",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    outline: "none",
                    resize: "none",
                    overflowWrap: "break-word",
                    background: "#fff",
                  }}
                />
              </div>
            ))}
          </div>

          <Button
            className="add-plan-button"
            onClick={() => handleAddPlan(card.id)}
            startIcon={
              <AddIcon sx={{ color: "black", transform: "scale(1)" }} />
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
      ))}
    </>
  );
};

export default Card;
