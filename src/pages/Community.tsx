import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import SquareTemplateCard from "../components/SquareTemplateCard";
import { useCallback, useEffect, useState } from "react";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";

const popularTemplates = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    label: "국내여행 혜택",
    title: "최대 19만원 혜택 받고 봄 여행 떠날 준비 완료",
    subtitle: "호텔&펜션 최대 81% 특가까지",
    bgColor: "#FFB6C1",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    label: "해외여행 혜택",
    title: "황금연휴 해외여행 최대 30만원 할인 받기",
    subtitle: "매일 받는 항공 & 숙소 더블 혜택",
    bgColor: "#B3C6FF",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80",
    label: "국내여행 혜택",
    title: "최대 19만원 혜택 받고 봄 여행 떠날 준비 완료",
    subtitle: "호텔&펜션 최대 81% 특가까지",
    bgColor: "#FFB6C1",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80",
    label: "해외여행 혜택",
    title: "황금연휴 해외여행 최대 30만원 할인 받기",
    subtitle: "매일 받는 항공 & 숙소 더블 혜택",
    bgColor: "#B3C6FF",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=600&q=80",
    label: "국내여행 혜택",
    title: "최대 19만원 혜택 받고 봄 여행 떠날 준비 완료",
    subtitle: "호텔&펜션 최대 81% 특가까지",
    bgColor: "#FFB6C1",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    label: "해외여행 혜택",
    title: "황금연휴 해외여행 최대 30만원 할인 받기",
    subtitle: "매일 받는 항공 & 숙소 더블 혜택",
    bgColor: "#B3C6FF",
  },
];

// 템플릿 타입 정의
interface Template {
  template_id: number;
  template_uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const CARD_GAP = 24; // 카드 간격(px)

const Community = () => {
  const navigate = useNavigate();
  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);

      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 템플릿 목록 가져오기
      const response = await axiosInstance.get("/template", {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        setMyTemplates(response.data.templates);
      } else {
        setError("템플릿 목록을 불러오는 데 실패했습니다.");
      }
    } catch (err) {
      console.error("템플릿 목록 불러오기 오류:", err);
      setError("템플릿 목록을 불러오는 데 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 사용자의 템플릿 목록 가져오기
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // 템플릿 클릭 시 해당 UUID로 이동
  const handleTemplateClick = useCallback(
    (templateUuid: string) => {
      navigate(`/template/${templateUuid}`);
    },
    [navigate]
  );

  // 템플릿 ID에 따라 색상 생성 함수
  const getRandomColor = useCallback((id: number): string => {
    const colors = [
      "#A7C7FF",
      "#FFF6A3",
      "#FFB6E1",
      "#FFB6B6",
      "#FFD59E",
      "#D6FFB7",
      "#B6FFE4",
      "#B6D9FF",
      "#D9B6FF",
    ];

    // ID를 색상 인덱스로 변환 (반복되도 괜찮음)
    return colors[id % colors.length];
  }, []);

  return (
    <Stack mt={4} gap={8}>
      {/* 인기 템플릿 */}
      <Stack gap={4}>
        <Typography variant="h5">인기 템플릿</Typography>
      </Stack>

      {/* 내 템플릿 */}
      <Stack gap={4}>
        <Typography variant="h5">내 템플릿</Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" py={2}>
            {error}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: `${CARD_GAP}px`,
              mb: 6,
            }}
          >
            {/* 새 템플릿 카드 */}
            <SquareTemplateCard
              type="new"
              onClick={() => navigate(`/template/new`)}
            />

            {/* 내 템플릿 카드들 (API에서 가져온 실제 데이터) */}
            {myTemplates.map((template) => (
              <SquareTemplateCard
                key={`template-${template.template_id}`}
                title={template.name}
                color={getRandomColor(template.template_id)} // 색상은 ID 기반으로 랜덤 생성
                onClick={() => handleTemplateClick(template.template_uuid)}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default Community;
