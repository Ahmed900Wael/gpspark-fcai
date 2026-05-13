"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { 
  LayoutDashboard, Brain, Flag, GraduationCap, Library, Users, Settings, 
  HelpCircle, Plus, Menu, X, User, LogOut, FolderOpen
} from "lucide-react";

interface SidebarProps {
  activePage: string;
}

export function Sidebar({ activePage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Brainstorm AI", href: "/brainstorm", icon: Brain },
    { label: "My Projects", href: "/projects", icon: FolderOpen },
    { label: "Milestones", href: "/milestones", icon: Flag },
    { label: "GP Library", href: "/library", icon: Library },
    { label: "Team Search", href: "/team", icon: Users },
    { label: "Mentors", href: "/mentors", icon: GraduationCap, disabled: true },
  ];

  const handleLogout = async () => {
    console.log("[CLIENT] User logging out from sidebar");
    await signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[70] p-2.5 rounded-lg bg-white border border-slate-200 shadow-md lg:hidden touch-manipulation active:scale-95 transition-transform"
        aria-label="Toggle menu"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))' }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-200 flex flex-col z-[60] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 border-b border-slate-200">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 cursor-pointer group">
            <img src="/logo.png" alt="GPSpark Logo" className="w-10 h-10" />
            <div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">GPSpark</div>
              <div className="text-xs text-slate-500">Graduation Project</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 cursor-not-allowed"
                  title="Coming soon"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activePage === item.href
                    ? "bg-blue-50 text-blue-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className={`text-sm ${activePage === item.href ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-1 border-t border-slate-200">
          <Link href="/projects" className="w-full block mb-2">
            <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activePage === "/profile"
                ? "bg-blue-50 text-blue-900"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">My Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
