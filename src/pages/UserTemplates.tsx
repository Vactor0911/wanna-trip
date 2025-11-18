import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import SquareTemplateCard from "../components/SquareTemplateCard";
import { useCallback, useEffect, useState } from "react";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import PopularTemplates, {
  PopularTemplateData,
} from "../components/PopularTemplates";
import { useAtomValue } from "jotai";
import { wannaTripLoginStateAtom } from "../state";
import { getRandomColor } from "../utils";

// 템플릿 타입 정의
interface Template {
  uuid: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const CARD_GAP = 24; // 카드 간격(px)

const UserTemplates = () => {
  const navigate = useNavigate();
  // 로그인 상태 확인
  const loginState = useAtomValue(wannaTripLoginStateAtom);

  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 다이얼로그 관련 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTemplateUuid, setDeleteTemplateUuid] = useState<string | null>(
    null
  );

  const [nameError, setNameError] = useState("");

  // 인기 템플릿 상태 추가
  const [popularTemplates, setPopularTemplates] = useState<
    PopularTemplateData[]
  >([]);
  const [isPopularLoading, setIsPopularLoading] = useState(true);
  const [popularError, setPopularError] = useState<string | null>(null);

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

  // 인기 템플릿 가져오기
  const fetchPopularTemplates = useCallback(async () => {
    try {
      setIsPopularLoading(true);
      setPopularError(null);

      // 인기 템플릿 목록 가져오기
      const response = await axiosInstance.get("/template/popular", {});

      if (response.data.success) {
        // API 응답 데이터를 PopularTemplateData 형식으로 변환
        const formattedTemplates = response.data.popularTemplates.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (template: any) => {
            // 템플릿 UUID 값을 정확히 가져오기
            const templateUuid = template.uuid || "";

            return {
              id: templateUuid,
              bgColor: templateUuid
                ? getRandomColor(templateUuid.toString().charCodeAt(0) || 0)
                : getRandomColor(Math.floor(Math.random() * 100)), // ID가 없으면 랜덤 색상
              title: template.title,
              username: template.ownerName,
              shared_count: template.sharedCount,
            };
          }
        );

        setPopularTemplates(formattedTemplates);
      } else {
        setPopularError("인기 템플릿을 불러오는 데 실패했습니다.");
      }
    } catch (err) {
      console.error("인기 템플릿 불러오기 오류:", err);
      setPopularError("인기 템플릿을 불러오는 데 문제가 발생했습니다.");
    } finally {
      setIsPopularLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 사용자의 템플릿 목록 가져오기
  useEffect(() => {
    fetchTemplates();
    fetchPopularTemplates(); // 인기 템플릿도 함께 가져오기
  }, [fetchPopularTemplates, fetchTemplates]);

  // 다이얼로그 열기
  const handleOpenDialog = useCallback(() => {
    setNewTemplateName("");
    setNameError("");
    setIsDialogOpen(true);
  }, []);

  // 다이얼로그 닫기
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  // 새 템플릿 생성
  const handleCreateTemplate = useCallback(async () => {
    // 유효성 검사
    if (!newTemplateName.trim()) {
      setNameError("템플릿 이름을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      const csrfToken = await getCsrfToken();

      // 사용자가 입력한 이름으로 템플릿 생성
      const response = await axiosInstance.post(
        "/template",
        { title: newTemplateName.trim() },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        // 다이얼로그 닫기
        handleCloseDialog();

        // 목록 새로고침
        fetchTemplates();
      } else {
        setError("템플릿 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("새 템플릿 생성 오류:", err);
      setError("템플릿 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchTemplates, handleCloseDialog, newTemplateName]);

  // 템플릿 클릭 시 해당 UUID로 이동
  const handleTemplateClick = useCallback(
    (templateUuid: string) => {
      navigate(`/template/${templateUuid}`);
    },
    [navigate]
  );

  // 인기 템플릿 클릭 핸들러 추가
  const handlePopularTemplateClick = useCallback(
    (templateId: string) => {
      navigate(`/template/${templateId}`);
    },
    [navigate]
  );

  // 삭제 버튼 클릭 시 확인 대화상자 표시
  const handleDeleteButtonClick = useCallback((templateUuid: string) => {
    setDeleteTemplateUuid(templateUuid);
    setIsDeleteDialogOpen(true);
  }, []);

  // 삭제 대화상자 닫기
  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeleteTemplateUuid(null);
  }, []);

  // 템플릿 삭제
  const handleDeleteTemplate = useCallback(async () => {
    if (deleteTemplateUuid === null) return;

    try {
      const csrfToken = await getCsrfToken();

      // 템플릿 삭제 API 호출
      const response = await axiosInstance.delete(
        `/template/${deleteTemplateUuid}`,
        {
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      if (response.data.success) {
        // 삭제 성공 시 목록 새로고침
        fetchTemplates();
      } else {
        setError("템플릿 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("템플릿 삭제 오류:", err);
      setError("템플릿 삭제 중 오류가 발생했습니다.");
    } finally {
      // 대화상자 닫기
      setIsDeleteDialogOpen(false);
      setDeleteTemplateUuid(null);
    }
  }, [deleteTemplateUuid, fetchTemplates]);

  return (
    <Container maxWidth="xl">
      <Stack mt={4} gap={8}>
        {/* 인기 템플릿 */}
        <Stack gap={4}>
          <Typography variant="h5">인기 템플릿</Typography>
          {isPopularLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : popularError ? (
            <Typography color="error" py={2}>
              {popularError}
            </Typography>
          ) : (
            <PopularTemplates
              maxCards={3}
              type="template"
              data={popularTemplates}
              onCardClick={handlePopularTemplateClick}
            />
          )}
        </Stack>

        {/* 내 템플릿 */}
        <Stack gap={4}>
          <Typography variant="h5">내 템플릿</Typography>

          {!loginState.isLoggedIn ? (
            // 로그인되지 않은 경우 메시지 표시
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                px: 2,
                borderRadius: 2,
                bgcolor: "rgba(48, 48, 48, 0.03)",
                textAlign: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary" mb={3}>
                템플릿을 만들고 관리하려면 로그인이 필요합니다.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/login")}
              >
                로그인하러 가기
              </Button>
            </Box>
          ) : isLoading ? (
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
              {/* 새 템플릿 */}
              <SquareTemplateCard type="new" onClick={handleOpenDialog} />

              {/* 내 템플릿 목록들 (API에서 가져온 실제 데이터) */}
              {myTemplates.map((template, index) => (
                <SquareTemplateCard
                  key={`template-${index}`}
                  title={template.title}
                  color={getRandomColor(template.uuid)}
                  onClick={() => handleTemplateClick(template.uuid)}
                  onDelete={() => handleDeleteButtonClick(template.uuid)}
                />
              ))}
            </Box>
          )}
        </Stack>

        {/* 템플릿 이름 입력 다이얼로그 */}
        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>새 템플릿 만들기</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              title="템플릿 이름"
              type="text"
              fullWidth
              variant="outlined"
              value={newTemplateName}
              onChange={(e) => {
                setNewTemplateName(e.target.value);
                setNameError("");
              }}
              error={!!nameError}
              helperText={nameError}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              취소
            </Button>
            <Button
              onClick={handleCreateTemplate}
              color="primary"
              variant="contained"
            >
              생성
            </Button>
          </DialogActions>
        </Dialog>

        {/* 템플릿 삭제 확인 대화상자 */}
        <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
          <DialogTitle>템플릿 삭제</DialogTitle>
          <DialogContent>
            <Typography>정말로 이 템플릿을 삭제하시겠습니까?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              삭제한 템플릿은 복구할 수 없습니다.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="inherit">
              취소
            </Button>
            <Button
              onClick={handleDeleteTemplate}
              color="error"
              variant="contained"
            >
              삭제
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
};

export default UserTemplates;
