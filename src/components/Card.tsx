import styled from "@emotion/styled";
import { useAtom } from "jotai";
import { boardDataAtom, popupMenuStateAtom, PopupMenuType } from "../state";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { IconButton, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { timeStringToDayjs } from "../utils";

const Style = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  background-color: #ebebeb;
  padding: 10px;
  gap: 20px;

  .time-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .time-container > button {
    font-weight: bold;
    font-size: 1.2em;
    color: black;
  }

  .time-container > h3 {
    transform: translateY(-0.125em);
  }

  #btn-menu {
    align-self: flex-start;
  }
`;

interface CardProps {
  day: number;
  position: number;
}

const Card = ({ day, position }: CardProps) => {
  const [boardData, setBoardData] = useAtom(boardDataAtom);
  const card = boardData[day][position];

  const [startTime, setStartTime] = useState<dayjs.Dayjs>(
    timeStringToDayjs(card.startTime)
  );
  const [endTime, setEndTime] = useState<dayjs.Dayjs>(
    timeStringToDayjs(card.endTime)
  );

  const [content, setContent] = useState(card.content);

  useEffect(() => {
    if (!boardData[day][position]) {
      return;
    }
  }, [boardData, day, position]);

  const handleStartTimeChange = (newStartTime: dayjs.Dayjs) => {
    if (!boardData[day][position]) {
      return;
    }

    setStartTime(newStartTime);
    const hour = newStartTime.hour();
    const minute = newStartTime.minute();
    boardData[day][position].startTime = `${hour}:${minute}`;
  };

  const handleEndTimeChange = (newEndTime: dayjs.Dayjs) => {
    if (!boardData[day]) {
      return;
    }

    setEndTime(newEndTime);
    const hour = newEndTime.hour();
    const minute = newEndTime.minute();
    boardData[day][position].endTime = `${hour}:${minute}`;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  // 시간 범위 검증
  const getMinTime = useCallback(() => {
    if (position === 0) {
      return dayjs().hour(0).minute(1);
    }

    if (!boardData[day]) {
      return dayjs().hour(0).minute(1);
    }

    const prevCard = boardData[day][position - 1];
    if (prevCard) {
      const [hour, minute] = prevCard.endTime
        .split(":")
        .map((time) => Number(time));
      return dayjs().hour(hour).minute(minute);
    } else {
      return dayjs().hour(0).minute(1);
    }
  }, [boardData, day, position]);

  const getMaxTime = useCallback(() => {
    if (!boardData[day]) {
      return dayjs().hour(23).minute(58);
    }

    if (position === boardData[day].length - 1) {
      return dayjs().hour(23).minute(58);
    }

    const nextCard = boardData[day][position + 1];
    if (nextCard) {
      const [hour, minute] = nextCard.startTime
        .split(":")
        .map((time) => Number(time));
      return dayjs().hour(hour).minute(minute);
    } else {
      return dayjs().hour(23).minute(58);
    }
  }, [boardData, day, position]);

  // 카드 팝업 메뉴
  const [popupMenuState, setPopupMenuState] = useAtom(popupMenuStateAtom);
  const anchorCardMenu = useRef<HTMLButtonElement>(null);
  const handleMenuClicked = () => {
    const newPopupMenuState = {
      isOpen: !popupMenuState.isOpen,
      type: PopupMenuType.CARD,
      anchor: anchorCardMenu.current,
      placement: "right-start",
      board: day,
      card: position,
    };
    setPopupMenuState(newPopupMenuState);
  };

  return (
    <Style>
      <div className="time-container">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileTimePicker
            defaultValue={startTime}
            onChange={(newStartTime) => {
              if (newStartTime) {
                handleStartTimeChange(newStartTime);
              }
            }}
            minTime={getMinTime().subtract(1, "minute")}
            maxTime={endTime}
          />
          <h3>~</h3>
          <MobileTimePicker
            defaultValue={endTime}
            onChange={(newEndTime) => {
              if (newEndTime) {
                handleEndTimeChange(newEndTime);
              }
            }}
            minTime={startTime}
            maxTime={getMaxTime().add(1, "minute")}
          />
          <IconButton
            aria-label="delete"
            id="btn-menu"
            ref={anchorCardMenu}
            onClick={handleMenuClicked}
          >
            <MoreVertIcon />
          </IconButton>
        </LocalizationProvider>
      </div>
      <TextField
        label=""
        variant="standard"
        multiline
        value={content}
        slotProps={{ input: { style: { fontSize: "1.1em" } } }}
        onChange={handleContentChange}
      />
    </Style>
  );
};

export default Card;
