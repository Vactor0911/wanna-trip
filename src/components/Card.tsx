import React, { useState } from "react";
import styled from "@emotion/styled";
import Content from "./Content";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Button, Menu, MenuItem, Typography } from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";

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
  }

  .icon-wrapper {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  .card-container {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
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

  .add-plan-button {
    align-self: flex-start; /* 왼쪽 위로 이동 */
    margin-top: 10px;
  }
`;

const Card = () => {
  // 초기 카드 상태
  const [cards, setCards] = useState<CardData[]>([
    {
      id: 1,
      day: "Day 1",
      plans: [
        { time: "09:00 - 11:00", activity: "동대문 시장 쇼핑" },
        { time: "11:20 - 12:00", activity: "점심 식사" },
      ],
    },
  ]);

  // 메뉴 관련 상태
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuBoardIndex, setMenuBoardIndex] = useState<number | null>(null);
  const [moveMenuAnchorEl, setMoveMenuAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuBoardIndex(index);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuBoardIndex(null);
  };

  const handleMoveMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setMoveMenuAnchorEl(event.currentTarget);
    setMenuBoardIndex(index);
  };

  const handleMoveMenuClose = () => {
    setMoveMenuAnchorEl(null);
    setMenuBoardIndex(null);
  };

  // 카드 추가
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

  // 카드 복사
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

  // 카드 삭제
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

  // 카드 이동
  const moveCard = (currentIndex: number, targetIndex: number) => {
    const updatedCards = [...cards];
    const [movedCard] = updatedCards.splice(currentIndex, 1);
    updatedCards.splice(targetIndex, 0, movedCard);

    const reorderedCards = updatedCards.map((card, index) => ({
      ...card,
      day: `Day ${index + 1}`,
      id: index + 1,
    }));

    setCards(reorderedCards);
    handleMoveMenuClose();
  };

  // 계획 추가
  const handleAddPlan = (id: number) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              plans: [
                ...card.plans,
                { time: "시간 미정", activity: "새로운 활동" },
              ],
            }
          : card
      )
    );
  };


  // 계획 내용 변경
  const handlePlanChange = (cardId: number, planIndex: number, newActivity: string) => {
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
      {cards.map((card, index) => (
        <CardStyle key={card.id}>
          {/* 기존 카드 컨트롤 영역 */}
          <div className="card-menu-container">
            <Typography variant="h6">{card.day}</Typography>
            <div className="icon-wrapper">
              <IconButton size="small" onClick={() => handleAddCard(card.id)}>
                <AddIcon sx={{ color: "black", transform: "scale(1.2)" }} />
              </IconButton>
              <IconButton size="small" onClick={() => handleCopyCard(card.id)}>
                <ContentCopyIcon
                  sx={{ color: "black", transform: "scale(1)" }}
                />
              </IconButton>

              {/* 카드 삭제 */}
              <IconButton
                size="small"
                onClick={() => handleDeleteCard(card.id)}
              >
                <DeleteOutlineIcon
                  sx={{ color: "black", transform: "scale(1.2)" }}
                />
              </IconButton>
              {/* 메뉴 버튼 */}
              <IconButton
                aria-label="menu"
                onClick={(e) => handleMenuOpen(e, index)}
              >
                <MenuIcon />

              </IconButton>
            </div>
          </div>

          {/* Material-UI 메뉴 */}
          <Menu
            anchorEl={menuAnchorEl}
            open={menuBoardIndex === index}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleAddCard(card.id)}>
              <AddIcon fontSize="small" sx={{ marginRight: 1 }} />
              추가하기
            </MenuItem>
            <MenuItem onClick={() => handleCopyCard(card.id)}>
              <ContentCopyIcon fontSize="small" sx={{ marginRight: 1 }} />
              복사하기
            </MenuItem>
            <MenuItem onClick={(e) => handleMoveMenuOpen(e, index)}>
              <SwapVertIcon fontSize="small" sx={{ marginRight: 1 }} />
              이동하기
            </MenuItem>
            <MenuItem
              onClick={() => handleDeleteCard(card.id)}
              sx={{ color: "red" }}
            >
              <DeleteOutlineIcon fontSize="small" sx={{ marginRight: 1 }} />
              삭제하기
            </MenuItem>
          </Menu>
          <Menu
            anchorEl={moveMenuAnchorEl}
            open={menuBoardIndex === index && Boolean(moveMenuAnchorEl)}
            onClose={handleMoveMenuClose}
          >
            {cards.map((_, targetIndex) => {
              if (targetIndex !== index) {
                return (
                  <MenuItem
                    key={targetIndex}
                    onClick={() => moveCard(index, targetIndex)}
                  >
                    {cards[targetIndex].day}
                  </MenuItem>
                );
              }
              return null;
            })}
          </Menu>

          {/* 카드 내용 */}
          <div className="card-container">
            {card.plans.map((plan, index) => (
              <Content key={index} time={plan.time} activity={plan.activity} />

            ))}
          </div>

          {/* 계획 추가 버튼 */}
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
