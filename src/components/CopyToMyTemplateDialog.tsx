import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
  Typography,
  Button,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import SquareTemplateCard from "./SquareTemplateCard";
import { useCallback, useEffect, useState } from "react";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { getRandomColor } from "../utils";
import {
  useCopyTemplateToMine,
  useCopyBoardToTemplate,
  useCopyCardToBoard,
} from "../hooks/template";
import OutlinedTextField from "./OutlinedTextField";

interface CopyToMyTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // 복사할 대상의 종류와 UUID
  copyType: "template" | "board" | "card";
  sourceUuid: string;
  sourceTitle?: string;
}

// 최대 보드(일차) 수 상수
const MAX_BOARD_COUNT = 15;

// 템플릿 타입 정의
interface Template {
  uuid: string;
  title: string;
  created_at: string;
  updated_at: string;
  sharedCount: number;
  thumbnailUrl?: string;
  boardCount?: number;
  boards?: Board[];
}

interface Board {
  uuid: string;
  dayNumber: number;
}

const CopyToMyTemplateDialog = (props: CopyToMyTemplateDialogProps) => {
  const { open, onClose, onSuccess, copyType, sourceUuid, sourceTitle } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplateUuid, setSelectedTemplateUuid] = useState<
    string | null
  >(null);
  const [newTitle, setNewTitle] = useState("");
  const [step, setStep] = useState<"selectTemplate" | "selectBoard">(
    "selectTemplate"
  );
  const [isCopying, setIsCopying] = useState(false);

  // 복사 hooks
  const copyTemplateMutation = useCopyTemplateToMine();
  const copyBoardMutation = useCopyBoardToTemplate();
  const copyCardMutation = useCopyCardToBoard();

  // 기존 템플릿 데이터 가져오기
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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

  // 선택한 템플릿의 보드 목록 가져오기
  const fetchTemplateBoards = useCallback(async (templateUuid: string) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axiosInstance.get(`/template/${templateUuid}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        return response.data.template.boards || [];
      }
      return [];
    } catch (err) {
      console.error("보드 목록 불러오기 오류:", err);
      return [];
    }
  }, []);

  // 보드 복사
  const handleCopyBoard = useCallback(
    async (targetTemplateUuid: string) => {
      try {
        setIsCopying(true);
        await copyBoardMutation.mutateAsync({
          sourceBoardUuid: sourceUuid,
          targetTemplateUuid,
        });
        onSuccess?.();
        onClose();
      } catch (err) {
        console.error("보드 복사 오류:", err);
        setError("보드 복사에 실패했습니다.");
      } finally {
        setIsCopying(false);
      }
    },
    [copyBoardMutation, sourceUuid, onSuccess, onClose]
  );

  // 카드 복사
  const handleCopyCard = useCallback(
    async (targetBoardUuid: string) => {
      try {
        setIsCopying(true);
        await copyCardMutation.mutateAsync({
          sourceCardUuid: sourceUuid,
          targetBoardUuid,
        });
        onSuccess?.();
        onClose();
      } catch (err) {
        console.error("카드 복사 오류:", err);
        setError("카드 복사에 실패했습니다.");
      } finally {
        setIsCopying(false);
      }
    },
    [copyCardMutation, sourceUuid, onSuccess, onClose]
  );

  // 컴포넌트 마운트 시 사용자의 템플릿 목록 가져오기
  useEffect(() => {
    if (open) {
      fetchTemplates();
      setStep("selectTemplate");
      setSelectedTemplateUuid(null);
      setNewTitle(sourceTitle ? `${sourceTitle} (복사본)` : "");
    }
  }, [open, fetchTemplates, sourceTitle]);

  // 템플릿 선택 (보드/카드 복사용)
  const handleTemplateSelect = useCallback(
    async (templateUuid: string, boardCount?: number) => {
      if (copyType === "board") {
        // 15일차 제한 체크
        if (boardCount !== undefined && boardCount >= MAX_BOARD_COUNT) {
          setError(
            `해당 템플릿은 최대 ${MAX_BOARD_COUNT}일차까지 등록할 수 있습니다. 기존 일정을 정리한 후 다시 시도해주세요.`
          );
          return;
        }
        // 보드를 템플릿으로 복사
        setSelectedTemplateUuid(templateUuid);
        handleCopyBoard(templateUuid);
      } else if (copyType === "card") {
        // 카드는 보드를 선택해야 함
        setSelectedTemplateUuid(templateUuid);
        const boards = await fetchTemplateBoards(templateUuid);
        if (boards.length > 0) {
          setMyTemplates((prev) =>
            prev.map((t) => (t.uuid === templateUuid ? { ...t, boards } : t))
          );
          setStep("selectBoard");
        } else {
          setError("선택한 템플릿에 보드가 없습니다.");
        }
      }
    },
    [copyType, fetchTemplateBoards, handleCopyBoard]
  );

  // 보드 선택 (카드 복사용)
  const handleBoardSelect = useCallback(
    (boardUuid: string) => {
      handleCopyCard(boardUuid);
    },
    [handleCopyCard]
  );

  // 템플릿 전체 복사
  const handleCopyTemplate = async () => {
    try {
      setIsCopying(true);
      await copyTemplateMutation.mutateAsync({
        sourceTemplateUuid: sourceUuid,
        title: newTitle || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("템플릿 복사 오류:", err);
      setError("템플릿 복사에 실패했습니다.");
    } finally {
      setIsCopying(false);
    }
  };

  const getDialogTitle = () => {
    switch (copyType) {
      case "template":
        return "여행 일정 복사하기";
      case "board":
        return "일차 복사하기";
      case "card":
        return step === "selectBoard"
          ? "복사할 일차 선택"
          : "복사할 템플릿 선택";
    }
  };

  const selectedTemplate = myTemplates.find(
    (t) => t.uuid === selectedTemplateUuid
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* 헤더 */}
      <DialogTitle
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <ContentCopyRoundedIcon color="primary" />
          {getDialogTitle()}
        </Stack>
        <IconButton onClick={onClose} disabled={isCopying}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center" py={2}>
            {error}
          </Typography>
        ) : copyType === "template" ? (
          // 템플릿 전체 복사: 새 제목 입력 후 복사
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              이 여행 일정을 내 템플릿으로 복사합니다.
            </Typography>
            <OutlinedTextField
              label="새 템플릿 제목"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              fullWidth
              placeholder={sourceTitle || "새 템플릿"}
            />
            <Button
              variant="contained"
              onClick={handleCopyTemplate}
              disabled={isCopying}
              startIcon={
                isCopying ? (
                  <CircularProgress size={20} />
                ) : (
                  <ContentCopyRoundedIcon />
                )
              }
              fullWidth
            >
              {isCopying ? "복사 중..." : "내 템플릿으로 복사"}
            </Button>
          </Stack>
        ) : step === "selectTemplate" ? (
          // 보드/카드 복사: 먼저 템플릿 선택
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {copyType === "board"
                ? "이 일차를 복사할 템플릿을 선택하세요."
                : "이 장소를 복사할 템플릿을 선택하세요."}
            </Typography>
            <Divider />
            {myTemplates.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={2}>
                복사할 수 있는 템플릿이 없습니다.
              </Typography>
            ) : (
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={2}
                justifyContent="center"
              >
                {myTemplates.map((template) => {
                  const isMaxBoards =
                    copyType === "board" &&
                    template.boardCount !== undefined &&
                    template.boardCount >= MAX_BOARD_COUNT;
                  return (
                    <Box
                      key={`template-${template.uuid}`}
                      sx={{
                        position: "relative",
                        opacity: isMaxBoards ? 0.5 : 1,
                      }}
                    >
                      <SquareTemplateCard
                        title={
                          isMaxBoards
                            ? `${template.title} (${MAX_BOARD_COUNT}일차)`
                            : template.title
                        }
                        color={getRandomColor(template.uuid)}
                        thumbnailUrl={template.thumbnailUrl}
                        onClick={
                          isMaxBoards
                            ? () =>
                                setError(
                                  `해당 템플릿은 최대 ${MAX_BOARD_COUNT}일차까지 등록할 수 있습니다. 기존 일정을 정리한 후 다시 시도해주세요.`
                                )
                            : () =>
                                handleTemplateSelect(
                                  template.uuid,
                                  template.boardCount
                                )
                        }
                        cardSize={isMobile ? 100 : 120}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Stack>
        ) : (
          // 카드 복사: 보드 선택
          <Stack spacing={2}>
            <Button
              variant="text"
              onClick={() => setStep("selectTemplate")}
              sx={{ alignSelf: "flex-start" }}
            >
              ← 템플릿 다시 선택
            </Button>
            <Typography variant="body2" color="text.secondary">
              "{selectedTemplate?.title}" 템플릿에서 복사할 일차를 선택하세요.
            </Typography>
            <Divider />
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {selectedTemplate?.boards?.map((board) => (
                <Button
                  key={`board-${board.uuid}`}
                  variant="outlined"
                  onClick={() => handleBoardSelect(board.uuid)}
                  disabled={isCopying}
                  sx={{ minWidth: 80 }}
                >
                  {board.dayNumber}일차
                </Button>
              ))}
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CopyToMyTemplateDialog;
