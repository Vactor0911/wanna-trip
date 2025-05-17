import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import SquareTemplateCard from "../components/SquareTemplateCard";
import { useCallback, useEffect, useState } from "react";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";


// 템플릿 타입 정의
interface Template {
  template_id: number;
  template_uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const CARD_GAP = 24; // 카드 간격(px)

const UserTemplates = () => {
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

export default UserTemplates;
