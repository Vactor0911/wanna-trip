import { Box, BoxProps, Skeleton } from "@mui/material";
import { useEffect, useRef } from "react";

// 네이버 지도 API를 사용하기 위한 타입 선언
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naver: any;
  }
}

interface MapProps extends BoxProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  interactive?: boolean; // 상호작용 가능 여부
  markerPosition?: { lat: number; lng: number } | null; // 마커 위치
  drawerOpen?: boolean; // 검색 패널 열림/닫힘 상태
  drawerWidth?: number; // 검색 패널 너비
  disabled?: boolean; // 비활성화 여부
}

const DEFAULT_LAT = 37.5665; // 서울 시청 위도
const DEFAULT_LNG = 126.978; // 서울 시청 경도

const NaverMap = (props: MapProps) => {
  const {
    width = 200,
    height,
    lat = DEFAULT_LAT,
    lng = DEFAULT_LNG,
    zoom = 17,
    interactive = true, // 기본값은 상호작용 가능
    markerPosition = null, // 마커 위치 (없으면 null)
    drawerOpen = false, // 기본값 false
    drawerWidth = 350, // 기본값 350px
    sx,
    onClick,
    disabled,
    ...others
  } = props;

  const mapRef = useRef<HTMLDivElement | null>(null); // 지도 컨테이너를 참조하기 위한 ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null); // 지도 인스턴스 참조
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null); // 마커 인스턴스 참조

  const VITE_NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

  useEffect(() => {
    // 네이버 클라이언트 ID가 설정되지 않은 경우 초기화 중단
    if (!VITE_NAVER_MAP_CLIENT_ID) {
      return;
    }

    // 네이버 지도 스크립트가 로드되지 않았을 경우 동적으로 추가
    if (!window.naver) {
      const script = document.createElement("script");
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${VITE_NAVER_MAP_CLIENT_ID}`;
      script.async = true;
      script.onload = () => {
        initializeMap(); // 스크립트 로드 후 지도 초기화
      };
      document.body.appendChild(script);
    } else {
      initializeMap(); // 이미 로드된 경우 지도 초기화
    }

    function initializeMap() {
      if (!window.naver || !mapRef.current) return;

      // 검색 패널이 열려있으면 지도 중심을 오른쪽으로 이동하는 오프셋 추가
      const offset = drawerOpen
        ? new window.naver.maps.Point(drawerWidth / 2, 0)
        : new window.naver.maps.Point(0, 0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapOptions: any = {
        center: new window.naver.maps.LatLng(lat, lng),
        zoom,
        offset, // 검색 패널이 열려있을 때 지도 중심 오프셋
      };

      // 상호작용 비활성화 옵션 추가
      if (!interactive) {
        mapOptions.draggable = false; // 드래그 비활성화
        mapOptions.pinchZoom = false; // 핀치 줌 비활성화
        mapOptions.scrollWheel = false; // 스크롤 휠 줌 비활성화
        mapOptions.keyboardShortcuts = false; // 키보드 단축키 비활성화
        mapOptions.disableDoubleTapZoom = true; // 더블 탭 줌 비활성화
        mapOptions.disableDoubleClickZoom = true; // 더블 클릭 줌 비활성화
        mapOptions.disableTwoFingerTapZoom = true; // 두 손가락 탭 줌 비활성화
      }

      // 지도 인스턴스 생성 및 저장
      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // 마커 초기화
      if (markerPosition) {
        markerRef.current = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(
            markerPosition.lat,
            markerPosition.lng
          ),
          map: map,
        });
      }
    }

    return () => {
      // 컴포넌트 언마운트 시 마커 정리
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [
    VITE_NAVER_MAP_CLIENT_ID,
    drawerOpen,
    drawerWidth,
    interactive,
    lat,
    lng,
    markerPosition,
    zoom,
  ]);

  // drawer 상태 변경 시 지도 오프셋 업데이트하는 효과
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver) return;

    const offset = drawerOpen
      ? new window.naver.maps.Point(drawerWidth / 2, 0)
      : new window.naver.maps.Point(0, 0);

    mapInstanceRef.current.setOptions("offset", offset);
  }, [drawerOpen, drawerWidth]);

  // 마커 위치 변경 시 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver) return;

    // 지도 중심 변경
    if (markerPosition) {
      const position = new window.naver.maps.LatLng(
        markerPosition.lat,
        markerPosition.lng
      );
      mapInstanceRef.current.setCenter(position);

      // 마커 업데이트
      if (markerRef.current) {
        markerRef.current.setPosition(position);
      } else {
        // 새 마커 생성
        markerRef.current = new window.naver.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          animation: window.naver.maps.Animation.DROP,
        });
      }
    } else if (markerRef.current) {
      // 마커 제거
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  }, [markerPosition]);

  // 클라이언트 ID가 설정되지 않은 경우 로딩 스켈레톤 표시
  if (!VITE_NAVER_MAP_CLIENT_ID) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width,
          height,
          borderRadius: 2,
          pointer: disabled ? "default" : "pointer",
          ...sx,
        }}
        onClick={disabled ? undefined : onClick}
      />
    );
  }

  return (
    <Box
      ref={mapRef} // 지도 컨테이너를 참조하기 위한 ref
      sx={{
        width,
        height,
        borderRadius: 2, // 모서리 둥글게
        overflow: "hidden", // 자식 요소가 경계 밖으로 나가지 않도록 설정
        cursor: disabled ? "default" : "pointer", // 비활성화 시 커서 변경
        ...sx,
      }}
      onClick={disabled ? undefined : onClick}
      {...others}
    />
  );
};

export default NaverMap;
