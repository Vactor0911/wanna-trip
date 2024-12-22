import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
  FormControl,
  Icon,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import {
  boardDataAtom,
  dialogStateAtom,
  DialogType,
  popupMenuStateAtom,
  SERVER_HOST,
  templateDataAtom,
} from "../state";
import { useAtom, useAtomValue } from "jotai";
import axios from "axios";
import { useEffect, useState } from "react";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";

export const BoardDeleteDialog = () => {
  const [dialogState, setDialogState] = useAtom(dialogStateAtom);
  const templateData = useAtomValue(templateDataAtom);
  const [boardData, setBoardData] = useAtom(boardDataAtom);
  const popupMenuState = useAtomValue(popupMenuStateAtom);

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
    <Dialog open={dialogState.type === DialogType.DELETE_BOARD}>
      <DialogTitle sx={{ textAlign: "center" }}>
        {dialogState.from}일차를 삭제하시겠습니까?
      </DialogTitle>
      <DialogActions sx={{ justifyContent: "center", margin: "10px 0" }}>
        <Button
          variant="outlined"
          onClick={() => {
            setDialogState({ ...dialogState, type: DialogType.NONE });
          }}
        >
          취소하기
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            setDialogState({ ...dialogState, type: DialogType.NONE });
            handleDeleteBoardClick();
          }}
        >
          삭제하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const CardDeleteDialog = () => {
  const [dialogState, setDialogState] = useAtom(dialogStateAtom);
  const [boardData, setBoardData] = useAtom(boardDataAtom);
  const popupMenuState = useAtomValue(popupMenuStateAtom);

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
    <Dialog open={dialogState.type === DialogType.DELETE_CARD}>
      <DialogTitle sx={{ textAlign: "center" }}>
        일정을 삭제하시겠습니까?
      </DialogTitle>
      <DialogContentText sx={{ textAlign: "center" }}>
        {dialogState.from}일차 <br />
        {dialogState.to}
      </DialogContentText>
      <DialogActions sx={{ justifyContent: "center", margin: "10px 0" }}>
        <Button
          variant="outlined"
          onClick={() => {
            setDialogState({ ...dialogState, type: DialogType.NONE });
          }}
        >
          취소하기
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            setDialogState({ ...dialogState, type: DialogType.NONE });
            handleDeleteCardClick();
          }}
        >
          삭제하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const BoardSwapDialog = () => {
  const templateData = useAtomValue(templateDataAtom);
  const [dialogState, setDialogState] = useAtom(dialogStateAtom);
  const [boardData, setBoardData] = useAtom(boardDataAtom);
  const popupMenuState = useAtomValue(popupMenuStateAtom);
  const [targetBoard, setTargetBoard] = useState(-1);

  const handleSwrapBoardClick = () => {
    const from = popupMenuState.board;
    const to = targetBoard;

    if (from === null || to === null) {
      return;
    }

    axios
      .post(`${SERVER_HOST}/api/board?type=swap`, {
        templateId: templateData.id,
        from: from,
        to: to,
      })
      .then((res) => {
        if (res.data.success) {
          const newBoardData = [...boardData];
          const temp = newBoardData[from];
          newBoardData[from] = newBoardData[to];
          newBoardData[to] = temp;
          setBoardData(newBoardData);
        }
      });
  };

  return (
    <Dialog
      open={dialogState.type === DialogType.SWAP_BOARD}
      sx={{ textAlign: "center" }}
    >
      <DialogTitle sx={{ textAlign: "center" }}>일정 교체하기</DialogTitle>

      <Select disabled sx={{ margin: "10px 20px" }} value={0}>
        <MenuItem key={0} value={0} selected>
          {dialogState.from + 1}일차
        </MenuItem>
      </Select>

      <Icon sx={{ alignSelf: "center" }} fontSize="large">
        <SwapVertRoundedIcon fontSize="large" />
      </Icon>

      <FormControl sx={{ margin: "10px 20px" }}>
        <InputLabel>교체할 날짜</InputLabel>
        <Select
          value={targetBoard}
          label="교체할 날짜a"
          onChange={(e) => {
            setTargetBoard(Number(e.target.value));
          }}
        >
          {boardData.map((_, index) => {
            if (index === popupMenuState.board) {
              return null;
            }
            return (
              <MenuItem key={index} value={index}>
                {index + 1}일차
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      <DialogActions sx={{ justifyContent: "center", margin: "10px 20px" }}>
        <Button
          variant="outlined"
          onClick={() => {
            setDialogState({ ...dialogState, type: DialogType.NONE });
          }}
        >
          취소하기
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setDialogState({ ...dialogState, type: DialogType.NONE });
            handleSwrapBoardClick();
          }}
        >
          교체하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const CardSwapDialog = () => {
  const [dialogState, setDialogState] = useAtom(dialogStateAtom);
  const [boardData, setBoardData] = useAtom(boardDataAtom);
  const popupMenuState = useAtomValue(popupMenuStateAtom);
  const [targetBoard, setTargetBoard] = useState(0);
  const [targetPosition, setTargetPosition] = useState(-1);

  useEffect(() => {
    setTargetPosition(-1);
  }, [targetBoard]);

  const handleSwrapCardClick = () => {
    if (targetPosition === -1) {
      return;
    }

    const from = popupMenuState.card;
    const to = boardData[targetBoard][targetPosition];

    if (from === null || to === null || popupMenuState.board === null) {
      return;
    }

    axios
      .post(`${SERVER_HOST}/api/card?type=swap`, {
        from: boardData[popupMenuState.board][from].id,
        to: boardData[targetBoard][targetPosition].id,
      })
      .then((res) => {
        if (res.data.success) {
          const newBoardData = [...boardData];
          if (popupMenuState.board !== null && from !== null) {
            const temp = newBoardData[popupMenuState.board][from].content;
            newBoardData[popupMenuState.board][from].content =
              newBoardData[targetBoard][targetPosition].content;
            newBoardData[targetBoard][targetPosition].content = temp;
          }
          setBoardData(newBoardData);
        }
      });
  };

  return (
    <Dialog
      open={dialogState.type === DialogType.SWAP_CARD}
      sx={{ textAlign: "center" }}
    >
      <DialogTitle sx={{ textAlign: "center" }}>일정 교체하기</DialogTitle>

      <Box>
        <Select autoWidth disabled sx={{ margin: "10px" }} value={0}>
          <MenuItem key={0} value={0} selected>
            {dialogState.from + 1}일차
          </MenuItem>
        </Select>
        <Select autoWidth disabled sx={{ margin: "10px" }} value={0}>
          <MenuItem key={0} value={0} selected>
            {dialogState.to + 1}번째
          </MenuItem>
        </Select>
      </Box>

      <Icon sx={{ alignSelf: "center" }} fontSize="large">
        <SwapVertRoundedIcon fontSize="large" />
      </Icon>

      <Box>
        <FormControl>
          <InputLabel>날짜</InputLabel>
          <Select
            autoWidth
            sx={{ margin: "10px" }}
            value={targetBoard}
            label="날짜a"
            onChange={(e) => {
              setTargetBoard(Number(e.target.value));
            }}
          >
            {boardData.map((_, index) => {
              return (
                <MenuItem key={index} value={index}>
                  {index + 1}일차
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>차례</InputLabel>
          <Select
            autoWidth
            sx={{ margin: "10px" }}
            value={targetPosition}
            label="차례a"
            onChange={(e) => {
              setTargetPosition(Number(e.target.value));
            }}
          >
            {boardData[targetBoard]?.map((_, index) => {
              if (
                targetBoard === popupMenuState.board &&
                index === popupMenuState.card
              ) {
                return null;
              }
              return (
                <MenuItem key={index} value={index}>
                  {index + 1}번째
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>

      <DialogActions sx={{ justifyContent: "center", margin: "10px 20px" }}>
        <Button
          variant="outlined"
          onClick={() => {
            setDialogState({ ...dialogState, type: DialogType.NONE });
          }}
        >
          취소하기
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setDialogState({ ...dialogState, type: DialogType.NONE });
            handleSwrapCardClick();
          }}
        >
          교체하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};
