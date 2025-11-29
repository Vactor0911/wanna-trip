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

// 템플릿 데이터를 텍스트 형식으로 변환
export const convertTemplateToTextData = (template: TemplateData) => {
  if (!template || !template.boards || template.boards.length === 0) {
    return '템플릿 데이터가 없습니다.';
  }

  let textContent = `=== ${template.title || '여행 계획'} ===\n\n`;

  template.boards.forEach((board, boardIndex) => {
    textContent += `📅 ${board.dayNumber}일차\n`;
    textContent += `${'='.repeat(20)}\n\n`;

    if (!board.cards || board.cards.length === 0) {
      textContent += '계획된 일정이 없습니다.\n\n';
      return;
    }

    board.cards.forEach((card, cardIndex) => {
      // 시간 정보
      if (card.startTime && card.endTime) {
        const startTime = card.startTime.format('HH:mm');
        const endTime = card.endTime.format('HH:mm');
        textContent += `⏰ ${startTime} - ${endTime}\n`;
      } else if (card.startTime) {
        const startTime = card.startTime.format('HH:mm');
        textContent += `⏰ ${startTime}\n`;
      }

      // 장소 정보
      if (card.location?.title) {
        textContent += `📍 ${stripHtml(card.location.title)}\n`;
      }

      // 주소 정보
      if (card.location?.address) {
        textContent += `🏠 ${stripHtml(card.location.address)}\n`;
      }

      // 내용 정보
      if (card.content) {
        textContent += `📝 ${stripHtml(card.content)}\n`;
      }

      // 카테고리 정보
      if (card.location?.category) {
        textContent += `🏷️ ${card.location.category}\n`;
      }

      // 카드 간 구분선
      if (cardIndex < board.cards.length - 1) {
        textContent += `${'-'.repeat(30)}\n`;
      }
    });

    // 일차 간 구분선
    if (boardIndex < template.boards.length - 1) {
      textContent += `\n${'='.repeat(40)}\n\n`;
    }
  });

  return textContent;
};

// 텍스트 파일 다운로드
export const downloadText = (template: TemplateData) => {
  try {
    const textContent = convertTemplateToTextData(template);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.title || '여행계획'}_${new Date().toISOString().split('T')[0]}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: '텍스트 파일이 다운로드되었습니다.'
    };
  } catch (error) {
    console.error('텍스트 다운로드 오류:', error);
    return {
      success: false,
      message: '텍스트 다운로드 중 오류가 발생했습니다.'
    };
  }
};
