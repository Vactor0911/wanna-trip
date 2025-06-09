import React from "react";
import { Box, Typography, Stack } from "@mui/material";

interface InformationsProps {
  subtitle: string; // 소제목(파란색)
  title: string;    // 제목(큰글씨)
  rightContent: React.ReactNode; // 오른쪽에 들어갈 내용
  image?: string; // 가운데에 배치할 이미지 (선택)
}

const Informations = ({ subtitle, title, rightContent, image }: InformationsProps) => {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems={{ md: "flex-start" }} sx={{ position: 'relative', minHeight: 220 }}>
      {/* 왼쪽: 소제목, 제목 */}
      <Box flex={1} minWidth={220} position="relative" display="flex" flexDirection="column" justifyContent="center">
        <Typography variant="subtitle2" sx={{ color: "primary.main", fontWeight: 600, mb: 1 }}>
          {subtitle}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, whiteSpace: "pre-line" }}>
          {title}
        </Typography>
        {/* 이미지가 있을 경우 중앙에 배치 */}
        {image && (
          <Box
            component="img"
            src={image}
            alt="info-img"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '70%',
              maxHeight: '70%',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
      {/* 오른쪽: prop으로 받은 내용, 오른쪽 하단에 고정 */}
      <Box flex={2} sx={{ position: 'relative', minHeight: 180 }}>
        <Box sx={{ position: 'absolute', right: 0, bottom: 0, textAlign: 'right', width: '100%' }}>
          {rightContent}
        </Box>
      </Box>
    </Stack>
  );
};

export default Informations;
