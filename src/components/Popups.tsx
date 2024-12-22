import MyButton from "./MyButton";
import { red } from "@mui/material/colors";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useAtom, useAtomValue } from "jotai";
import {
  boardDataAtom,
  popupMenuStateAtom,
  SERVER_HOST,
  templateDataAtom,
} from "../state";
import axios from "axios";
import { CardType, timeStringToDayjs } from "../utils";
import dayjs from "dayjs";

export const MobileMenu = () => {
  return (
    <>
      <MyButton size="large" startIcon={<DownloadIcon />}>
        저장하기
      </MyButton>
      <MyButton size="large" startIcon={<SaveIcon />}>
        다운로드
      </MyButton>
    </>
  );
};

export const BoardMenu = () => {
  const templateData = useAtomValue(templateDataAtom);
  const [boardData, setBoardData] = useAtom(boardDataAtom);
  const popupMenuState = useAtomValue(popupMenuStateAtom);

  // 보드 추가
  const handleAddBoardClick = () => {
    // 15일 이상은 추가 불가
    if (boardData.length >= 15) {
      return;
    }

    const day = popupMenuState.board;
    if (day === null) {
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

  // 보드 복사
  const handleCopyBoardClick = () => {
    if (boardData.length >= 15) {
      return;
    }

    const day = popupMenuState.board;
    if (day === null) {
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
              startTime: timeStringToDayjs(card.startTime).format("HH:mm"),
              endTime: timeStringToDayjs(card.endTime).format("HH:mm"),
            };
          });
          newBoardData.splice(day + 1, 0, newCardData);
          setBoardData(newBoardData);
        }
      });
  };

  // 보드 삭제
  const handleDeleteBoardClick = () => {
    if (boardData.length <= 0) {
      return;
    }

    const day = popupMenuState.board;
    if (day === null) {
      return;
    }

    axios
      .post(`${SERVER_HOST}/api/board?type=delete`, {
        templateId: templateData.id,
        board: day,
      })
      .then((res) => {
        if (res.data.success) {
          const newBoardData = [...boardData];
          newBoardData.splice(day, 1);
          setBoardData(newBoardData);
        }
      });
  };

  return (
    <>
      <MyButton
        size="large"
        startIcon={<AddRoundedIcon />}
        onClick={handleAddBoardClick}
      >
        추가하기!
      </MyButton>
      <MyButton
        size="large"
        startIcon={<ContentCopyRoundedIcon />}
        onClick={handleCopyBoardClick}
      >
        복사하기
      </MyButton>
      <MyButton size="large" startIcon={<SwapHorizIcon />}>
        교체하기
      </MyButton>
      <MyButton
        size="large"
        startIcon={<DeleteOutlineRoundedIcon />}
        textColor={red[500]}
        onClick={handleDeleteBoardClick}
      >
        삭제하기
      </MyButton>
    </>
  );
};

export const CardMenu = () => {
  const templateData = useAtomValue(templateDataAtom);
  const [boardData, setBoardData] = useAtom(boardDataAtom);
  const popupMenuState = useAtomValue(popupMenuStateAtom);

  // 카드 추가 (삽입)
  const handleAddCardClick = () => {
    const day = popupMenuState.board;
    const position = popupMenuState.card;

    if (day === null || position === null) {
      return;
    }

    const prevEndTime = boardData[day][position].endTime;

    let endTime = dayjs.min(
      timeStringToDayjs(prevEndTime).add(10, "minutes"),
      dayjs().hour(23).minute(59)
    );
    if (boardData[day][position + 1]) {
      endTime = dayjs.min(
        endTime,
        timeStringToDayjs(boardData[day][position + 1].startTime)
      );
    }

    if (prevEndTime === endTime.format("HH:mm")) {
      return;
    }

    axios
      .post(`${SERVER_HOST}/api/card?type=insert`, {
        templateId: templateData.id,
        startTime: prevEndTime,
        endTime: endTime.format("HH:mm"),
        board: day,
      })
      .then((res) => {
        const newCardId = res.data.cardId;
        const newCard = {
          id: newCardId,
          type: CardType.TEXT,
          content: "새 계획",
          startTime: prevEndTime,
          endTime: endTime.format("HH:mm"),
        };

        const newBoardData = [...boardData];
        newBoardData[day].splice(position, 0, newCard).sort((a, b) => {
          return a.endTime < b.endTime ? -1 : 1;
        });
        setBoardData(newBoardData);
      });
  };

  // 카드 복사
  const handleCopyCardClick = () => {
    const day = popupMenuState.board;
    const position = popupMenuState.card;

    if (day === null || position === null) {
      return;
    }

    const prevEndTime = boardData[day][position].endTime;
    const prevContent = boardData[day][position].content;

    let endTime = dayjs.min(
      timeStringToDayjs(prevEndTime).add(10, "minutes"),
      dayjs().hour(23).minute(59)
    );
    if (boardData[day][position + 1]) {
      endTime = dayjs.min(
        endTime,
        timeStringToDayjs(boardData[day][position + 1].startTime)
      );
    }

    if (prevEndTime === endTime.format("HH:mm")) {
      return;
    }

    axios
      .post(`${SERVER_HOST}/api/card?type=copy`, {
        cardId: boardData[day][position].id,
        startTime: prevEndTime,
        endTime: endTime.format("HH:mm"),
      })
      .then((res) => {
        if (res.data.success) {
          const newCardId = res.data.cardId;
          const newCard = {
            id: newCardId,
            type: CardType.TEXT,
            content: prevContent,
            startTime: prevEndTime,
            endTime: endTime.format("HH:mm"),
          };

          const newBoardData = [...boardData];
          newBoardData[day].splice(position, 0, newCard).sort((a, b) => {
            return a.endTime < b.endTime ? -1 : 1;
          });
          setBoardData(newBoardData);
        }
      });
  };

  const handleSwapCardClick = () => {};

  // 카드 삭제
  const handleDeleteCardClick = () => {
    const day = popupMenuState.board;
    const position = popupMenuState.card;

    if (day === null || position === null) {
      return;
    }

    axios
      .post(`${SERVER_HOST}/api/card?type=delete`, {
        cardId: boardData[day][position].id,
      })
      .then((res) => {
        if (res.data.success) {
          const newBoardData = [...boardData];
          newBoardData[day].splice(position, 1);
          setBoardData(newBoardData);
        }
      });
  };

  return (
    <>
      <MyButton
        size="large"
        startIcon={<AddRoundedIcon />}
        onClick={handleAddCardClick}
      >
        추가하기
      </MyButton>
      <MyButton
        size="large"
        startIcon={<ContentCopyRoundedIcon />}
        onClick={handleCopyCardClick}
      >
        복사하기
      </MyButton>
      <MyButton size="large" startIcon={<SwapHorizIcon />}>
        교체하기
      </MyButton>
      <MyButton
        size="large"
        startIcon={<DeleteOutlineRoundedIcon />}
        textColor={red[500]}
        onClick={handleDeleteCardClick}
      >
        삭제하기
      </MyButton>
    </>
  );
};
