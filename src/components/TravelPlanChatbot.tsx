import {
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
import PersonIcon from "@mui/icons-material/Person";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [isNearLimit, setIsNearLimit] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    }
  }, [open]);

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
      alert("여행 계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  }, [messages, onComplete, templateName]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={1}>
          <SmartToyIcon color="primary" />
          <Typography variant="h6">AI 여행 계획 만들기</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ height: "60vh", display: "flex", flexDirection: "column" }}>
        {/* 에러 메시지 */}
        {error && (
          <Box sx={{ mb: 2, p: 1, bgcolor: "error.light", borderRadius: 1 }}>
            <Typography color="error.contrastText" variant="body2">
              {error}
            </Typography>
          </Box>
        )}

        {/* 대화 횟수 제한 경고 */}
        {isNearLimit && !error && (
          <Box sx={{ mb: 2, p: 1, bgcolor: "warning.light", borderRadius: 1 }}>
            <Typography color="warning.contrastText" variant="body2">
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
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: "75%",
                    bgcolor:
                      message.role === "user"
                        ? "primary.main"
                        : "background.paper",
                    color: message.role === "user" ? "white" : "text.primary",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    {message.role === "assistant" && (
                      <SmartToyIcon fontSize="small" sx={{ mt: 0.5 }} />
                    )}
                    {message.role === "user" && (
                      <PersonIcon fontSize="small" sx={{ mt: 0.5 }} />
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
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      답변을 생성하는 중...
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        {/* 입력 필드 */}
        <Stack direction="row" spacing={1}>
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
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isGenerating}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isGenerating}>
          취소
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGeneratePlan}
          disabled={!canGenerate || isGenerating}
        >
          {isGenerating ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              생성 중...
            </>
          ) : (
            "여행 계획 생성"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TravelPlanChatbot;
