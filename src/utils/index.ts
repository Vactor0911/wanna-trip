import { createTheme } from "@mui/material";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";

dayjs.extend(minMax);

// MUI 테마
export const theme = createTheme({
  palette: {
    background: {
      default: "#344056",
    },
  },
  typography: {
    fontFamily: ["Noto Sans KR", "sans-serif"].join(","),
    h1: {
      fontSize: "2em",
      fontWeight: "bold",
    },
    h2: {
      fontSize: "1.5em",
      fontWeight: "bold",
    },
    h3: {
      fontSize: "1.17em",
      fontWeight: "bold",
    },
    h4: {
      fontSize: "1em",
      fontWeight: "bold",
    },
    h5: {
      fontSize: "0.83em",
      fontWeight: "bold",
    },
    h6: {
      fontSize: "0.67em",
      fontWeight: "bold",
    },
    subtitle1: {
      fontSize: "1em",
    },
    subtitle2: {
      fontSize: "0.83em",
    },
  },
});

// 색상 테마
export const color = {
  background: "#344056",
  primary: "#47536b",
  primaryLight: "#4d5d77",
  primaryDark: "#2d405e",
  link: "#3575f1",
};

// 시간 문자열을 dayjs 객체로 변환
export const timeStringToDayjs = (time: string): dayjs.Dayjs => {
  if (!time) {
    return dayjs().hour(0).minute(0);
  }
  return dayjs()
    .hour(Number(time.split(":")[0]))
    .minute(Number(time.split(":")[1]));
};

// 템플릿 속성
export interface TemplateInterface {
  id: number;
  title: string;
}

// 카드 속성
export enum CardType {
  TEXT,
  PLACE,
}

export interface CardInterface {
  id: number;
  type: CardType;
  content: string;
  startTime: string;
  endTime: string;
}
