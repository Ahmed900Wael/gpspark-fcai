"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { 
  LayoutDashboard, Brain, Flag, GraduationCap, Library, Users, Settings, 
  HelpCircle, Plus, TrendingUp, Clock, Target, Award
} from "lucide-react";

const stats = [
  { label: "Project Progress", value: "68%", icon: TrendingUp, color: "blue" },
  { label: "Tasks Completed", value: "12/18", icon: Target, color: "green" },
  { label: "Days Until Deadline", value: "23", icon: Clock, color: "amber" },
  { label: "Uniqueness Score", value: "8.4/10", icon: Award, color: "purple" },
];

const recentActivity = [
  { action: "Completed task", detail: "Finalize swarm coordination algorithm", time: "2 hours ago" },
  { action: "Received feedback", detail: "From Dr. Julian Vane on Phase 3", time: "5 hours ago" },
  { action: "Team update", detail: "Marcus joined your project team", time: "1 day ago" },
];

const upcomingMilestones = [
  { phase: "Phase 3", task: "UI/UX dashboard for drone monitoring", due: "3 days" },
  { phase: "Phase 3", task: "Hardware sensor integration & testing", due: "Nov 15" },
  { phase: "Phase 4", task: "Market Analysis submission", due: "Dec 20" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Left Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-200 flex flex-col z-50">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <span className="text-xs font-bold text-white">GP</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">GPspark</div>
              <div className="text-xs text-slate-500">Graduation Project</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-900">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm font-semibold">Dashboard</span>
          </Link>
          <Link href="/brainstorm" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">Brainstorm AI</span>
          </Link>
          <Link href="/milestones" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Flag className="h-5 w-5" />
            <span className="text-sm font-medium">Milestones</span>
          </Link>
          <Link href="/mentors" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">Mentors</span>
          </Link>
          <Link href="/library" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Library className="h-5 w-5" />
            <span className="text-sm font-medium">GP Library</span>
          </Link>
          <Link href="/team" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Team Search</span>
          </Link>
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

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <Navbar 
          title="Welcome back, John!" 
          description="Here's what's happening with your project today."
          tag={{ label: "In Progress", color: "green" }}
        />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-5 w-5 ${
                    stat.color === "blue" ? "text-blue-600" :
                    stat.color === "green" ? "text-green-600" :
                    stat.color === "amber" ? "text-amber-600" :
                    "text-purple-600"
                  }`} />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Current Project */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Current Project</h3>
                <Link href="/milestones" className="text-sm text-blue-600 hover:underline">
                  View Details
                </Link>
              </div>
              <div className="mb-4">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Autonomous Swarm Logistics</h4>
                <p className="text-slate-600 text-sm mb-4">
                  Optimization of decentralized routing protocols for urban drone fleets.
                </p>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="bg-blue-900 h-2 rounded-full" style={{ width: "68%" }}></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Phase 3: Prototype Development</span>
                  <span className="font-semibold text-blue-900">68% Complete</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/milestones">
                  <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                    Continue Working
                  </Button>
                </Link>
                <Link href="/brainstorm">
                  <Button variant="outline" className="border-slate-200">
                    Brainstorm Ideas
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/brainstorm">
                  <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900">
                    <Brain className="h-4 w-4 mr-2" />
                    Start AI Brainstorm
                  </Button>
                </Link>
                <Link href="/team">
                  <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900">
                    <Users className="h-4 w-4 mr-2" />
                    Find Teammates
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900">
                    <Library className="h-4 w-4 mr-2" />
                    Browse Projects
                  </Button>
                </Link>
                <Link href="/milestones">
                  <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900">
                    <Flag className="h-4 w-4 mr-2" />
                    View Milestones
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        <span className="font-medium">{activity.action}</span> - {activity.detail}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Milestones</h3>
              <div className="space-y-3">
                {upcomingMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">{milestone.phase}</div>
                      <div className="text-sm font-medium text-slate-900">{milestone.task}</div>
                    </div>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      {milestone.due}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
