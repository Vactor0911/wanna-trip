import React, { useState } from "react";
import {
  Badge,
  Box,
  IconButton,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Comment as CommentIcon,
  Favorite as FavoriteIcon,
  PersonAdd as PersonAddIcon,
  Star as StarIcon,
  Lock as LockIcon,
  Campaign as CampaignIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../hooks/notification";
import { SERVER_HOST } from "../utils/axiosInstance";
import {
  Notification,
  notificationPanelOpenAtom,
  wannaTripLoginStateAtom,
} from "../state";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// 알림 유형별 아이콘
const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "comment":
    case "reply":
      return <CommentIcon color="primary" />;
    case "like_post":
    case "like_comment":
      return <FavoriteIcon color="error" />;
    case "collaborator":
      return <PersonAddIcon color="success" />;
    case "popular_post":
      return <StarIcon sx={{ color: "#FFD700" }} />;
    case "password_change":
      return <LockIcon color="warning" />;
    case "system":
      return <CampaignIcon color="info" />;
    default:
      return <NotificationsIcon />;
  }
};

// 시간 포맷팅
const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 2) {
      return "방금";
    }
    
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ko,
    });
  } catch {
    return "";
  }
};

const NotificationPanel: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useAtom(notificationPanelOpenAtom);
  const [loginState] = useAtom(wannaTripLoginStateAtom);

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotification({ enabled: loginState.isLoggedIn });

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 알림 패널 열기
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(true);
    loadNotifications();
  };

  // 알림 패널 닫기
  const handleClose = () => {
    setAnchorEl(null);
    setIsOpen(false);
  };

  // 알림 목록 로드
  const loadNotifications = async () => {
    setLoading(true);
    setPage(1);
    const result = await fetchNotifications({ page: 1, limit: 20 });
    if (result) {
      setHasMore(result.hasMore);
    }
    setLoading(false);
  };

  // 더 보기
  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    const result = await fetchNotifications({ page: nextPage, limit: 20 });
    if (result) {
      setPage(nextPage);
      setHasMore(result.hasMore);
    }
    setLoading(false);
  };

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      await markAsRead(notification.uuid);
    }

    // 대상으로 이동
    handleClose();
    if (notification.targetType === "post" && notification.targetUuid) {
      navigate(`/community/${notification.targetUuid}`);
    } else if (
      notification.targetType === "template" &&
      notification.targetUuid
    ) {
      navigate(`/template/${notification.targetUuid}`);
    } else if (
      notification.targetType === "news" &&
      notification.targetUuid
    ) {
      navigate(`/news/${notification.targetUuid}`);
    }
  };

  // 로그인 상태가 아니면 렌더링하지 않음
  if (!loginState.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Tooltip title="알림">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          sx={{ position: "relative" }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            invisible={unreadCount === 0}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 480,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        {/* 헤더 */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            알림
          </Typography>
          <Box>
            <Tooltip title="모두 읽음">
              <IconButton
                size="small"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="모두 삭제">
              <IconButton
                size="small"
                onClick={deleteAllNotifications}
                disabled={notifications.length === 0}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 알림 목록 */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading && notifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                color: "text.secondary",
              }}
            >
              <Typography>알림이 없습니다.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.uuid}>
                  <ListItem
                    sx={{
                      bgcolor: notification.isRead
                        ? "transparent"
                        : "action.hover",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.selected",
                      },
                      py: 1.5,
                    }}
                    onClick={() => handleNotificationClick(notification)}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.uuid);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      {notification.actorProfileImage ? (
                        // 프로필 사진이 있는 경우: 프로필 사진 + 아이콘 뱃지
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                          badgeContent={
                            <Avatar
                              sx={{
                                width: 20,
                                height: 20,
                                bgcolor: "background.paper",
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              {React.cloneElement(getNotificationIcon(notification.type), {
                                sx: { fontSize: 14 },
                              })}
                            </Avatar>
                          }
                        >
                          <Avatar
                            src={`${SERVER_HOST}${notification.actorProfileImage}`}
                            alt={notification.actorName}
                          />
                        </Badge>
                      ) : (
                        // 프로필 사진이 없는 경우: 아이콘만 표시
                        <Avatar
                          sx={{
                            bgcolor: notification.type === "popular_post" 
                              ? "#FFF8E1" 
                              : notification.type === "password_change"
                              ? "#FFF3E0"
                              : notification.type === "system"
                              ? "#E3F2FD"
                              : "action.selected",
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={notification.isRead ? "normal" : "bold"}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="span"
                        >
                          {formatTime(notification.createdAt)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}

              {/* 더 보기 버튼 */}
              {hasMore && (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    size="small"
                    fullWidth
                  >
                    {loading ? <CircularProgress size={20} /> : "더 보기"}
                  </Button>
                </Box>
              )}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationPanel;
