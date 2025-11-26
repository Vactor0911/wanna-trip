import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../utils/accessToken";
import {
  isAuthInitializedAtom,
  Notification,
  notificationsAtom,
  unreadNotificationCountAtom,
} from "../state";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";

const SOCKET_URL = import.meta.env.VITE_SERVER_HOST;

interface UseNotificationOptions {
  enabled?: boolean;
}

export const useNotification = ({ enabled = true }: UseNotificationOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);

  const [notifications, setNotifications] = useAtom(notificationsAtom);
  const [unreadCount, setUnreadCount] = useAtom(unreadNotificationCountAtom);
  const isAuthInitialized = useAtomValue(isAuthInitializedAtom); // 인증 초기화 완료 상태

  /**
   * 알림 목록 조회
   */
  const fetchNotifications = useCallback(
    async (options: { page?: number; limit?: number; unreadOnly?: boolean } = {}) => {
      try {
        const { page = 1, limit = 20, unreadOnly = false } = options;
        const response = await axiosInstance.get("/notification", {
          params: { page, limit, unreadOnly: unreadOnly.toString() },
        });

        if (response.data.success) {
          if (page === 1) {
            setNotifications(response.data.notifications);
          } else {
            setNotifications((prev) => [...prev, ...response.data.notifications]);
          }
          setUnreadCount(response.data.unreadCount);
          return response.data;
        }
      } catch (error) {
        console.error("알림 목록 조회 실패:", error);
      }
      return null;
    },
    [setNotifications, setUnreadCount]
  );

  /**
   * 읽지 않은 알림 개수 조회
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/notification/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.count);
        return response.data.count;
      }
    } catch (error) {
      console.error("읽지 않은 알림 개수 조회 실패:", error);
    }
    return 0;
  }, [setUnreadCount]);

  /**
   * 알림 읽음 처리
   */
  const markAsRead = useCallback(
    async (notificationUuid: string) => {
      try {
        const csrfToken = await getCsrfToken();
        const response = await axiosInstance.patch(
          `/notification/${notificationUuid}/read`,
          {},
          { headers: { "X-CSRF-Token": csrfToken } }
        );

        if (response.data.success) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.uuid === notificationUuid ? { ...n, isRead: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          return true;
        }
      } catch (error) {
        console.error("알림 읽음 처리 실패:", error);
      }
      return false;
    },
    [setNotifications, setUnreadCount]
  );

  /**
   * 모든 알림 읽음 처리
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axiosInstance.patch(
        "/notification/read-all",
        {},
        { headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        return true;
      }
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error);
    }
    return false;
  }, [setNotifications, setUnreadCount]);

  /**
   * 알림 삭제
   */
  const deleteNotification = useCallback(
    async (notificationUuid: string) => {
      try {
        const csrfToken = await getCsrfToken();
        const response = await axiosInstance.delete(
          `/notification/${notificationUuid}`,
          { headers: { "X-CSRF-Token": csrfToken } }
        );

        if (response.data.success) {
          const notification = notifications.find(
            (n) => n.uuid === notificationUuid
          );
          setNotifications((prev) =>
            prev.filter((n) => n.uuid !== notificationUuid)
          );
          if (notification && !notification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          return true;
        }
      } catch (error) {
        console.error("알림 삭제 실패:", error);
      }
      return false;
    },
    [notifications, setNotifications, setUnreadCount]
  );

  /**
   * 모든 알림 삭제
   */
  const deleteAllNotifications = useCallback(async () => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axiosInstance.delete("/notification/all", {
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        setNotifications([]);
        setUnreadCount(0);
        return true;
      }
    } catch (error) {
      console.error("모든 알림 삭제 실패:", error);
    }
    return false;
  }, [setNotifications, setUnreadCount]);

  /**
   * 소켓 연결
   */
  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.connected) return;

    const token = getAccessToken();
    if (!token) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // 새 알림 수신
    socket.on("notification:new", (notification: Notification) => {
      // 알림 목록에 추가
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // 읽지 않은 알림 개수 업데이트
    socket.on("notification:unread-count", (data: { count: number }) => {
      setUnreadCount(data.count);
    });
  }, [enabled, setNotifications, setUnreadCount]);

  /**
   * 소켓 연결 해제
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // 컴포넌트 마운트 시 소켓 연결 및 알림 조회
  useEffect(() => {
    // 인증 초기화가 완료된 후에만 소켓 연결 및 알림 조회
    if (enabled && isAuthInitialized) {
      const token = getAccessToken();
      if (token) {
        connect();
        fetchUnreadCount();
      }
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isAuthInitialized]);

  return {
    // 상태
    notifications,
    unreadCount,

    // 조회
    fetchNotifications,
    fetchUnreadCount,

    // 읽음 처리
    markAsRead,
    markAllAsRead,

    // 삭제
    deleteNotification,
    deleteAllNotifications,

    // 연결 제어
    connect,
    disconnect,
  };
};
