import { atom } from "jotai";

// 지도 기본값
export const DEFAULT_LAT = 37.5665; // 지도 위도
export const DEFAULT_LNG = 126.978; // 지도 경도
export const DEFAULT_ZOOM = 17; // 지도 줌 레벨

export const naverMapDialogOpenAtom = atom(false); // 네이버 지도 다이얼로그 열림 상태

export const markerPositionAtom = atom<{ lat: number; lng: number }>({
  lat: 0,
  lng: 0,
}); // 마커 위치 상태

export const zoomAtom = atom(DEFAULT_ZOOM); // 지도 줌 레벨 상태

export const drawerOpenAtom = atom(false); // 검색창 드로어 메뉴 열림 상태

export const keywordAtom = atom(""); // 검색어 상태

export interface LocationInterface {
  title: string;
  address: string;
  roadAddress?: string; // 도로명 주소
  category?: string;
  description?: string; // 설명
  thumbnailUrl?: string; // 선택사항으로 변경
  imageUrl?: string | null; // 선택사항으로 변경
  latitude?: number; // latitude
  longitude?: number; // longitude
  mapx?: string; // 경도 (예: "1269796830")
  mapy?: string; // 위도 (예: "375704149")
  telephone?: string; // 전화번호
  link?: string; // 링크
}

export const searchResultsAtom = atom<LocationInterface[]>([]); // 검색 결과 상태

export const selectedPositionAtom = atom<{ lat: number; lng: number } | null>(
  null
); // 지도에서 선택된 위치 상태

export const naverMapInitialLocationAtom = atom<LocationInterface | null>(null); // 초기 위치 정보 상태

export const selectedLocationAtom = atom<LocationInterface | null>(null); // 선택된 위치 정보 상태

export const locationDialogAnchor = atom<HTMLDivElement | null>(null); // 위치 선택 대화상자 앵커 요소
