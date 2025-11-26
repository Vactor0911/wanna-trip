import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  keyframes,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { useNavigate } from "react-router-dom";

// 펄스 애니메이션 정의
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

import SquareTemplateCard from "../components/SquareTemplateCard";
import TravelPlanChatbot from "../components/TravelPlanChatbot";
import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import PopularTemplates, {
  PopularTemplateData,
} from "../components/PopularTemplates";
import { useAtomValue } from "jotai";
import { wannaTripLoginStateAtom } from "../state";
import { getRandomColor } from "../utils";

// 템플릿 생성 방식
enum TemplateCreationType {
  EMPTY = "empty",
  AI_GENERATED = "ai",
}

// 정렬 방식
type SortType = "latest" | "name";

// 템플릿 타입 정의
interface Template {
  uuid: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string;
}

const CARD_GAP = 24; // 카드 간격(px)

const UserTemplates = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  // 로그인 상태 확인
  const loginState = useAtomValue(wannaTripLoginStateAtom);

  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 정렬 상태
  const [sortType, setSortType] = useState<SortType>("latest");

  // 다이얼로그 관련 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creationType, setCreationType] = useState<TemplateCreationType>(
    TemplateCreationType.EMPTY
  );
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
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
              userProfileImage: template.ownerProfileImage,
              shared_count: template.sharedCount,
              thumbnailUrl: template.thumbnailUrl,
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
    setCreationType(TemplateCreationType.EMPTY);
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

    // AI 생성 선택 시 챗봇 다이얼로그로 전환
    if (creationType === TemplateCreationType.AI_GENERATED) {
      handleCloseDialog();
      setIsChatbotOpen(true);
      return;
    }

    // 빈 템플릿 생성
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
  }, [creationType, fetchTemplates, handleCloseDialog, newTemplateName]);

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

  // AI 챗봇 완료 핸들러
  const handleChatbotComplete = useCallback(
    (templateUuid: string) => {
      setIsChatbotOpen(false);
      setNewTemplateName("");
      // 생성된 템플릿 페이지로 이동
      navigate(`/template/${templateUuid}`);
    },
    [navigate]
  );

  // 챗봇 닫기 핸들러
  const handleCloseChatbot = useCallback(() => {
    setIsChatbotOpen(false);
    setNewTemplateName("");
  }, []);

  // 정렬 변경 핸들러
  const handleSortChange = useCallback((event: SelectChangeEvent) => {
    setSortType(event.target.value as SortType);
  }, []);

  // 정렬된 템플릿 목록
  const sortedTemplates = useMemo(() => {
    const sorted = [...myTemplates];
    switch (sortType) {
      case "latest":
        return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case "name":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [myTemplates, sortType]);

  // 날짜 포맷 함수
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
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
          <Box
            sx={{
              background: `linear-gradient(135deg, ${alpha("#ff6b6b", 0.15)} 0%, ${alpha("#ff8e53", 0.08)} 50%, ${alpha("#ffc107", 0.05)} 100%)`,
              borderRadius: 4,
              p: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 배경 장식 */}
            <AutoAwesomeIcon
              sx={{
                position: "absolute",
                right: -10,
                top: -10,
                fontSize: 120,
                color: alpha("#ff6b6b", 0.1),
                transform: "rotate(15deg)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                right: 80,
                bottom: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${alpha("#ff8e53", 0.15)} 0%, ${alpha("#ffc107", 0.1)} 100%)`,
              }}
            />
            
            <Stack direction="row" alignItems="center" gap={1.5} position="relative" zIndex={1}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
                  boxShadow: `0 4px 14px ${alpha("#ff6b6b", 0.4)}`,
                }}
              >
                <WhatshotIcon 
                  sx={{ 
                    color: "white", 
                    fontSize: 28,
                    animation: `${pulse} 1.5s ease-in-out infinite`,
                  }} 
                />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="h5" fontWeight={700}>🔥 인기 템플릿</Typography>
                  <Chip 
                    label="HOT" 
                    size="small" 
                    sx={{ 
                      background: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
                      color: "white", 
                      fontWeight: 700,
                      fontSize: 11,
                      height: 24,
                      "& .MuiChip-label": {
                        px: 1.5,
                      },
                    }} 
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" mt={0.3}>
                  다른 사용자들이 많이 퍼간 인기 템플릿을 확인해보세요
                </Typography>
              </Box>
            </Stack>
          </Box>
          {isPopularLoading ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center"
              py={6}
              sx={{
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha("#ff6b6b", 0.03)} 0%, ${alpha("#ff8e53", 0.01)} 100%)`,
              }}
            >
              <CircularProgress sx={{ color: "#ff6b6b" }} />
            </Box>
          ) : popularError ? (
            <Box
              sx={{
                py: 4,
                px: 3,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha("#ef4444", 0.08)} 0%, ${alpha("#f87171", 0.04)} 100%)`,
                textAlign: "center",
              }}
            >
              <Typography color="error" fontWeight={500}>
                {popularError}
              </Typography>
            </Box>
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
          <Box
            sx={{
              background: `linear-gradient(135deg, ${alpha("#1976d2", 0.15)} 0%, ${alpha("#2196f3", 0.08)} 50%, ${alpha("#42a5f5", 0.05)} 100%)`,
              borderRadius: 4,
              p: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 배경 장식 */}
            <TravelExploreIcon
              sx={{
                position: "absolute",
                right: -10,
                top: -10,
                fontSize: 120,
                color: alpha("#1976d2", 0.1),
                transform: "rotate(15deg)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                right: 80,
                bottom: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${alpha("#2196f3", 0.15)} 0%, ${alpha("#42a5f5", 0.1)} 100%)`,
              }}
            />
            
            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              alignItems={{ xs: "flex-start", sm: "center" }} 
              justifyContent="space-between" 
              gap={2}
              position="relative" 
              zIndex={1}
            >
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                    boxShadow: `0 4px 14px ${alpha("#1976d2", 0.4)}`,
                  }}
                >
                  <FolderSpecialIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h5" fontWeight={700}>📁 내 템플릿</Typography>
                    {loginState.isLoggedIn && !isLoading && !error && (
                      <Chip
                        label={`${myTemplates.length}개`}
                        size="small"
                        sx={{
                          background: `linear-gradient(135deg, ${alpha("#1976d2", 0.2)} 0%, ${alpha("#2196f3", 0.15)} 100%)`,
                          color: "#1976d2",
                          fontWeight: 700,
                          fontSize: 12,
                          height: 24,
                          border: `1px solid ${alpha("#1976d2", 0.3)}`,
                        }}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mt={0.3}>
                    나만의 여행 계획을 만들고 관리해보세요
                  </Typography>
                </Box>
              </Stack>
              
              {loginState.isLoggedIn && !isLoading && !error && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>정렬</Typography>
                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <Select
                      value={sortType}
                      onChange={handleSortChange}
                      variant="outlined"
                      sx={{ 
                        fontSize: 14, 
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha("#1976d2", 0.3),
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha("#1976d2", 0.5),
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      }}
                    >
                      <MenuItem value="latest">최신순</MenuItem>
                      <MenuItem value="name">제목순</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Stack>
          </Box>

          {!loginState.isLoggedIn ? (
            // 로그인되지 않은 경우 메시지 표시
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                px: 3,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha("#1976d2", 0.05)} 0%, ${alpha("#2196f3", 0.02)} 100%)`,
                border: `2px dashed ${alpha("#1976d2", 0.25)}`,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* 배경 장식 */}
              <Box
                sx={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${alpha("#1976d2", 0.1)} 0%, ${alpha("#2196f3", 0.05)} 100%)`,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -20,
                  left: -20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${alpha("#2196f3", 0.08)} 0%, ${alpha("#42a5f5", 0.05)} 100%)`,
                }}
              />
              
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${alpha("#1976d2", 0.15)} 0%, ${alpha("#2196f3", 0.1)} 100%)`,
                  mb: 2,
                }}
              >
                <FolderSpecialIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: alpha("#1976d2", 0.6),
                  }} 
                />
              </Box>
              <Typography variant="h6" color="text.secondary" mb={1} fontWeight={600}>
                템플릿을 만들고 관리하려면 로그인이 필요합니다
              </Typography>
              <Typography variant="body2" color="text.disabled" mb={3}>
                로그인하고 나만의 여행 계획을 시작해보세요!
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                  boxShadow: `0 4px 14px ${alpha("#1976d2", 0.4)}`,
                  fontWeight: 600,
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                    boxShadow: `0 6px 20px ${alpha("#1976d2", 0.5)}`,
                  },
                }}
              >
                로그인하러 가기
              </Button>
            </Box>
          ) : isLoading ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center"
              py={6}
              sx={{
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha("#1976d2", 0.03)} 0%, ${alpha("#2196f3", 0.01)} 100%)`,
              }}
            >
              <CircularProgress sx={{ color: "#1976d2" }} />
            </Box>
          ) : error ? (
            <Box
              sx={{
                py: 4,
                px: 3,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha("#ef4444", 0.08)} 0%, ${alpha("#f87171", 0.04)} 100%)`,
                textAlign: "center",
              }}
            >
              <Typography color="error" fontWeight={500}>
                {error}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: { xs: "center", sm: "flex-start" },
                gap: `${CARD_GAP}px`,
                mb: 6,
              }}
            >
              {/* 새 템플릿 */}
              <SquareTemplateCard type="new" onClick={handleOpenDialog} />

              {/* 내 템플릿 목록들 (API에서 가져온 실제 데이터) */}
              {sortedTemplates.map((template, index) => (
                <SquareTemplateCard
                  key={`template-${index}`}
                  title={template.title}
                  color={getRandomColor(template.uuid)}
                  thumbnailUrl={template.thumbnailUrl}
                  date={formatDate(template.updatedAt)}
                  onClick={() => handleTemplateClick(template.uuid)}
                  onDelete={() => handleDeleteButtonClick(template.uuid)}
                />
              ))}
            </Box>
          )}
        </Stack>

        {/* 템플릿 이름 입력 다이얼로그 */}
        <Dialog 
          open={isDialogOpen} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: "hidden",
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha("#1976d2", 0.1)} 0%, ${alpha("#2196f3", 0.05)} 100%)`,
              fontWeight: 700,
              pb: 2,
            }}
          >
            ✨ 새 템플릿 만들기
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {/* 생성 방식 선택 */}
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 2, fontWeight: 600 }}>
              생성 방식을 선택하세요
            </Typography>
            <RadioGroup
              value={creationType}
              onChange={(e) => setCreationType(e.target.value as TemplateCreationType)}
            >
              <FormControlLabel
                value={TemplateCreationType.EMPTY}
                control={<Radio sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }} />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      📝 빈 템플릿 생성
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      직접 일정을 작성하고 싶을 때
                    </Typography>
                  </Box>
                }
                sx={{ 
                  mb: 2,
                  p: 1.5,
                  borderRadius: 2,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: alpha("#1976d2", 0.05),
                  },
                }}
              />
              <FormControlLabel
                value={TemplateCreationType.AI_GENERATED}
                control={<Radio sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }} />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      🤖 AI로 생성
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI와 대화하며 맞춤형 여행 계획 만들기
                    </Typography>
                  </Box>
                }
                sx={{ 
                  p: 1.5,
                  borderRadius: 2,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: alpha("#1976d2", 0.05),
                  },
                }}
              />
            </RadioGroup>

            {/* 템플릿 이름 입력 */}
            <TextField
              autoFocus
              margin="dense"
              label="템플릿 이름"
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
              sx={{ 
                mt: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#1976d2",
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button 
              onClick={handleCloseDialog} 
              color="inherit"
              sx={{ 
                borderRadius: 2,
                px: 3,
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleCreateTemplate}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                },
              }}
            >
              {creationType === TemplateCreationType.AI_GENERATED ? "다음" : "생성"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 템플릿 삭제 확인 대화상자 */}
        <Dialog 
          open={isDeleteDialogOpen} 
          onClose={handleCloseDeleteDialog}
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: "hidden",
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha("#ef4444", 0.1)} 0%, ${alpha("#f87171", 0.05)} 100%)`,
              fontWeight: 700,
            }}
          >
            ⚠️ 템플릿 삭제
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography fontWeight={500}>정말로 이 템플릿을 삭제하시겠습니까?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              삭제한 템플릿은 복구할 수 없습니다.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button 
              onClick={handleCloseDeleteDialog} 
              color="inherit"
              sx={{ borderRadius: 2, px: 3 }}
            >
              취소
            </Button>
            <Button
              onClick={handleDeleteTemplate}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                },
              }}
            >
              삭제
            </Button>
          </DialogActions>
        </Dialog>

        {/* AI 챗봇 다이얼로그 */}
        <TravelPlanChatbot
          open={isChatbotOpen}
          templateName={newTemplateName}
          onClose={handleCloseChatbot}
          onComplete={handleChatbotComplete}
        />
      </Stack>
    </Container>
  );
};

export default UserTemplates;
