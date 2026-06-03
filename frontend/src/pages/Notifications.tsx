import React, { useState, useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import {
  useUserNotifications,
  useMarkNotificationRead,
  type Notification,
} from "../hooks/useUsers";
import { useTranslation } from "../hooks/useTranslation";

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const userId = currentUser?.id || "";

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useUserNotifications(userId);

  const markRead = useMarkNotificationRead();

  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications]
  );
  const readNotifications = useMemo(
    () => notifications.filter((n) => !!n.isRead),
    [notifications]
  );

  const notificationsToShow =
    activeTab === "unread" ? unreadNotifications : readNotifications;

  const handleMarkRead = async (notification: Notification) => {
    if (!userId) return;
    try {
      await markRead.mutateAsync({
        userId,
        notificationId: notification.id,
      });
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { hour12: true });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">{t("notif_title", "Notifications")}</h1>
      <p className="text-gray-500 mb-6">{t("notif_subtitle", "Unread and read notifications")}</p>

      {!userId ? (
        <div className="text-gray-500">{t("signin_prompt_notif", "Sign in to see notifications")}</div>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="tabs mb-4">
            <button
              className={`tab ${activeTab === "unread" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              {t("unread_count", "Unread ({count})").replace("{count}", unreadNotifications.length.toString())}
            </button>
            <button
              className={`tab ${activeTab === "read" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("read")}
            >
              {t("read_count", "Read ({count})").replace("{count}", readNotifications.length.toString())}
            </button>
          </div>

          <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
            <div className="space-y-4">
              {notificationsToShow.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">🔔</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    {isError
                      ? t("failed_load_notif", "Failed to load notifications")
                      : activeTab === "unread"
                      ? t("no_unread_notif", "No unread notifications")
                      : t("no_read_notif", "No read notifications")}
                  </h3>
                  <p className="text-base-content/50">
                    {isError
                      ? t("error_fetching_notif", "There was a problem fetching your notifications. Try again later.")
                      : t("all_caught_up", "You're all caught up.")}
                  </p>
                </div>
              ) : (
                notificationsToShow.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                  >
                    <div>
                      <div className="font-semibold">{notif.title}</div>
                      {notif.description && (
                        <div className="text-gray-500 text-sm">
                          {notif.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                      <div className="text-xs text-gray-400">
                        {formatTime(
                          notif.time ||
                            notif.createdAt ||
                            notif.updatedAt ||
                            new Date().toISOString()
                        )}
                      </div>

                      {!notif.isRead && activeTab === "unread" && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleMarkRead(notif)}
                          disabled={markRead.loading}
                        >
                          {markRead.loading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            t("mark_read", "Mark read")
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;
