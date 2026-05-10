"use client";

import Link from "next/link";
import { Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface SimpleHeaderProps {
  showBell?: boolean;
}

export function SimpleHeader({ showBell = true }: SimpleHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-4 pl-16 lg:pl-6 py-4">
      <div className="flex items-center justify-end gap-4">
        {showBell && (
          <Bell className="h-5 w-5 text-slate-600 cursor-pointer hover:text-slate-900 transition-colors" />
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
