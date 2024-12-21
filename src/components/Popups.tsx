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
import { timeStringToDayjs } from "../utils";

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
  return (
    <>
      <MyButton size="large" startIcon={<AddRoundedIcon />}>
        추가하기
      </MyButton>
      <MyButton size="large" startIcon={<ContentCopyRoundedIcon />}>
        복사하기
      </MyButton>
      <MyButton size="large" startIcon={<SwapHorizIcon />}>
        교체하기
      </MyButton>
      <MyButton
        size="large"
        startIcon={<DeleteOutlineRoundedIcon />}
        textColor={red[500]}
      >
        삭제하기
      </MyButton>
    </>
  );
};
