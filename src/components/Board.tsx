import styled from "@emotion/styled";
import { Button, IconButton } from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import React, { ReactElement, ReactNode } from "react";

const Style = styled.div`
  display: flex;
  flex-direction: column;
  width: 20%;
  min-width: 280px;
  padding: 10px 15px;
  gap: 15px;
  background-color: #d9d9d9;
  border-radius: 5px;

  & > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  header > .btn-container {
    display: flex;
  }
`;

// 헤더에 있는 아이콘 버튼 컴포넌트
const MyIconButton = ({ children }: { children: ReactNode }) => {
  return (
    <IconButton
      sx={{
        color: "#4c4c4c",
        padding: "3px",
      }}
    >
      {React.isValidElement(children) && typeof children.type !== "string"
        ? React.cloneElement(children as ReactElement, {
            style: { ...(children.props.style || {}), fontSize: "1.25em" },
          })
        : children}
    </IconButton>
  );
};

interface BoardProps {
  day: number;
}

const Board = ({ day }: BoardProps) => {
  return (
    <Style className="board">
      {/* 헤더 */}
      <header>
        {/* 제목 */}
        <h2>DAY {day}</h2>

        {/* 버튼 */}
        <div className="btn-container">
          <MyIconButton>
            <AddRoundedIcon sx={{ transform: "scale(1.3)" }} />
          </MyIconButton>
          <MyIconButton>
            <ContentCopyRoundedIcon />
          </MyIconButton>
          <MyIconButton>
            <DeleteOutlineRoundedIcon sx={{ transform: "scale(1.15)" }} />
          </MyIconButton>
          <MyIconButton>
            <MenuRoundedIcon sx={{ transform: "scale(1, 1.5)" }} />
          </MyIconButton>
        </div>
      </header>

      {/* 카드 표시 부분 */}

      {/* 계획 추가 버튼 */}
      <Button
        startIcon={<AddRoundedIcon sx={{ color: "#4c4c4c" }} />}
        sx={{
          alignSelf: "flex-start",
          color: "#4c4c4c",
          fontWeight: "bold",
          fontSize: "1.1em",
        }}
      >
        계획 추가하기
      </Button>
    </Style>
  );
};

export default Board;
