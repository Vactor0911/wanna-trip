import { atom } from "jotai";

// 알림 유형
export type NotificationType =
  | "comment"
  | "reply"
  | "like_post"
  | "like_comment"
  | "collaborator"
  | "popular_post"
  | "password_change"
  | "system";

// 대상 유형
export type TargetType = "post" | "comment" | "template" | "user" | "system" | "news";

// 알림 인터페이스
export interface Notification {
  uuid: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  targetType?: TargetType;
  targetUuid?: string;
  actorUuid?: string;
  actorName?: string;
  actorProfileImage?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

// 알림 목록 상태
export const notificationsAtom = atom<Notification[]>([]);

// 읽지 않은 알림 개수
export const unreadNotificationCountAtom = atom<number>(0);

// 알림 패널 열림 상태
export const notificationPanelOpenAtom = atom<boolean>(false);

// 알림 로딩 상태
export const notificationLoadingAtom = atom<boolean>(false);
