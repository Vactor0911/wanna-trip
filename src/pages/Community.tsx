import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Paper,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from "react-router-dom";
import { theme } from "../utils/theme";

import SquareTemplateCard from "../components/SquareTemplateCard";
import PopularTemplateCard from "../components/PopularTemplateCard";
import PopularTemplateCarousel from "../components/PopularTemplateCarousel";


const popularTemplates = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    label: "국내여행 혜택",
    title: "최대 19만원 혜택 받고 봄 여행 떠날 준비 완료",
    subtitle: "호텔&펜션 최대 81% 특가까지",
    bgColor: "#FFB6C1",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    label: "해외여행 혜택",
    title: "황금연휴 해외여행 최대 30만원 할인 받기",
    subtitle: "매일 받는 항공 & 숙소 더블 혜택",
    bgColor: "#B3C6FF",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80",
    label: "국내여행 혜택",
    title: "최대 19만원 혜택 받고 봄 여행 떠날 준비 완료",
    subtitle: "호텔&펜션 최대 81% 특가까지",
    bgColor: "#FFB6C1",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80",
    label: "해외여행 혜택",
    title: "황금연휴 해외여행 최대 30만원 할인 받기",
    subtitle: "매일 받는 항공 & 숙소 더블 혜택",
    bgColor: "#B3C6FF",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=600&q=80",
    label: "국내여행 혜택",
    title: "최대 19만원 혜택 받고 봄 여행 떠날 준비 완료",
    subtitle: "호텔&펜션 최대 81% 특가까지",
    bgColor: "#FFB6C1",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    label: "해외여행 혜택",
    title: "황금연휴 해외여행 최대 30만원 할인 받기",
    subtitle: "매일 받는 항공 & 숙소 더블 혜택",
    bgColor: "#B3C6FF",
  },
];

const myTemplates = [
  { id: 1, title: "대학교 친구 강남 3박4일ㄹㄹㄹㄹㄹㄹㄹㄹㄹ", color: "#A7C7FF" },
  { id: 2, title: "목원대 MT 1박2일", color: "#FFF6A3" },
  { id: 3, title: "일본 3박4일 데이트", color: "#FFB6E1" },
  { id: 4, title: "준영이네 집", color: "#FFB6B6" },
  { id: 5, title: "찬이네 집탐방", color: "#FFD59E" },
  { id: 6, title: "목원대 학교 투어", color: "#D6FFB7" },
];

const CARD_GAP = 24; // 카드 간격(px)

const Community = () => {
  const navigate = useNavigate();

  return (
    <Stack mt={4} gap={8}>
      {/* 인기 템플릿 */}
      <Stack gap={4}>
        <Typography variant="h5">
          인기 템플릿
        </Typography>
      </Stack>

      {/* 내 템플릿 */}
      <Stack gap={4}>
        <Typography variant="h5">
          내 템플릿
        </Typography>
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

          {/* 내 템플릿 카드들 */}
          {myTemplates.map((tpl) => (
            <SquareTemplateCard
              key={`template-${tpl.id}`}
              title={tpl.title}
              color={tpl.color}
              onClick={() => navigate(`/template/${tpl.id}`)}
            />
          ))}
        </Box>
      </Stack>
    </Stack>
  );
};

export default Community;
