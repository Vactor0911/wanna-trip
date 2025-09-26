import XLSX from 'xlsx-js-style';

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
  startTime: any; // dayjs 객체
  endTime: any; // dayjs 객체
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
  if (!html) return '';
  
  // HTML 엔티티 디코딩
  const htmlEntities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '...',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&bull;': '•',
    '&middot;': '·'
  };
  
  let text = html;
  
  // HTML 엔티티 디코딩
  Object.keys(htmlEntities).forEach(entity => {
    const regex = new RegExp(entity, 'g');
    text = text.replace(regex, htmlEntities[entity]);
  });
  
  // HTML 태그 제거
  text = text.replace(/<[^>]*>/g, '');
  
  // 연속된 공백을 하나로 정리
  text = text.replace(/\s+/g, ' ');
  
  return text.trim();
};

// Excel 데이터 변환 함수 (값만)
export const convertTemplateToExcelData = (template: TemplateData) => {
  const excelData: any[] = [];
  
  // 헤더 행 추가
  excelData.push([
    '일차',
    '시작 시간',
    '종료 시간',
    '카드 내용',
    '장소명',
    '장소 주소'
  ]);

  // 각 보드와 카드 데이터 추가
  template.boards.forEach((board) => {
    if (board.cards.length === 0) {
      // 카드가 없는 보드도 표시
      excelData.push([
        board.dayNumber,
        '',
        '',
        '',
        '',
        ''
      ]);
    } else {
      board.cards.forEach((card, cardIndex) => {
        // 일차는 첫 번째 카드에만 표시하고 나머지는 빈 문자열
        const dayNumber = cardIndex === 0 ? board.dayNumber : '';
        
        // 시작 시간과 종료 시간을 "HH:mm ~" 형식으로 표시
        const startTime = card.startTime ? card.startTime.format('HH:mm') + ' ~' : '';
        const endTime = card.endTime ? card.endTime.format('HH:mm') : '';
        
        excelData.push([
          dayNumber,
          startTime,
          endTime,
          stripHtml(card.content || ''),
          stripHtml(card.location?.title || ''),
          stripHtml(card.location?.address || '')
        ]);
      });
    }
  });

  return excelData;
};

// Excel 파일 다운로드 함수
export const downloadExcel = (template: TemplateData, filename?: string) => {
  try {
    const excelData = convertTemplateToExcelData(template);
    
    // 워크시트 생성 (xlsx-js-style 사용)
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // 셀 병합 설정 (일차 컬럼 병합)
    const merges: any[] = [];
    let currentRow = 1; // 헤더 다음 행부터 시작 (0-based)
    
    template.boards.forEach((board) => {
      if (board.cards.length > 1) {
        // 같은 일차의 카드가 2개 이상인 경우 병합
        const startRow = currentRow;
        const endRow = currentRow + board.cards.length - 1;
        
        merges.push({
          s: { r: startRow, c: 0 }, // 시작 행, A열 (일차)
          e: { r: endRow, c: 0 }    // 끝 행, A열 (일차)
        });
      }
      currentRow += board.cards.length || 1; // 카드가 없어도 1행은 추가
    });
    
    // 병합 설정 적용
    worksheet['!merges'] = merges;
    
    // 셀 스타일 설정 (xlsx-js-style 방식)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;
        
        // 헤더 행인지 확인 (첫 번째 행)
        const isHeader = row === 0;
        
        // xlsx-js-style 방식으로 스타일 설정
        worksheet[cellAddress].s = {
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true // 텍스트 줄바꿈 허용
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          },
          fill: isHeader ? {
            fgColor: { rgb: 'F3F3F3' }
          } : undefined
        };
      }
    }
    
    // 컬럼 너비 설정 (가독성 향상)
    const columnWidths = [
      { wch: 12 }, // 일차 (8 → 12)
      { wch: 18 }, // 시작 시간 (12 → 18)
      { wch: 18 }, // 종료 시간 (12 → 18)
      { wch: 40 }, // 카드 내용 (30 → 40)
      { wch: 35 }, // 장소명 (25 → 35)
      { wch: 50 }  // 장소 주소 (40 → 50)
    ];
    worksheet['!cols'] = columnWidths;
    
    // 행 높이 설정 (가독성 향상)
    const rowHeights: any[] = [];
    const maxRow = excelData.length - 1;
    for (let i = 0; i <= maxRow; i++) {
      rowHeights.push({ hpt: 25 }); // 기본 높이 25포인트 (약 18px)
    }
    worksheet['!rows'] = rowHeights;
    
    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '여행 계획');
    
    // 파일명 생성
    const defaultFilename = `${template.title || '여행계획'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const finalFilename = filename || defaultFilename;
    
    // 개발 모드에서 워크시트 내용 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Excel 데이터 미리보기 ===');
      console.table(excelData);
      console.log('=== 워크시트 정보 ===');
      console.log('범위:', worksheet['!ref']);
      console.log('컬럼 너비:', worksheet['!cols']);
      console.log('=== 스타일 확인 ===');
      console.log('A1 스타일:', worksheet['A1']?.s);
      console.log('A2 스타일:', worksheet['A2']?.s);
    }
    
    // Excel 파일 다운로드
    XLSX.writeFile(workbook, finalFilename);
    
    return { success: true, message: 'Excel 파일이 다운로드되었습니다.' };
  } catch (error) {
    console.error('Excel 다운로드 오류:', error);
    return { success: false, message: 'Excel 다운로드 중 오류가 발생했습니다.' };
  }
};
