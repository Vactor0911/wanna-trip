import React, { useState } from "react";
import styled from "@emotion/styled";
//import Card from "./Card" // card
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
interface BoardData {
  id: number; // 카드의 고유 ID
  day: string; // Day 이름
  plans: Plan[]; // 계획 리스트
}

// 스타일 정의
const BoardStyle = styled.div`
  min-width: 16em;
  width: 250px;
  background-color: #d9d9d9;
  padding: 10px;
  margin-right: 10px;
  border-radius: 8px;

  .board-menu-container {
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

  .board-container {
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
    gap:10px;
  }

  .plan textarea {
    width: 100%;
    resize: none; /* 텍스트 영역 크기 조정 비활성화 */
    font-size: 14px;
    line-height: 1.5;
  }

  .add-plan-button {
    align-self: flex-start; /* 왼쪽 위로 이동 */
    margin-top: 10px;
  }
`;

const Board = () => {
  const [boards, setBoards] = useState<BoardData[]>([
    {
      id: 1,
      day: "Day 1",
      plans: [
        { time: "09:00 - 11:00", activity: "" },
        { time: "11:20 - 12:00", activity: "" },
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
  const handleAddBoard = (id: number) => {
    const newBoard: BoardData = {
      id: boards.length + 1,
      day: "",
      plans: [],
    };

    const boardIndex = boards.findIndex((board) => board.id === id);
    const updatedBoards = [
      ...boards.slice(0, boardIndex + 1),
      newBoard,
      ...boards.slice(boardIndex + 1),
    ];

    const reorderedBoards = updatedBoards.map((board, index) => ({
      ...board,
      day: `Day ${index + 1}`,
      id: index + 1,
    }));

    setBoards(reorderedBoards);
    handleMenuClose();
  };

  // 카드 복사 함수
  const handleCopyBoard = (id: number) => {
    const boardToCopy = boards.find((board) => board.id === id);

    if (boardToCopy) {
      const boardIndex = boards.findIndex((board) => board.id === id);

      const copiedBoard: BoardData = {
        ...boardToCopy,
        id: boards.length + 1,
        day: "",
      };

      const updatedBoards = [
        ...boards.slice(0, boardIndex + 1),
        copiedBoard,
        ...boards.slice(boardIndex + 1),
      ];

      const reorderedBoards = updatedBoards.map((board, index) => ({
        ...board,
        day: `Day ${index + 1}`,
        id: index + 1,
      }));

      setBoards(reorderedBoards);
      handleMenuClose();
    }
  };

  // 카드 삭제 함수
  const handleDeleteBoard = (id: number) => {
    const updatedBoards = boards
      .filter((board) => board.id !== id)
      .map((board, index) => ({
        ...board,
        day: `Day ${index + 1}`,
        id: index + 1,
      }));

    setBoards(updatedBoards);
    handleMenuClose();
  };

  // 카드 이동
  const moveBoard = (currentIndex: number, targetIndex: number) => {
    const updatedBoards = [...boards];
    const [movedBoard] = updatedBoards.splice(currentIndex, 1);
    updatedBoards.splice(targetIndex, 0, movedBoard);

    const reorderedBoards = updatedBoards.map((board, index) => ({
      ...board,
      day: `Day ${index + 1}`,
      id: index + 1,
    }));

    setBoards(reorderedBoards);
    handleMoveMenuClose();
  };

  // 계획 추가 함수
  const handleAddPlan = (id: number) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === id
          ? {
              ...board,
              plans: [
                ...board.plans,
                { time: "시간 미정", activity: "" },
              ],
            }
          : board
      )
    );
  };

  // 텍스트 내용 변경 시 크기 조절
  const handleTextareaChange = (boardId: number, planIndex: number, value: string) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              plans: board.plans.map((plan, index) =>
                index === planIndex ? { ...plan, activity: value } : plan
              ),
            }
          : board
      )
    );
  };
  // 텍스트 크기 초기화
  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"; // 높이를 초기화
    e.target.style.height = `${e.target.scrollHeight}px`; // 내용에 따라 높이 조정
  };

  return (
    <>
      {boards.map((board, index) => (
        <BoardStyle key={board.id}>
          {/* 기존 카드 컨트롤 영역 */}
          <div className="board-menu-container">
            <Typography variant="h6" sx={{ fontWeight: "bold"}}>{board.day}</Typography>
            <div className="icon-wrapper">
              <IconButton size="small" onClick={() => handleAddBoard(board.id)}>
                <AddIcon sx={{ color: "black", transform: "scale(1.2)" }} />
              </IconButton>
              <IconButton size="small" onClick={() => handleCopyBoard(board.id)}>
                <ContentCopyIcon
                  sx={{ color: "black", transform: "scale(1)" }}
                />
              </IconButton>


              {/* 카드 삭제 */}
              <IconButton
                size="small"
                onClick={() => handleDeleteBoard(board.id)}
              >
                <DeleteOutlineIcon
                  sx={{ color: "black", transform: "scale(1.2)" }}
                />
              </IconButton>
              {/* 메뉴 버튼 */}
              <IconButton
                aria-label="menu"
                onClick={(e) => handleMenuOpen(e, index)}
                sx={{ color: "black" , transform: "scale(1.2)"}}
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
            <MenuItem onClick={() => handleAddBoard(board.id)}>
              <AddIcon fontSize="small" sx={{ marginRight: 1 }} />
              추가하기
            </MenuItem>
            <MenuItem onClick={() => handleCopyBoard(board.id)}>
              <ContentCopyIcon fontSize="small" sx={{ marginRight: 1 }} />
              복사하기
            </MenuItem>
            <MenuItem onClick={(e) => handleMoveMenuOpen(e, index)}>
              <SwapVertIcon fontSize="small" sx={{ marginRight: 1 }} />
              이동하기
            </MenuItem>
            <MenuItem
              onClick={() => handleDeleteBoard(board.id)}
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
            {boards.map((_, targetIndex) => {
              if (targetIndex !== index) {
                return (
                  <MenuItem
                    key={targetIndex}
                    onClick={() => moveBoard(index, targetIndex)}
                  >
                    {boards[targetIndex].day}
                  </MenuItem>
                );
              }
              return null;
            })}
          </Menu>

          {/* 카드 내용 */}
          <div className="board-container">
            {board.plans.map((plan, planIndex) => (
              <div className="plan" key={planIndex}>
                <div>{plan.time}</div>
                <textarea
                  value={plan.activity}
                  placeholder="일정 내용"
                  onChange={(e) => {
                    adjustTextareaHeight(e);
                    handleTextareaChange(board.id, planIndex, e.target.value);
                  }}
                  rows={1}
                  style={{
                    padding: "5px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    overflow: "hidden", // 스크롤바를 숨김
                    resize: "none", // 사용자가 크기 조정을 못하도록
                  }}
                />
              </div>
            ))}
          </div>

          <Button
            className="add-plan-button"
            onClick={() => handleAddPlan(board.id)}


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
        </BoardStyle>
      ))}
    </>
  );
};

export default Board;
