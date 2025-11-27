import { useAtom, useAtomValue } from "jotai";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ActiveUser, activeUsersAtom, isAuthInitializedAtom, USER_COLORS } from "../state";
import { getAccessToken } from "../utils/accessToken";
import { editingCardsAtom } from "../state/template";

const SOCKET_URL = import.meta.env.VITE_SERVER_HOST;

interface UseTemplateSocketOptions {
  templateUuid: string;
  enabled?: boolean;
  fetchTemplate: () => void;
}

export const useTemplateSocket = ({
  templateUuid,
  enabled = true,
  fetchTemplate,
}: UseTemplateSocketOptions) => {
  const { enqueueSnackbar } = useSnackbar();

  const socketRef = useRef<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useAtom(activeUsersAtom);
  const activeUsersRef = useRef<ActiveUser[]>([]); // 최신 activeUsers를 추적하기 위한 ref
  const isAuthInitialized = useAtomValue(isAuthInitializedAtom); // 인증 초기화 완료 상태

  // 편집 중인 카드 목록
  const [editingCards, setEditingCards] = useAtom(editingCardsAtom);

  // activeUsers가 변경될 때마다 ref 업데이트
  useEffect(() => {
    activeUsersRef.current = activeUsers;
  }, [activeUsers]);

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

      // 편집 중인 카드 목록에서 제거
      setEditingCards((prev) => {
        const newMap = new Map(prev);
        for (const [cardUuid, user] of newMap.entries()) {
          if (user.userUuid === data.userUuid) {
            newMap.delete(cardUuid);
          }
        }
        return newMap;
      });

      // 활성 사용자 목록 갱신 요청
      socket.emit("users:list", { templateUuid });
    });

    // 활성 사용자 목록 업데이트
    socket.on("users:list", (data: { users: ActiveUser[] }) => {
      // 사용자별로 고유한 색상 할당 (인덱스 기반)
      const usersWithColors = data.users.map((user, index) => ({
        ...user,
        color: USER_COLORS[index % USER_COLORS.length],
      }));
      setActiveUsers(usersWithColors);
    });

    // 템플릿 패치 요청 이벤트
    socket.on("template:fetch", () => {
      {
        fetchTemplate();
      }
    });

    // 카드 편집 시작 이벤트
    socket.on(
      "card:editing:started",
      (data: {
        cardUuid: string;
        userUuid: string;
        userName: string;
        timestamp: string;
      }) => {
        setEditingCards((prev) => {
          const newMap = new Map(prev);
          // 현재 활성 사용자 목록에서 해당 사용자의 색상 찾기
          const userColor = activeUsersRef.current.find(
            (u) => u.userUuid === data.userUuid
          )?.color;

          newMap.set(data.cardUuid, {
            userUuid: data.userUuid,
            userName: data.userName,
            color: userColor || USER_COLORS[0], // 기본 색상
          });
          return newMap;
        });
      }
    );

    // 카드 편집 종료 이벤트
    socket.on(
      "card:editing:ended",
      (data: { cardUuid: string; userUuid: string; timestamp: string }) => {
        setEditingCards((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.cardUuid);
          return newMap;
        });
      }
    );
  }, [
    enabled,
    enqueueSnackbar,
    fetchTemplate,
    setActiveUsers,
    setEditingCards,
    templateUuid,
  ]);

  // Socket 연결 해제
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("template:leave");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // 패치 이벤트 송신 함수
  const emitFetch = useCallback(() => {
    socketRef.current?.emit("template:fetch", { templateUuid });
  }, [templateUuid]);

  // 카드 편집 시작 이벤트 송신 함수
  const emitCardEditingStart = useCallback((cardUuid: string) => {
    socketRef.current?.emit("card:editing:start", { cardUuid });
  }, []);

  // 카드 편집 종료 이벤트 송신 함수
  const emitCardEditingEnd = useCallback((cardUuid: string) => {
    socketRef.current?.emit("card:editing:end", { cardUuid });
  }, []);

  // 컴포넌트 언마운트 시 소켓 연결 해제
  useEffect(() => {
    // 인증 초기화가 완료되고, 소켓 연결이 활성화된 경우에만 연결
    if (enabled && templateUuid && isAuthInitialized) {
      // 토큰이 있을 때만 연결 시도
      const token = getAccessToken();
      if (token) {
        connect();
      }
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, templateUuid, isAuthInitialized]);

  return {
    // 연결 상태
    isConnected: socketRef.current?.connected || false,

    // 활성 사용자
    activeUsers,

    // 편집 중인 카드
    editingCards,

    // 데이터 요청
    emitFetch,

    // 카드 편집중 여부
    emitCardEditingStart,
    emitCardEditingEnd,

    // 연결 제어
    connect,
  };
};
