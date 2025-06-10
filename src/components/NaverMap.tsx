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
}

const DEFAULT_LAT = 37.5665; // 서울 시청 위도
const DEFAULT_LNG = 126.978; // 서울 시청 경도

const NaverMap = (props: MapProps) => {
  const {
    width = 200,
    height,
    lat = DEFAULT_LAT,
    lng = DEFAULT_LNG,
    zoom = 13,
    sx,
  } = props;

  const mapRef = useRef<HTMLDivElement | null>(null); // 지도 컨테이너를 참조하기 위한 ref
  const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

  useEffect(() => {
    // 네이버 클라이언트 ID가 설정되지 않은 경우 초기화 중단
    if (!NAVER_CLIENT_ID) {
      return;
    }

    // 네이버 지도 스크립트가 로드되지 않았을 경우 동적으로 추가
    if (!window.naver) {
      const script = document.createElement("script");
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`;
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

      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(lat, lng),
        zoom,
      });

      // 마커 예시 (필요시)
      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map,
      });
    }
  }, [NAVER_CLIENT_ID, lat, lng, zoom]);

  // 클라이언트 ID가 설정되지 않은 경우 로딩 스켈레톤 표시
  if (!NAVER_CLIENT_ID) {
    return (
      <Skeleton
        variant="rounded"
        sx={{ width, height, borderRadius: 2, ...sx }}
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
        ...sx,
      }}
    />
  );
};

export default NaverMap;
