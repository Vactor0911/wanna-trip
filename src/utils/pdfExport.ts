import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// HTML 테이블을 생성하는 함수
const createHtmlTable = (template: TemplateData, pdfData: any[]) => {
  const headers = ['일차', '시작 시간', '종료 시간', '카드 내용', '장소명', '장소 주소'];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
          margin: 20px;
          padding: 20px;
          background: white;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          text-align: center;
        }
        .date {
          font-size: 12px;
          margin-bottom: 20px;
          text-align: center;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: center;
          vertical-align: middle;
        }
        th {
          background-color: #f3f3f3;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .day-cell {
          width: 60px;
        }
        .time-cell {
          width: 80px;
        }
        .content-cell {
          width: 200px;
          text-align: left;
        }
        .place-cell {
          width: 150px;
          text-align: left;
        }
        .address-cell {
          width: 250px;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="title">${template.title || '여행 계획'}</div>
      <div class="date">생성일: ${new Date().toLocaleDateString('ko-KR')}</div>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${pdfData.map(row => `
            <tr>
              <td class="day-cell">${row[0]}</td>
              <td class="time-cell">${row[1]}</td>
              <td class="time-cell">${row[2]}</td>
              <td class="content-cell">${row[3]}</td>
              <td class="place-cell">${row[4]}</td>
              <td class="address-cell">${row[5]}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  return html;
};

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
  
  // 임시 div 요소를 사용하여 HTML 엔티티 자동 디코딩
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // HTML 태그 제거 (혹시 남아있는 경우)
  text = text.replace(/<[^>]*>/g, '');
  
  // 연속된 공백을 하나로 정리
  text = text.replace(/\s+/g, ' ');
  
  return text.trim();
};

// PDF 데이터 변환 함수
export const convertTemplateToPdfData = (template: TemplateData) => {
  const pdfData: any[] = [];
  
  // 각 보드와 카드 데이터 추가
  template.boards.forEach((board) => {
    if (board.cards.length === 0) {
      // 카드가 없는 보드도 표시
      pdfData.push([
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
        
        // 시작 시간과 종료 시간을 "HH:mm" 형식으로 표시
        const startTime = card.startTime ? card.startTime.format('HH:mm') : '';
        const endTime = card.endTime ? card.endTime.format('HH:mm') : '';
        
        pdfData.push([
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

  return pdfData;
};

// PDF 파일 다운로드 함수
export const downloadPdf = async (template: TemplateData, filename?: string) => {
  try {
    const pdfData = convertTemplateToPdfData(template);
    
    // HTML 테이블 생성
    const html = createHtmlTable(template, pdfData);
    
    // iframe을 사용하여 화면에 영향을 주지 않도록 처리
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1200px';
    iframe.style.height = '800px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);
    
    try {
      // iframe에 HTML 로드
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('iframe 문서에 접근할 수 없습니다.');
      }
      
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      
      // iframe이 로드될 때까지 대기
      await new Promise((resolve) => {
        iframe.onload = resolve;
        setTimeout(resolve, 1000); // 최대 1초 대기
      });
      
      // HTML을 캔버스로 변환
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: iframeDoc.body.scrollHeight
      });
      
      // 캔버스를 PDF로 변환
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 297; // A4 가로 크기 (mm)
      const pageHeight = 210; // A4 세로 크기 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // 파일명 생성
      const defaultFilename = `${template.title || '여행계획'}_${new Date().toISOString().split('T')[0]}.pdf`;
      const finalFilename = filename || defaultFilename;
      
      // PDF 파일 다운로드
      pdf.save(finalFilename);
      
      return { success: true, message: 'PDF 파일이 다운로드되었습니다.' };
    } finally {
      // iframe 제거
      document.body.removeChild(iframe);
    }
  } catch (error) {
    console.error('PDF 다운로드 오류:', error);
    return { success: false, message: 'PDF 다운로드 중 오류가 발생했습니다.' };
  }
};
