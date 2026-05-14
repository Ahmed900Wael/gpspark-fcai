"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp, Clock, Target, Award, Brain, Users, Library, Flag,
  Plus, AlertCircle, CheckCircle, Loader2
} from "lucide-react";

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  status: string;
  phases: {
    id: string;
    phase_number: number;
    name: string;
    status: string;
    tasks: {
      id: string;
      title: string;
      status: string;
      due_date: string | null;
    }[];
  }[];
}

interface TeamData {
  id: string;
  name: string;
  status: string;
  member_count: number;
}

interface DashboardStats {
  projectProgress: number;
  tasksCompleted: string;
  daysUntilDeadline: number | null;
  uniquenessScore: number | null;
  totalTasks: number;
  completedTasks: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    projectProgress: 0,
    tasksCompleted: "0/0",
    daysUntilDeadline: null,
    uniquenessScore: null,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: ownedProjects, error: ownedError } = await supabase
        .from("projects")
        .select(`
          *,
          phases:project_phases(
            id,
            phase_number,
            name,
            status,
            tasks:milestone_tasks(
              id,
              title,
              status,
              due_date
            )
          )
        `)
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (ownedError) {
        console.error("Error fetching owned projects:", ownedError);
      }

      const { data: accessProjects, error: accessError } = await supabase
        .from("project_access")
        .select("project_id, projects!inner(*)")
        .eq("user_id", user.id);

      if (accessError) {
        console.error("Error fetching access projects:", accessError);
      }

      const accessProjectList = (accessProjects || [])
        .map(a => a.projects)
        .filter(Boolean);

      const allProjects = [...(ownedProjects || []), ...accessProjectList];
      setProjects(allProjects);

      const { data: teamsData, error: teamsError } = await supabase
        .from("team_members")
        .select(`
          teams:teams(
            id,
            name,
            status,
            max_members
          )
        `)
        .eq("user_id", user.id);

      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
      } else {
        const formattedTeams = (teamsData || []).map((m: any) => ({
          id: m.teams.id,
          name: m.teams.name,
          status: m.teams.status,
          member_count: m.teams.max_members,
        }));
        setTeams(formattedTeams);
      }

      calculateStats(allProjects);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (projectsData: any[]) => {
    let totalTasks = 0;
    let completedTasks = 0;
    let closestDueDate: Date | null = null;

    projectsData.forEach((project) => {
      project.phases?.forEach((phase: any) => {
        phase.tasks?.forEach((task: any) => {
          totalTasks++;
          if (task.status === "completed") completedTasks++;
          if (task.due_date && task.status !== "completed") {
            const due = new Date(task.due_date);
            if (!closestDueDate || due < closestDueDate) {
              closestDueDate = due;
            }
          }
        });
      });
    });

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const daysUntil = closestDueDate
      ? Math.ceil(((closestDueDate as Date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    setStats({
      projectProgress: progress,
      tasksCompleted: `${completedTasks}/${totalTasks}`,
      daysUntilDeadline: daysUntil,
      uniquenessScore: null,
      totalTasks,
      completedTasks,
    });
  };

  const getUpcomingTasks = () => {
    const allTasks: { phase: string; task: string; due: string; projectId: string }[] = [];

    projects.forEach((project) => {
      project.phases?.forEach((phase) => {
        phase.tasks?.forEach((task) => {
          if (task.status !== "completed" && task.due_date) {
            const due = new Date(task.due_date);
            const now = new Date();
            const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            let dueText: string;
            if (diff < 0) dueText = "Overdue";
            else if (diff === 0) dueText = "Today";
            else if (diff === 1) dueText = "Tomorrow";
            else if (diff <= 7) dueText = `${diff} days`;
            else dueText = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            allTasks.push({
              phase: phase.name,
              task: task.title,
              due: dueText,
              projectId: project.id,
            });
          }
        });
      });
    });

    return allTasks
      .sort((a, b) => {
        if (a.due === "Overdue") return -1;
        if (b.due === "Overdue") return 1;
        return a.due.localeCompare(b.due);
      })
      .slice(0, 5);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar activePage="/dashboard" />

        <div className="lg:ml-64 flex flex-col min-h-screen">
          <SimpleHeader />

          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200 w-fit">
                  {projects.length > 0 ? "Active" : "Getting Started"}
                </span>
                <span className="text-sm text-slate-500">Welcome, {user?.fullName || "Student"}!</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Your Dashboard</h1>
              <p className="text-slate-600 mt-1">Here's what's happening with your project today.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 mb-1">{stats.projectProgress}%</div>
                <div className="text-xs md:text-sm text-slate-500">Project Progress</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 mb-1">{stats.tasksCompleted}</div>
                <div className="text-xs md:text-sm text-slate-500">Tasks Completed</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
                  {stats.daysUntilDeadline !== null
                    ? stats.daysUntilDeadline > 0
                      ? stats.daysUntilDeadline
                      : "0"
                    : "--"}
                </div>
                <div className="text-xs md:text-sm text-slate-500">Days Until Deadline</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
                  {projects.length}
                </div>
                <div className="text-xs md:text-sm text-slate-500">Active Projects</div>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <Flag className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Projects Yet</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Create your first graduation project to start tracking milestones, tasks, and progress.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/projects">
                    <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </Link>
                  <Link href="/brainstorm">
                    <Button variant="outline" className="border-slate-200">
                      <Brain className="h-4 w-4 mr-2" />
                      Brainstorm Ideas
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Current Project</h3>
                    <Link href="/milestones" className="text-sm text-blue-600 hover:underline">
                      View Details
                    </Link>
                  </div>
                  {projects[0] && (
                    <>
                      <div className="mb-4">
                        <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{projects[0].title}</h4>
                        {projects[0].description && (
                          <p className="text-slate-600 text-sm mb-4 line-clamp-2">{projects[0].description}</p>
                        )}
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-900 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stats.projectProgress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">
                            {projects[0].phases?.find((p) => p.status === "current")?.name || "Getting Started"}
                          </span>
                          <span className="font-semibold text-blue-900">{stats.projectProgress}% Complete</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
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
                    </>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
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
                    <Link href="/projects">
                      <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Milestones</h3>
                {getUpcomingTasks().length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No upcoming tasks</p>
                    <Link href="/milestones" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                      Add tasks in Milestones
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getUpcomingTasks().map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500 uppercase tracking-wide">{milestone.phase}</div>
                          <div className="text-sm font-medium text-slate-900 truncate">{milestone.task}</div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ml-2 ${
                          milestone.due === "Overdue"
                            ? "text-red-600 bg-red-50"
                            : milestone.due === "Today"
                            ? "text-amber-600 bg-amber-50"
                            : "text-slate-600 bg-slate-100"
                        }`}>
                          {milestone.due}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Teams</h3>
                {teams.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Not in any teams yet</p>
                    <Link href="/team" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                      Find a team
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{team.name}</div>
                          <div className="text-xs text-slate-500">{team.member_count} members</div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          team.status === "recruiting"
                            ? "text-green-600 bg-green-50"
                            : team.status === "full"
                            ? "text-amber-600 bg-amber-50"
                            : "text-blue-600 bg-blue-50"
                        }`}>
                          {team.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
