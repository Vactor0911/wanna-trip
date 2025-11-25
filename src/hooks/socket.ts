import { useAtom } from "jotai";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ActiveUser, activeUsersAtom } from "../state";
import { getAccessToken } from "../utils/accessToken";

const SOCKET_URL = import.meta.env.VITE_SERVER_HOST;

interface UseTemplateSocketOptions {
  templateUuid: string;
  enabled?: boolean;
}

export const useTemplateSocket = ({
  templateUuid,
  enabled = true,
}: UseTemplateSocketOptions) => {
  const { enqueueSnackbar } = useSnackbar();

  const socketRef = useRef<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useAtom(activeUsersAtom);

  /**
   * 소켓 연결
   */
  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.connected) return;

    // 액세스 토큰 가져오기
    const token = getAccessToken();
    if (!token) {
      console.error("Access token이 없습니다.");
      return;
    }

    // Socket.io 클라이언트 생성
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // 연결 이벤트 //

    // 소켓 연결
    socket.on("connect", () => {
      // 템플릿 Room 입장
      socket.emit("template:join", { templateUuid });
    });

    // 소켓 연결 해제
    socket.on("disconnect", (reason) => {
      // 서버가 연결을 끊은 경우 수동 재연결
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    // 소켓 연결 오류
    socket.on("connect_error", () => {
      enqueueSnackbar("실시간 연결에 실패했습니다.", { variant: "error" });
    });

    // 사용자 이벤트 //

    // 사용자 참여
    socket.on("user:joined", (data: { userUuid: string; userName: string }) => {
      enqueueSnackbar(`${data.userName}님이 참여했습니다.`, {
        variant: "info",
      });

      // 활성 사용자 목록 갱신 요청
      socket.emit("users:list", { templateUuid });
    });

    // 사용자 퇴장
    socket.on("user:left", (data: { userUuid: string; userName: string }) => {
      enqueueSnackbar(`${data.userName}님이 나갔습니다.`, {
        variant: "info",
      });

      // 활성 사용자 목록 갱신 요청
      socket.emit("users:list", { templateUuid });
    });

    // 활성 사용자 목록 업데이트
    socket.on("users:list", (data: { users: ActiveUser[] }) => {
      setActiveUsers(data.users);
    });
  }, [enabled, enqueueSnackbar, setActiveUsers, templateUuid]);

  // Socket 연결 해제
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("template:leave");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // 컴포넌트 언마운트 시 소켓 연결 해제
  useEffect(() => {
    if (enabled && templateUuid) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, templateUuid, connect, disconnect]);

  return {
    // 연결 상태
    isConnected: socketRef.current?.connected || false,

    // 활성 사용자
    activeUsers,

    // 연결 제어
    connect,
  };
};
