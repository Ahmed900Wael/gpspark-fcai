import Link from "next/link";
import { Bell } from "lucide-react";

interface SimpleHeaderProps {
  links?: Array<{ label: string; href: string; active?: boolean }>;
  showBell?: boolean;
  userInitials?: string;
}

export function SimpleHeader({ links, showBell = true, userInitials = "JD" }: SimpleHeaderProps) {
  return (
    <header className="fixed top-0 left-64 right-0 z-40 bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {links && links.length > 0 ? (
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.active
                    ? "text-blue-900 border-b-2 border-blue-900 pb-1"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : (
          <div />
        )}
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
