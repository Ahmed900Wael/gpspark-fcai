"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, User, CheckCheck, Trash2, Users, FolderOpen, Flag, MessageSquare, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useNotification } from "@/contexts/notification-context";
import { useState, useEffect, useRef } from "react";

interface SimpleHeaderProps {
  showBell?: boolean;
}

export function SimpleHeader({ showBell = true }: SimpleHeaderProps) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refreshNotifications } = useNotification();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("[NAVBAR] Notifications:", notifications.length, "Unread:", unreadCount);
  }, [notifications, unreadCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDropdown) {
      refreshNotifications();
    }
  }, [showDropdown, refreshNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const typeIcons: Record<string, React.ReactNode> = {
    team_request: <Users className="h-4 w-4 text-amber-500" />,
    team_accepted: <CheckCheck className="h-4 w-4 text-green-500" />,
    team_rejected: <Trash2 className="h-4 w-4 text-red-500" />,
    project_assigned: <FolderOpen className="h-4 w-4 text-blue-500" />,
    milestone_submitted: <Flag className="h-4 w-4 text-purple-500" />,
    milestone_approved: <CheckCheck className="h-4 w-4 text-green-500" />,
    milestone_rejected: <Trash2 className="h-4 w-4 text-red-500" />,
    milestone_comment: <MessageSquare className="h-4 w-4 text-cyan-500" />,
    info: <Bell className="h-4 w-4 text-slate-500" />,
  };

  const typeColors: Record<string, string> = {
    team_request: "hover:bg-amber-50/50",
    team_accepted: "hover:bg-green-50/50",
    team_rejected: "hover:bg-red-50/50",
    project_assigned: "hover:bg-blue-50/50",
    milestone_submitted: "hover:bg-purple-50/50",
    milestone_approved: "hover:bg-green-50/50",
    milestone_rejected: "hover:bg-red-50/50",
    milestone_comment: "hover:bg-cyan-50/50",
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNavigationLink = (n: typeof notifications[0]) => {
    if (n.related_project_id && n.related_team_id) {
      return `/milestones?projectId=${n.related_project_id}`;
    }
    if (n.related_project_id) {
      return `/milestones?projectId=${n.related_project_id}`;
    }
    if (n.related_team_id) {
      return `/team`;
    }
    return null;
  };

  const handleNotificationClick = (n: typeof notifications[0]) => {
    const link = getNavigationLink(n);
    if (link) {
      router.push(link);
    }
    if (!n.read) {
      markAsRead(n.id);
    }
    setShowDropdown(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 pl-16 lg:pl-6 py-4">
      <div className="flex items-center justify-end gap-4">
        {showBell && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {notifications.length > 0 && unreadCount === 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-slate-400"></span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-[500px] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Notifications ({unreadCount} unread)</h3>
                  <div className="flex items-center gap-3">
                    <button onClick={handleRefresh} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Refresh">
                      <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[400px]">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map(n => {
                      const navLink = getNavigationLink(n);
                      return (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-slate-50 transition-colors cursor-pointer ${
                            !n.read ? "bg-blue-50/50" : ""
                          } ${typeColors[n.type] || "hover:bg-slate-50"}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                              {typeIcons[n.type] || <Bell className="h-4 w-4 text-slate-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                            </div>
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              {!n.read && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-400"
                                  title="Mark as read"
                                >
                                  <CheckCheck className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {navLink && (
                            <div className="flex items-center gap-1 mt-2 ml-7">
                              <span className="text-[10px] text-blue-600 font-medium">View details</span>
                              <svg className="h-3 w-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
            {user?.fullName ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : <User className="h-4 w-4" />}
          </div>
        </Link>
      </div>
    </header>
  );
}
