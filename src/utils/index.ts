import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";

dayjs.extend(minMax);

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
