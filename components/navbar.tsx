import { Bell } from "lucide-react";

interface SimpleHeaderProps {
  showBell?: boolean;
  userInitials?: string;
}

export function SimpleHeader({ showBell = true, userInitials = "JD" }: SimpleHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-end gap-4">
        {showBell && (
          <Bell className="h-5 w-5 text-slate-600 cursor-pointer hover:text-slate-900 transition-colors" />
        )}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
          {userInitials}
        </div>
      </div>
    </header>
  );
}
