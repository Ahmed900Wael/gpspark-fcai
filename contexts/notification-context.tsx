"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Notification {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: "success" | "error" | "info", title: string, message: string) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: "success" | "error" | "info", title: string, message: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-3 max-w-sm w-full">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-xl border p-4 shadow-lg bg-white animate-in slide-in-from-right ${
              notification.type === "success"
                ? "border-green-200"
                : notification.type === "error"
                ? "border-red-200"
                : "border-blue-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  notification.type === "success"
                    ? "bg-green-500"
                    : notification.type === "error"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
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
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
