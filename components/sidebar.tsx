"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Brain, Flag, GraduationCap, Library, Users, Settings, 
  HelpCircle, Plus, Menu, X
} from "lucide-react";

interface SidebarProps {
  activePage: string;
}

export function Sidebar({ activePage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Brainstorm AI", href: "/brainstorm", icon: Brain },
    { label: "Milestones", href: "/milestones", icon: Flag },
    { label: "Mentors", href: "/mentors", icon: GraduationCap },
    { label: "GP Library", href: "/library", icon: Library },
    { label: "Team Search", href: "/team", icon: Users },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] p-2.5 rounded-lg bg-white border border-slate-200 shadow-md lg:hidden touch-manipulation active:scale-95 transition-transform"
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
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="GPSpark Logo" className="w-10 h-10" />
            <div>
              <div className="text-sm font-semibold text-slate-900">GPSpark</div>
              <div className="text-xs text-slate-500">Graduation Project</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
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
          ))}
        </nav>

        <div className="p-4 space-y-1 border-t border-slate-200">
          <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white mb-2">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <Link href="/support" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Support</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
