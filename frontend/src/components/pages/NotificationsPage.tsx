import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState, useEffect } from "react";
import { notificationsApi } from "../../services/api";
import { toast } from "sonner";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error("Error loading notifications:", e);
    }
  };

  const markAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = async (id: string) => {
    await notificationsApi.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Bell className="h-7 w-7 text-primary" />
              Notifications
              {unreadCount > 0 && <Badge className="bg-primary">{unreadCount} New</Badge>}
            </h1>
            <p className="text-muted-foreground text-sm">
              Live updates on your pickup schedules, earned rewards, and community events.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Card className="border-none shadow-md">
          <CardContent className="p-4 md:p-6">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No notifications right now!
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start justify-between gap-4 p-4 rounded-xl transition-colors ${
                      notif.read ? "bg-secondary/20" : "bg-primary/5 border-l-4 border-l-primary font-medium"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm md:text-base flex items-center gap-2">
                          {notif.title}
                          {!notif.read && <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">Unread</Badge>}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{notif.message}</p>
                        <div className="text-[11px] text-muted-foreground mt-2">{notif.createdAt}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notif.read && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => markAsRead(notif.id)}>
                          <Check className="h-4 w-4 text-accent" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => deleteNotification(notif.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
