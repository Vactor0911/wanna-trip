import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SquareTemplateCard from "./SquareTemplateCard";
import { useCallback, useEffect, useState } from "react";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { getRandomColor } from "../utils";

interface TemplateSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (templateUuid: string | null) => void;
}

// 템플릿 타입 정의
interface Template {
  uuid: string;
  title: string;
  created_at: string;
  updated_at: string;
  sharedCount: number;
  thumbnailUrl?: string; // 썸네일 URL
}

const TemplateSelectDialog = (props: TemplateSelectDialogProps) => {
  const { open, onClose, onSelect } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // 기존 템플릿 데이터 가져오기
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

  // 템플릿 선택
  const handleTemplateClick = useCallback(
    (templateUuid: string) => {
      if (onSelect) {
        onSelect(templateUuid);
      }
      onClose();
    },
    [onClose, onSelect]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      {/* 헤더 */}
      <DialogTitle
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        템플릿 선택
        {/* 닫기 버튼 */}
        <IconButton>
          <CloseRoundedIcon onClick={onClose} />
        </IconButton>
      </DialogTitle>

      {/* 사용자 템플릿 목록 */}
      <DialogContent dividers>
        <Stack
          direction="row"
          justifyContent="space-between"
          gap={2}
          flexWrap="wrap"
        >
          {myTemplates.map((template) => (
            <SquareTemplateCard
              key={`template-${template.uuid}`}
              title={template.title}
              color={getRandomColor(template.uuid)}
              thumbnailUrl={template.thumbnailUrl}
              onClick={() => handleTemplateClick(template.uuid)}
              cardSize={isMobile ? 110 : 150}
            />
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectDialog;
