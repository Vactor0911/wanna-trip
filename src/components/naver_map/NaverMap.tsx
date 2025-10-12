import { Box, BoxProps, Skeleton } from "@mui/material";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  DEFAULT_ZOOM,
  drawerOpenAtom,
} from "../../state/naverMapDialog";

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
  markerPosition?: { lat: number; lng: number } | null; // 마커 위치 (단일 마커)
  markers?: Array<{ 
    lat: number; 
    lng: number; 
    title?: string; 
    color?: string;
    label?: string; // 마커에 표시할 텍스트
  }>; // 여러 마커 위치
  polylines?: Array<{
    path: Array<{ lat: number; lng: number }>;
    color?: string;
    weight?: number;
    opacity?: number;
  }>; // 연결선 데이터
  drawerOpen?: boolean; // 검색 패널 열림/닫힘 상태
  drawerWidth?: number; // 검색 패널 너비
  disabled?: boolean; // 비활성화 여부
  onMarkerClick?: (marker: { lat: number; lng: number; title?: string }) => void; // 마커 클릭 이벤트
}

const NaverMap = (props: MapProps) => {
  const {
    width = 200,
    height,
    lat = DEFAULT_LAT,
    lng = DEFAULT_LNG,
    zoom = DEFAULT_ZOOM,
    interactive = true, // 기본값은 상호작용 가능
    markerPosition = null, // 마커 위치 (없으면 null)
    markers = [], // 여러 마커 위치
    polylines = [], // 연결선 데이터
    drawerWidth = 350, // 기본값 350px
    onMarkerClick,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]); // 여러 마커 인스턴스 참조
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylinesRef = useRef<any[]>([]); // 여러 polyline 인스턴스 참조
  const [isMapInitialized, setIsMapInitialized] = useState(false); // 지도 초기화 완료 상태
  const drawerOpen = useAtomValue(drawerOpenAtom); // 검색 패널 열림 상태

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
      
      
      // 지도 초기화 완료 상태 설정
      setIsMapInitialized(true);

      // 단일 마커 초기화 (markerPosition이 있는 경우)
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
      // 여러 마커들도 정리
      markersRef.current.forEach(marker => {
        if (marker) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];

      // polyline들도 정리
      polylinesRef.current.forEach(polyline => {
        if (polyline) {
          polyline.setMap(null);
        }
      });
      polylinesRef.current = [];
    };
  }, [
    VITE_NAVER_MAP_CLIENT_ID,
    drawerOpen,
    drawerWidth,
    interactive,
    lat,
    lng,
    markerPosition,
    markers,
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

  // markers prop 변경 시 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver || !isMapInitialized) return;

    // 기존 마커들 제거
    markersRef.current.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // 새로운 마커들 생성
    if (markers.length > 0) {
      markersRef.current = markers.map((marker) => {
        const color = marker.color || '#1976d2'; // 기본 색상
        const naverMarker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(marker.lat, marker.lng),
          map: mapInstanceRef.current,
          icon: {
            content: `
              <div style="
                width: 24px;
                height: 24px;
                background-color: ${color};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 11px;
                font-weight: bold;
                cursor: pointer;
              ">
                ${marker.label || ''}
              </div>
            `,
            anchor: new window.naver.maps.Point(12, 12)
          },
          title: marker.title || ''
        });

        // 마커 클릭 이벤트 추가
        if (onMarkerClick) {
          window.naver.maps.Event.addListener(naverMarker, 'click', () => {
            onMarkerClick({
              lat: marker.lat,
              lng: marker.lng,
              title: marker.title
            });
          });
        }

        return naverMarker;
      });
    }
  }, [markers, isMapInitialized]);

  // polylines prop 변경 시 polyline 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver || !isMapInitialized) return;

    // 기존 polyline들 제거
    polylinesRef.current.forEach(polyline => {
      if (polyline) {
        polyline.setMap(null);
      }
    });
    polylinesRef.current = [];

    // 새로운 polyline들 생성
    if (polylines.length > 0) {
      polylinesRef.current = polylines.map((polylineData) => {
        const path = polylineData.path.map(point => 
          new window.naver.maps.LatLng(point.lat, point.lng)
        );

        const naverPolyline = new window.naver.maps.Polyline({
          path: path,
          map: mapInstanceRef.current,
          strokeColor: polylineData.color || '#1976d2',
          strokeWeight: polylineData.weight || 3,
          strokeOpacity: polylineData.opacity || 0.8,
          strokeStyle: 'solid'
        });

        return naverPolyline;
      });
    }
  }, [polylines, isMapInitialized]);

  // 클라이언트 ID가 설정되지 않은 경우 로딩 스켈레톤 표시
  if (!VITE_NAVER_MAP_CLIENT_ID) {
    return (
      <Skeleton
        variant="rounded"
        animation="wave"
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
