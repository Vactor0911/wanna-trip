import { Dayjs } from "dayjs";
import ExcelJS from "exceljs";

// 템플릿 데이터 타입 정의
export interface TemplateData {
  uuid: string;
  title: string;
  boards: BoardData[];
}

export interface BoardData {
  id: number;
  dayNumber: number;
  title: string;
  cards: CardData[];
}

export interface CardData {
  id: number;
  content: string;
  startTime: Dayjs; // dayjs 객체
  endTime: Dayjs; // dayjs 객체
  orderIndex: number;
  isLocked: boolean;
  location?: {
    title: string;
    address: string;
    latitude: number;
    longitude: number;
    category: string;
    thumbnailUrl: string;
  };
}

// HTML 태그 및 엔티티 제거 함수
const stripHtml = (html: string) => {
  if (!html) return "";

  // 임시 div 요소를 사용하여 HTML 엔티티 자동 디코딩
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  let text = tempDiv.textContent || tempDiv.innerText || "";

  // HTML 태그 제거 (혹시 남아있는 경우)
  text = text.replace(/<[^>]*>/g, "");

  // 연속된 공백을 하나로 정리
  text = text.replace(/\s+/g, " ");

  return text.trim();
};

// Excel 데이터 변환 함수 (ExcelJS 워크시트용)
export const convertTemplateToExcelData = (template: TemplateData) => {
  const rows: unknown[][] = [];

  // 헤더 행 추가
  rows.push([
    "일차",
    "시작 시간",
    "종료 시간",
    "카드 내용",
    "장소명",
    "장소 주소",
  ]);

  // 각 보드와 카드 데이터 추가
  template.boards.forEach((board) => {
    if (board.cards.length === 0) {
      // 카드가 없는 보드도 표시
      rows.push([board.dayNumber, "", "", "", "", ""]);
    } else {
      board.cards.forEach((card, cardIndex) => {
        // 일차는 첫 번째 카드에만 표시하고 나머지는 빈 문자열
        const dayNumber = cardIndex === 0 ? board.dayNumber : "";

        // 시작 시간과 종료 시간을 "HH:mm" 형식으로 표시
        const startTime = card.startTime ? card.startTime.format("HH:mm") : "";
        const endTime = card.endTime ? card.endTime.format("HH:mm") : "";

        rows.push([
          dayNumber,
          startTime,
          endTime,
          stripHtml(card.content || ""),
          stripHtml(card.location?.title || ""),
          stripHtml(card.location?.address || ""),
        ]);
      });
    }
  });

  return rows;
};

// Excel 파일 다운로드 함수
export const downloadExcel = async (
  template: TemplateData,
  filename?: string
) => {
  try {
    const excelData = convertTemplateToExcelData(template);

    // 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("여행 계획");

    // 데이터 추가
    worksheet.addRows(excelData);

    // 셀 병합 설정 (일차 컬럼 병합)
    let currentRow = 2; // 헤더 다음 행부터 시작 (1-based)

    template.boards.forEach((board) => {
      if (board.cards.length > 1) {
        // 같은 일차의 카드가 2개 이상인 경우 병합
        const startRow = currentRow;
        const endRow = currentRow + board.cards.length - 1;

        worksheet.mergeCells(`A${startRow}:A${endRow}`);
      }
      currentRow += board.cards.length || 1; // 카드가 없어도 1행은 추가
    });

    // 헤더 스타일 설정
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.style = {
        font: { bold: true },
        alignment: {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F3F3" },
        },
      };
    });

    // 데이터 행 스타일 설정
    for (let rowNumber = 2; rowNumber <= excelData.length; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      row.eachCell((cell) => {
        cell.style = {
          alignment: {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          },
          border: {
            top: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          },
        };
      });
    }

    // 컬럼 너비 설정 (가독성 향상)
    worksheet.columns = [
      { width: 12 }, // 일차
      { width: 18 }, // 시작 시간
      { width: 18 }, // 종료 시간
      { width: 40 }, // 카드 내용
      { width: 35 }, // 장소명
      { width: 50 }, // 장소 주소
    ];

    // 행 높이 설정 (가독성 향상)
    for (let i = 1; i <= excelData.length; i++) {
      worksheet.getRow(i).height = 25; // 기본 높이 25포인트
    }

    // 파일명 생성
    const defaultFilename = `${template.title || "여행계획"}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    const finalFilename = filename || defaultFilename;

    // 개발 모드에서 워크시트 내용 콘솔에 출력
    if (process.env.NODE_ENV === "development") {
      console.table(excelData);
    }

    // Excel 파일 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: "Excel 파일이 다운로드되었습니다." };
  } catch (error) {
    console.error("Excel 다운로드 오류:", error);
    return {
      success: false,
      message: "Excel 다운로드 중 오류가 발생했습니다.",
    };
  }
};
