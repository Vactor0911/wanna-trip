import React, { useState } from "react";
import styled from "@emotion/styled";
import Content from "./Content";
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
    overflow-y: scroll;
    max-height: 380px;
  }
`;

const Card = () => {
  // 초기 카드 상태
  const [cards, setCards] = useState<CardData[]>([
    {
      id: 1,
      day: "Day 1",
      plans: [
        { time: "09:00 - 11:00", activity: "동대문 시장 쇼핑"},
        { time: "11:20 - 12:00", activity: "점심 식사"},
      ],
    },
  ]);

  // 카드 추가
  const handleAddCard = (id: number) => {
    // 새로운 빈 카드 생성
    const newCard: CardData = {
      id: cards.length + 1, // 임시 ID
      day: "", // Day는 정렬 후 재설정
      plans: [], // 빈 계획
    };

    // 클릭한 카드의 인덱스 찾기
    const cardIndex = cards.findIndex((card) => card.id === id);

    // 새 카드를 클릭한 카드의 오른쪽에 삽입
    const updatedCards = [
      ...cards.slice(0, cardIndex + 1), // 클릭한 카드까지
      newCard, // 새 카드 추가
      ...cards.slice(cardIndex + 1), // 나머지 카드
    ];

    // Day와 ID를 정렬 및 재할당
    const reorderedCards = updatedCards.map((card, index) => ({
      ...card,
      day: `Day ${index + 1}`, // 순서에 맞는 Day
      id: index + 1, // 순서에 맞는 ID
    }));

    // 상태 업데이트
    setCards(reorderedCards);
  };

  // 카드 복사
  const handleCopyCard = (id: number) => {
    // 클릭한 카드 찾기
    const cardToCopy = cards.find((card) => card.id === id);

    if (cardToCopy) {
      // 클릭한 카드의 인덱스(위치) 찾기
      const cardIndex = cards.findIndex((card) => card.id === id);

      // 복사된 카드 생성 (ID는 고유, 하지만 순서는 정렬되도록 수정)
      const copiedCard: CardData = {
        ...cardToCopy,
        id: cards.length + 1, // 새로운 ID
        day: "", // 복사 후 정렬하면서 순서를 다시 설정
      };

      // 클릭한 카드 바로 오른쪽에 복사된 카드 삽입
      const updatedCards = [
        ...cards.slice(0, cardIndex + 1), // 클릭한 카드까지의 배열
        copiedCard, // 복사된 카드 추가
        ...cards.slice(cardIndex + 1), // 나머지 카드
      ];

      // Day와 ID를 정렬 및 재할당
      const reorderedCards = updatedCards.map((card, index) => ({
        ...card,
        day: `Day ${index + 1}`, // 순서에 맞는 Day
        id: index + 1, // 순서에 맞는 ID
      }));

      // 상태 업데이트
      setCards(reorderedCards);
    }
  };

  // 카드 삭제
  const handleDeleteCard = (id: number) => {
    // 해당 ID의 카드 제거
    const updatedCards = cards
      .filter((card) => card.id !== id) // 클릭한 카드 제거
      .map((card, index) => ({
        ...card,
        day: `Day ${index + 1}`, // Day 이름 재할당
        id: index + 1, // ID도 재설정
      }));

    // 상태 업데이트
    setCards(updatedCards);
  };

  return (
    <>
      {cards.map((card) => (
        <CardStyle key={card.id}>
          <div className="card-menu-container">
            <div className="card-menu-title">{card.day}</div>
            <div className="icon-wrapper">
              {/* 카드 추가 */}
              <IconButton size="small" onClick={() => handleAddCard(card.id)}>
                <AddIcon sx={{ color: "black", transform: "scale(1.2)" }} />
              </IconButton>
              {/* 카드 복사 */}
              <IconButton size="small" onClick={() => handleCopyCard(card.id)}>
                <ContentCopyIcon sx={{ color: "black", transform: "scale(1)" }} />
              </IconButton>
              {/* 카드 삭제 */}
              <IconButton size="small" onClick={() => handleDeleteCard(card.id)}>
                <DeleteOutlineIcon sx={{ color: "black", transform: "scale(1.2)" }} />
              </IconButton>
            </div>
          </div>

          {/* 계획 내용 */}
          <div className="card-container">
            {card.plans && card.plans.length > 0 ? (
              card.plans.map((plan, index) => (
                <Content
                  key={index}
                  time={plan.time}
                  activity={plan.activity}
                />
              ))
            ) : (
              <div>계획이 없습니다.</div>
            )}
          </div>

          {/* 계획 추가 버튼 */}
          <Button
            onClick={() => console.log("계획 추가하기")}
            startIcon={<AddIcon sx={{ color: "black", transform: "scale(1)" }} />}
            sx={{ fontSize: "16px", color: "#1E1E1E", fontWeight: 650 }}
          >
            계획 추가하기
          </Button>
        </CardStyle>
      ))}
    </>
  );
};

export default Card;
