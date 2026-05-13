"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  related_team_id: string | null;
  related_project_id: string | null;
  created_at: string;
}

interface ToastNotification {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  toasts: ToastNotification[];
  addToast: (type: "success" | "error" | "info", title: string, message: string) => void;
  addNotification: (type: "success" | "error" | "info", title: string, message: string) => void;
  removeToast: (id: number) => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  createNotification: (userId: string, type: string, title: string, message: string, relatedTeamId?: string, relatedProjectId?: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { supabaseUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!supabaseUser) {
      console.log("[NOTIFICATIONS] No user, skipping load");
      return;
    }
    console.log("[NOTIFICATIONS] Loading for user:", supabaseUser.id);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", supabaseUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[NOTIFICATIONS] Load error:", error.message, error.details);
      if (error.code === "42P01") {
        console.error("[NOTIFICATIONS] Table 'notifications' does not exist. Run supabase-notifications-schema.sql in Supabase SQL Editor.");
      }
    } else if (data) {
      console.log("[NOTIFICATIONS] Loaded", data.length, "notifications");
      setNotifications(prev => {
        if (prev.length === data.length && prev.every((n, i) => n.id === data[i].id)) return prev;
        return data;
      });
    }
  }, [supabaseUser]);

  useEffect(() => {
    if (!supabaseUser) {
      setNotifications([]);
      return;
    }

    loadNotifications();

    channelRef.current = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${supabaseUser.id}` },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${supabaseUser.id}` },
        (payload) => {
          const updated = payload.new as AppNotification;
          setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications", filter: `user_id=eq.${supabaseUser.id}` },
        (payload) => {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log("[NOTIFICATIONS] Realtime:", status);
        if (status === "SUBSCRIBED") {
          console.log("[NOTIFICATIONS] Realtime connected for user:", supabaseUser.id);
        }
        if (status === "CHANNEL_ERROR") {
          console.error("[NOTIFICATIONS] Realtime channel error");
        }
      });

    pollingRef.current = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [supabaseUser, loadNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addToast = useCallback((type: "success" | "error" | "info", title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(n => n.id !== id));
  }, []);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    if (!supabase || !supabaseUser) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", supabaseUser.id)
      .eq("read", false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!supabase) return;
    const { error } = await supabase.from("notifications").delete().eq("id", notificationId);
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const createNotification = async (userId: string, type: string, title: string, message: string, relatedTeamId?: string, relatedProjectId?: string): Promise<boolean> => {
    if (!supabase) {
      console.error("[NOTIFICATIONS] No supabase client");
      return false;
    }
    console.log("[NOTIFICATIONS] Creating notification for user:", userId, "type:", type, "title:", title);
    const payload = {
      user_id: userId,
      type,
      title,
      message,
      related_team_id: relatedTeamId || null,
      related_project_id: relatedProjectId || null,
    };
    console.log("[NOTIFICATIONS] Payload:", payload);
    const { data, error } = await supabase
      .from("notifications")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[NOTIFICATIONS] Create error:", JSON.stringify(error));
      return false;
    }

    console.log("[NOTIFICATIONS] Created notification:", data);
    if (data) {
      setNotifications(prev => {
        if (prev.some(n => n.id === data.id)) return prev;
        return [data, ...prev];
      });
      return true;
    }
    return false;
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toasts,
      addToast,
      addNotification: addToast,
      removeToast,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      createNotification,
    }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border p-4 shadow-lg bg-white animate-in slide-in-from-right ${
              toast.type === "success" ? "border-green-200" : toast.type === "error" ? "border-red-200" : "border-blue-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                <p className="text-xs text-slate-600 mt-1">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within an NotificationProvider");
  }
  return context;
}
