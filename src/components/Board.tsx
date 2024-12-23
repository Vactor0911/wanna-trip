import styled from "@emotion/styled";
import { Button, IconButton } from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useCallback, useRef } from "react";
import {
  boardDataAtom,
  dialogStateAtom,
  DialogType,
  popupMenuStateAtom,
  PopupMenuType,
  SERVER_HOST,
  templateDataAtom,
} from "../state";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Card from "./Card";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { CardType, timeStringToDayjs } from "../utils";
import axios from "axios";

import dayjs from "dayjs";

const Style = styled.div`
  .board {
    display: flex;
    flex-direction: column;
    min-width: 280px;
    width: 20vw;
    max-height: 100%;
    padding: 10px 15px;
    gap: 15px;
    background-color: #d9d9d9;
    border-radius: 5px;
  }

  .board > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  header > .btn-container {
    display: flex;
  }

  .board-scrollbar,
  .card-container {
    display: flex;
  }

  .card-container {
    flex-direction: column;
    gap: 15px;
  }

  @media (max-width: 480px) {
    .board {
      width: 90vw;
    }
  }
`;

interface BoardProps {
  day: number;
}

const Board = ({ day }: BoardProps) => {
  const [boardData, setBoardData] = useAtom(boardDataAtom);
  const templateData = useAtomValue(templateDataAtom);

  // 카드 추가
  const appendCard = useCallback(() => {
    if (!templateData) {
      return;
    }

    let startTime = dayjs().hour(0).minute(0);
    if (boardData[day]) {
      const cards = boardData[day];

      if (cards.length > 0) {
        startTime = timeStringToDayjs(cards[cards.length - 1].endTime);
      }

      // 23:59 이후로는 계획 추가 불가
      if (startTime.isAfter(dayjs().hour(23).minute(59))) {
        return;
      }
    }
    const endTime = dayjs.min(
      startTime.add(10, "minutes"),
      dayjs().hour(23).minute(59)
    );

    axios
      .post(`${SERVER_HOST}/api/card?type=append`, {
        templateId: templateData.id,
        startTime: startTime.format("HH:mm"),
        endTime: endTime.format("HH:mm"),
        board: day,
      })
      .then((res) => {
        const newCardId = res.data.cardId;
        const newCard = {
          id: newCardId,
          type: CardType.TEXT,
          content: "새 계획",
          startTime: startTime.format("HH:mm"),
          endTime: endTime.format("HH:mm"),
        };

        // 보드에 카드가 없을 경우 새로 생성
        if (!boardData[day]) {
          setBoardData([...boardData, [newCard]]);
          return;
        }

        // 보드에 카드가 있을 경우 추가
        const newBoardData = [...boardData];
        newBoardData[day].push(newCard);
        setBoardData(newBoardData);
      });
  }, [boardData, day, setBoardData, templateData]);

  // 카드 팝업 메뉴
  const [popupMenuState, setPopupMenuState] = useAtom(popupMenuStateAtom);
  const anchorBoardMenu = useRef<HTMLButtonElement>(null);
  const handleMenuClicked = () => {
    const newPopupMenuState = {
      isOpen: !popupMenuState.isOpen,
      type: PopupMenuType.BOARD,
      anchor: anchorBoardMenu.current,
      placement: "right-start",
      board: day,
      card: null,
    };
    setPopupMenuState(newPopupMenuState);
  };

  // 새 보드 추가
  const addBoard = (day: number) => {
    // 15일 이상은 추가 불가
    if (boardData.length >= 15) {
      return;
    }

    axios
      .post(`${SERVER_HOST}/api/board?type=insert`, {
        templateId: templateData.id,
        board: day,
      })
      .then((res) => {
        if (res.data.success) {
          const newBoardData = [...boardData];
          newBoardData.splice(day + 1, 0, []);
          setBoardData(newBoardData);
        }
      });
  };

  // 보드 삭제
  const setDialogState = useSetAtom(dialogStateAtom);
  const handleDeleteBoardClick = (day: number) => {
    if (day === null) {
      return;
    }

    setDialogState({
      type: DialogType.DELETE_BOARD,
      from: day + 1,
      to: null,
    });
  };

  // 보드 복사
  const copyBoard = (day: number) => {
    if (boardData.length >= 15) {
      return;
    }

    axios
      .post(`${SERVER_HOST}/api/board?type=copy`, {
        templateId: templateData.id,
        board: day,
      })
      .then((res) => {
        if (res.data.success) {
          const newBoardData = [...boardData];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newCardData = res.data.cards.map((card: any) => {
            return {
              id: card.card_id,
              type: card.type,
              content: card.content,
              startTime: timeStringToDayjs(card.start_time).format("HH:mm"),
              endTime: timeStringToDayjs(card.end_time).format("HH:mm"),
            };
          });
          console.log("New Card Data: ", newCardData);
          newBoardData.splice(day + 1, 0, newCardData);
          setBoardData(newBoardData);
        }
      });
  };

  return (
    <Style>
      <div className="board">
        {/* 헤더 */}
        <header>
          {/* 제목 */}
          <h2>DAY {day + 1}</h2>

          {/* 버튼 */}
          <div className="btn-container">
            <IconButton
              onClick={() => addBoard(day)}
              disabled={boardData.length >= 15}
            >
              <AddRoundedIcon sx={{ transform: "scale(1.3)" }} />
            </IconButton>
            <IconButton
              disabled={boardData.length >= 15}
              onClick={() => copyBoard(day)}
            >
              <ContentCopyRoundedIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteBoardClick(day)}>
              <DeleteOutlineRoundedIcon sx={{ transform: "scale(1.15)" }} />
            </IconButton>
            <IconButton ref={anchorBoardMenu} onClick={handleMenuClicked}>
              <MenuRoundedIcon sx={{ transform: "scale(1, 1.5)" }} />
            </IconButton>
          </div>
        </header>

        {/* 카드 표시 부분 */}
        <OverlayScrollbarsComponent id="board-scrollbar">
          <div className="card-container">
            {boardData[day]
              ?.sort(function (a, b) {
                return a.endTime < b.endTime ? -1 : 1;
              })
              .map((_card, index) => {
                return <Card key={index} day={day} position={index} />;
              })}
          </div>
        </OverlayScrollbarsComponent>

        {/* 계획 추가 버튼 */}
        <Button
          startIcon={<AddRoundedIcon sx={{ color: "#4c4c4c" }} />}
          sx={{
            alignSelf: "flex-start",
            color: "#4c4c4c",
            fontWeight: "bold",
            fontSize: "1.1em",
          }}
          onClick={appendCard}
        >
          계획 추가하기
        </Button>
      </div>
    </Style>
  );
};

export default Board;
