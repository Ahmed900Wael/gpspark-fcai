import { Bell } from "lucide-react";

interface NavbarProps {
  title: string;
  description?: string;
  tag?: {
    label: string;
    color: "blue" | "green" | "amber" | "purple" | "red";
  };
  showBell?: boolean;
  userInitials?: string;
}

const colorMap = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

export function Navbar({ title, description, tag, showBell = true, userInitials = "JD" }: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
          {tag && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorMap[tag.color]}`}>
              {tag.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {showBell && (
            <Bell className="h-5 w-5 text-slate-600 cursor-pointer hover:text-slate-900 transition-colors" />
          )}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
