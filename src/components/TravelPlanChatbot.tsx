import {
  alpha,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FaceRoundedIcon from "@mui/icons-material/FaceRounded";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import axiosInstance, { getCsrfToken, SERVER_HOST } from "../utils/axiosInstance";
import { useSnackbar } from "notistack";

// 메시지 타입 정의
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface TravelPlanChatbotProps {
  open: boolean;
  templateName: string;
  onClose: () => void;
  onComplete: (templateUuid: string) => void;
}

// 상수 정의
const MAX_CONVERSATIONS = 15;

const TravelPlanChatbot = ({
  open,
  templateName,
  onClose,
  onComplete,
}: TravelPlanChatbotProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [isNearLimit, setIsNearLimit] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 프로필 이미지 가져오기
  const fetchUserProfile = useCallback(async () => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axiosInstance.get("/auth/me", {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success && response.data.data.profileImage) {
        const imageUrl = `${SERVER_HOST}${response.data.data.profileImage}?t=${new Date().getTime()}`;
        setProfileImage(imageUrl);
      }
    } catch (err) {
      console.error("프로필 정보 로드 실패:", err);
    }
  }, []);

  // 다이얼로그 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setMessages([]);
      setInputMessage("");
      setCanGenerate(false);
      setIsGenerating(false);
      setError(null);
      setConversationCount(0);
      setIsNearLimit(false);
      fetchUserProfile(); // 프로필 이미지 가져오기
    }
  }, [open, fetchUserProfile]);

  // 초기 메시지 설정
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `안녕하세요! "${templateName}" 여행 계획을 함께 만들어볼까요? 😊\n\n먼저 어디로 여행을 가고 싶으신가요?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [open, templateName, messages.length]);

  // 메시지 전송
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const csrfToken = await getCsrfToken();

      const response = await axiosInstance.post(
        "/chat/travel/chat",
        {
          message: inputMessage.trim(),
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          templateName,
        },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // 생성 가능 여부 확인
        if (response.data.canGenerate) {
          setCanGenerate(true);
        }

        // 대화 횟수 업데이트
        if (response.data.conversationCount) {
          setConversationCount(response.data.conversationCount);
        }
        if (response.data.isNearLimit) {
          setIsNearLimit(true);
        }
      } else if (response.data.limitReached) {
        // 대화 횟수 제한 도달
        setError(response.data.message);
        setCanGenerate(true); // 생성 버튼 활성화
      }
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      setError("서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.");
      
      const tempMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "죄송합니다. 서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tempMessage]);
    } finally {
      setIsLoading(false);
      // 입력 필드에 포커스
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputMessage, isLoading, messages, templateName]);

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 여행 계획 생성
  const handleGeneratePlan = useCallback(async () => {
    setIsGenerating(true);

    try {
      const csrfToken = await getCsrfToken();

      const response = await axiosInstance.post(
        "/chat/travel/generate",
        {
          templateName,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        onComplete(response.data.templateUuid);
      }
    } catch (error) {
      console.error("여행 계획 생성 오류:", error);
      setError("여행 계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
      enqueueSnackbar("여행 계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.", { variant: "error" });
    } finally {
      setIsGenerating(false);
    }
  }, [enqueueSnackbar, messages, onComplete, templateName]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
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
          background: `linear-gradient(135deg, ${alpha("#1976d2", 0.15)} 0%, ${alpha("#2196f3", 0.08)} 50%, ${alpha("#42a5f5", 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha("#1976d2", 0.1)}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 장식 */}
        <TravelExploreIcon
          sx={{
            position: "absolute",
            right: -20,
            top: -20,
            fontSize: 120,
            color: alpha("#1976d2", 0.08),
            transform: "rotate(15deg)",
          }}
        />
        <Stack direction="row" alignItems="center" gap={1.5} position="relative" zIndex={1}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
              boxShadow: `0 4px 14px ${alpha("#1976d2", 0.4)}`,
            }}
          >
            <SmartToyIcon sx={{ color: "white", fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>🤖 AI 여행 계획 만들기</Typography>
            <Typography variant="caption" color="text.secondary">
              AI와 대화하며 맞춤형 여행 계획을 만들어보세요
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ height: "60vh", display: "flex", flexDirection: "column", pt: 2, bgcolor: (theme) => theme.palette.mode === "dark" ? alpha("#1e293b", 0.5) : alpha("#f8fafc", 0.5) }}>
        {/* 에러 메시지 */}
        {error && (
          <Box 
            sx={{ 
              mb: 2, 
              p: 1.5, 
              bgcolor: alpha("#ef4444", 0.1), 
              borderRadius: 2,
              border: `1px solid ${alpha("#ef4444", 0.2)}`,
            }}
          >
            <Typography color="#dc2626" variant="body2" fontWeight={500}>
              ❌ {error}
            </Typography>
          </Box>
        )}

        {/* 대화 횟수 제한 경고 */}
        {isNearLimit && !error && (
          <Box 
            sx={{ 
              mb: 2, 
              p: 1.5, 
              bgcolor: alpha("#f59e0b", 0.1), 
              borderRadius: 2,
              border: `1px solid ${alpha("#f59e0b", 0.2)}`,
            }}
          >
            <Typography color="#d97706" variant="body2" fontWeight={500}>
              ⚠️ 대화 횟수가 {conversationCount}/{MAX_CONVERSATIONS}회입니다. 곧 제한에 도달합니다. 정보가 충분하다면 '여행 계획 생성' 버튼을 눌러주세요.
            </Typography>
          </Box>
        )}

        {/* 메시지 목록 */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            mb: 2,
            pr: 1,
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: alpha("#1976d2", 0.05),
              borderRadius: 3,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: alpha("#1976d2", 0.2),
              borderRadius: 3,
              "&:hover": {
                bgcolor: alpha("#1976d2", 0.3),
              },
            },
          }}
        >
          <Stack spacing={2}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxWidth: "75%",
                    borderRadius: 3,
                    ...(message.role === "user" 
                      ? {
                          background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                          color: "white",
                          boxShadow: `0 4px 14px ${alpha("#1976d2", 0.3)}`,
                        }
                      : {
                          bgcolor: "background.paper",
                          border: (theme) => `1px solid ${theme.palette.mode === "dark" ? alpha("#90caf9", 0.3) : alpha("#1976d2", 0.15)}`,
                          boxShadow: (theme) => theme.palette.mode === "dark" 
                            ? `0 2px 8px ${alpha("#000", 0.3)}` 
                            : `0 2px 8px ${alpha("#000", 0.05)}`,
                        }
                    ),
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    {message.role === "assistant" && (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1.5,
                          bgcolor: (theme) => theme.palette.mode === "dark" ? alpha("#90caf9", 0.2) : alpha("#1976d2", 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mt: 0.25,
                        }}
                      >
                        <SmartToyIcon sx={{ fontSize: 16, color: (theme) => theme.palette.mode === "dark" ? "#90caf9" : "#1976d2" }} />
                      </Box>
                    )}
                    {message.role === "user" && (
                      <Avatar
                        src={profileImage || undefined}
                        sx={{
                          width: 24,
                          height: 24,
                          mt: 0.25,
                          bgcolor: alpha("#fff", 0.2),
                        }}
                      >
                        {!profileImage && (
                          <FaceRoundedIcon
                            sx={{
                              width: "90%",
                              height: "90%",
                              color: "white",
                            }}
                          />
                        )}
                      </Avatar>
                    )}
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {message.content}
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    bgcolor: "background.paper",
                    border: (theme) => `1px solid ${theme.palette.mode === "dark" ? alpha("#90caf9", 0.3) : alpha("#1976d2", 0.15)}`,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={18} sx={{ color: "#1976d2" }} />
                    <Typography variant="body2" color="text.secondary">
                      AI가 답변을 생성하는 중...
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        {/* 입력 필드 */}
        <Stack direction="row" spacing={1.5} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading || isGenerating}
            variant="outlined"
            inputRef={inputRef}
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "background.paper",
                transition: "all 0.2s ease",
                "& fieldset": {
                  borderColor: (theme) => theme.palette.mode === "dark" ? alpha("#90caf9", 0.3) : alpha("#1976d2", 0.2),
                  borderWidth: 1.5,
                },
                "&:hover fieldset": {
                  borderColor: (theme) => theme.palette.mode === "dark" ? alpha("#90caf9", 0.5) : alpha("#1976d2", 0.4),
                },
                "&.Mui-focused fieldset": {
                  borderColor: (theme) => theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
                  boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.mode === "dark" ? "#90caf9" : "#1976d2", 0.1)}`,
                },
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isGenerating}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
              color: "white",
              boxShadow: `0 4px 14px ${alpha("#1976d2", 0.3)}`,
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                transform: "translateY(-2px)",
                boxShadow: `0 6px 20px ${alpha("#1976d2", 0.4)}`,
              },
              "&:disabled": {
                background: alpha("#1976d2", 0.3),
                color: "white",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 2.5, 
          borderTop: `1px solid ${alpha("#1976d2", 0.1)}`,
          background: `linear-gradient(135deg, ${alpha("#1976d2", 0.03)} 0%, ${alpha("#fff", 1)} 100%)`,
        }}
      >
        <Button 
          onClick={onClose} 
          disabled={isGenerating}
          sx={{
            borderRadius: 2,
            px: 3,
            color: "#64748b",
            "&:hover": {
              bgcolor: alpha("#1976d2", 0.08),
              color: "#1976d2",
            },
          }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleGeneratePlan}
          disabled={!canGenerate || isGenerating}
          sx={{
            borderRadius: 2,
            px: 3,
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            boxShadow: `0 4px 14px ${alpha("#1976d2", 0.3)}`,
            fontWeight: 600,
            transition: "all 0.2s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
              boxShadow: `0 6px 20px ${alpha("#1976d2", 0.4)}`,
              transform: "translateY(-2px)",
            },
            "&:disabled": {
              background: alpha("#1976d2", 0.3),
            },
          }}
        >
          {isGenerating ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1, color: "white" }} />
              생성 중...
            </>
          ) : (
            "✈️ 여행 계획 생성"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TravelPlanChatbot;
