"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { useNotification } from "@/contexts/notification-context";
import { 
  Plus, ChevronRight, CheckCircle2, Circle, Loader2, 
  Calendar, BarChart3, ArrowRight, FolderOpen, X, Trash2, Users, Link as LinkIcon
} from "lucide-react";
import { useState, useEffect } from "react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  status: string;
  team_id: string | null;
  created_by: string;
  created_at: string;
  is_owner: boolean;
  team_name: string | null;
}

interface Phase {
  id: string;
  project_id: string;
  phase_number: number;
  name: string;
  status: string;
}

interface Task {
  id: string;
  phase_id: string;
  title: string;
  status: string;
}

const DEFAULT_PHASES = [
  { phase_number: 1, name: "Proposal", description: "Define project scope, objectives, and methodology.", status: "current" },
  { phase_number: 2, name: "Lit. Review", description: "Survey existing research and related work.", status: "pending" },
  { phase_number: 3, name: "Development", description: "Build prototype and implement core features.", status: "pending" },
  { phase_number: 4, name: "Market Analysis", description: "Feasibility study and competitive landscape.", status: "pending" },
  { phase_number: 5, name: "Final Prep", description: "Documentation, testing, and presentation preparation.", status: "pending" },
];

export default function ProjectsOverview() {
  const router = useRouter();
  const { supabase, user } = useAuth();
  const { addNotification, createNotification, refreshNotifications } = useNotification();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<Record<string, { totalTasks: number; completedTasks: number; phases: Phase[] }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectDomain, setNewProjectDomain] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [userTeams, setUserTeams] = useState<{ id: string; name: string }[]>([]);
  const [showLinkModal, setShowLinkModal] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [linkingProject, setLinkingProject] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<{ id: string; user_id: string; role: string; profile: any }[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProjects();
    loadUserTeams();
  }, [user]);

  const loadUserTeams = async () => {
    if (!supabase || !user) return;
    const { data: memberships } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);

    if (!memberships || memberships.length === 0) {
      setUserTeams([]);
      return;
    }

    const teamIds = memberships.map(m => m.team_id);
    const { data: teams } = await supabase
      .from("teams")
      .select("id, name")
      .in("id", teamIds);

    setUserTeams(teams || []);
  };

  const linkProjectToTeam = async (projectId: string) => {
    if (!selectedTeamId || !supabase) return;
    setLinkingProject(true);
    try {
      const { data: project } = await supabase
        .from("projects")
        .select("title")
        .eq("id", projectId)
        .single();

      const { error } = await supabase
        .from("projects")
        .update({ team_id: selectedTeamId })
        .eq("id", projectId)
        .eq("created_by", user!.id);

      if (error) throw error;

      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", selectedTeamId)
        .neq("user_id", user!.id);

      for (const member of teamMembers || []) {
        await createNotification(
          member.user_id,
          "project_assigned",
          "New Project Added",
          `"${project?.title}" has been linked to your team.`,
          selectedTeamId,
          projectId
        );
      }

      addNotification("success", "Project Linked", "Project is now shared with the team.");
      setShowLinkModal(null);
      setSelectedTeamId("");
      await refreshNotifications();
      loadProjects();
    } catch (error) {
      console.error("[PROJECTS] Error linking project:", error);
      addNotification("error", "Failed", "Could not link project to team.");
    } finally {
      setLinkingProject(false);
    }
  };

  const unlinkProject = async (projectId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("projects")
        .update({ team_id: null })
        .eq("id", projectId)
        .eq("created_by", user!.id);

      if (error) throw error;
      addNotification("success", "Unlinked", "Project removed from team.");
      loadProjects();
    } catch (error) {
      console.error("[PROJECTS] Error unlinking project:", error);
      addNotification("error", "Failed", "Could not unlink project.");
    }
  };

  const createProject = async () => {
    if (!newProjectTitle.trim() || !supabase || !user) return;
    setCreatingProject(true);
    try {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: newProjectTitle.trim(),
          description: newProjectDesc.trim() || null,
          domain: newProjectDomain.trim() || null,
          created_by: user.id,
          status: "active",
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const phasesToInsert = DEFAULT_PHASES.map(p => ({
        project_id: project.id,
        phase_number: p.phase_number,
        name: p.name,
        description: p.description,
        status: p.status,
      }));

      const { error: phasesError } = await supabase
        .from("project_phases")
        .insert(phasesToInsert);

      if (phasesError) throw phasesError;

      addNotification("success", "Project Created", `${project.title} is ready.`);
      setShowCreateModal(false);
      setNewProjectTitle("");
      setNewProjectDesc("");
      setNewProjectDomain("");
      router.push(`/milestones?projectId=${project.id}`);
    } catch (error) {
      console.error("[PROJECTS] Error creating project:", error);
      addNotification("error", "Failed", "Could not create project.");
    } finally {
      setCreatingProject(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("created_by", user!.id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      setProjectStats(prev => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      addNotification("success", "Deleted", "Project and all related data removed.");
    } catch (error) {
      console.error("[PROJECTS] Error deleting project:", error);
      addNotification("error", "Failed", "Could not delete project.");
    }
  };

  const unlinkProjectFromTeam = async (projectId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("projects")
        .update({ team_id: null })
        .eq("id", projectId)
        .eq("created_by", user!.id);

      if (error) throw error;
      addNotification("success", "Unlinked", "Project removed from team.");
      loadProjects();
    } catch (error) {
      console.error("[PROJECTS] Error unlinking project:", error);
      addNotification("error", "Failed", "Could not unlink project.");
    }
  };

  const loadProjectTeamMembers = async (projectId: string) => {
    if (!supabase) return;
    setLoadingMembers(true);
    try {
      const { data: project } = await supabase
        .from("projects")
        .select("team_id")
        .eq("id", projectId)
        .single();

      if (!project?.team_id) {
        setTeamMembers([]);
        return;
      }

      const { data: members } = await supabase
        .from("team_members")
        .select("id, user_id, role")
        .eq("team_id", project.team_id)
        .neq("user_id", user!.id);

      if (!members || members.length === 0) {
        setTeamMembers([]);
        return;
      }

      const memberIds = members.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, university_email")
        .in("id", memberIds);

      const enriched = members.map(m => ({
        ...m,
        profile: profiles?.find(p => p.id === m.user_id) || null,
      }));

      setTeamMembers(enriched);
    } catch (error) {
      console.error("[PROJECTS] Error loading team members:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const removeMemberFromProject = async (projectId: string, memberId: string) => {
    if (!supabase) return;
    try {
      const { data: project } = await supabase
        .from("projects")
        .select("team_id, title")
        .eq("id", projectId)
        .single();

      const { data: member } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", project?.team_id)
        .eq("id", memberId)
        .single();

      if (!member) {
        addNotification("error", "Error", "Member not found.");
        return;
      }

      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", project?.team_id)
        .eq("id", memberId);

      if (error) throw error;

      await createNotification(
        member.user_id,
        "team_rejected",
        "Removed from Project",
        `You have been removed from "${project?.title}".`,
        project?.team_id,
        projectId
      );

      addNotification("success", "Member Removed", "Member no longer has access to this project.");
      await refreshNotifications();
      await loadProjectTeamMembers(projectId);
      loadProjects();
    } catch (error) {
      console.error("[PROJECTS] Error removing member:", error);
      addNotification("error", "Failed", "Could not remove member.");
    }
  };

  const loadProjects = async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }
    try {
      const { data: ownedProjects, error: ownedError } = await supabase
        .from("projects")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (ownedError) throw ownedError;

      const { data: memberships } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      let teamProjects: any[] = [];
      if (memberships && memberships.length > 0) {
        const teamIds = memberships.map(m => m.team_id);
        const { data: tp, error: tpError } = await supabase
          .from("projects")
          .select("*")
          .in("team_id", teamIds)
          .neq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (!tpError && tp) {
          teamProjects = tp;
        }
      }

      const { data: teams } = await supabase
        .from("teams")
        .select("id, name");

      const allProjects = [
        ...(ownedProjects || []).map(p => ({
          ...p,
          is_owner: true,
          team_name: teams?.find(t => t.id === p.team_id)?.name || null,
        })),
        ...teamProjects.map(p => ({
          ...p,
          is_owner: false,
          team_name: teams?.find(t => t.id === p.team_id)?.name || null,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setProjects(allProjects);

      if (allProjects.length > 0) {
        const stats: Record<string, { totalTasks: number; completedTasks: number; phases: Phase[] }> = {};
        
        for (const project of allProjects) {
          const { data: phases } = await supabase
            .from("project_phases")
            .select("id, project_id, phase_number, name, status")
            .eq("project_id", project.id)
            .order("phase_number", { ascending: true });

          const phaseIds = phases?.map(p => p.id) || [];
          let totalTasks = 0;
          let completedTasks = 0;

          if (phaseIds.length > 0) {
            const { data: tasks } = await supabase
              .from("milestone_tasks")
              .select("id, phase_id, status")
              .in("phase_id", phaseIds);

            totalTasks = tasks?.length || 0;
            completedTasks = tasks?.filter(t => t.status === "completed").length || 0;
          }

          stats[project.id] = {
            totalTasks,
            completedTasks,
            phases: phases || [],
          };
        }

        setProjectStats(stats);
      }
    } catch (error) {
      console.error("[PROJECTS] Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgress = (projectId: string) => {
    const stats = projectStats[projectId];
    if (!stats || stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  const getCurrentPhase = (projectId: string) => {
    const stats = projectStats[projectId];
    if (!stats) return null;
    return stats.phases.find(p => p.status === "current") || stats.phases.find(p => p.status === "pending");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar activePage="/projects" />

        <div className="lg:ml-64 flex flex-col min-h-screen">
          <SimpleHeader />

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Projects</h1>
              <p className="text-slate-600 mt-1">Overview of all your graduation projects and their progress.</p>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FolderOpen className="h-4 w-4" />
                <span>{projects.length} Project{projects.length !== 1 ? "s" : ""}</span>
              </div>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Yet</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                  Create your first project to start tracking milestones and progress.
                </p>
                <Button className="bg-blue-900 hover:bg-blue-800 text-white" onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {projects.map((project) => {
                  const progress = getProgress(project.id);
                  const currentPhase = getCurrentPhase(project.id);
                  const stats = projectStats[project.id];

                  return (
                    <div
                      key={project.id}
                      className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${
                        project.is_owner ? "border-slate-200" : "border-green-200"
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                project.status === "active" ? "bg-green-100 text-green-700" :
                                project.status === "completed" ? "bg-blue-100 text-blue-700" :
                                "bg-slate-100 text-slate-600"
                              }`}>
                                {project.status.toUpperCase()}
                              </span>
                              {!project.is_owner && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                  Team Project
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 text-sm mb-2">{project.description || "No description"}</p>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {project.domain && (
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                  {project.domain}
                                </span>
                              )}
                              {project.team_id ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                  <Users className="h-3 w-3" />
                                  {project.team_name || "Team"}
                                </span>
                              ) : (
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-xs font-medium">
                                  No team
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {project.is_owner && (
                              <>
                                {project.team_id ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setShowManageMembers(project.id);
                                        loadProjectTeamMembers(project.id);
                                      }}
                                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                      title="Manage members"
                                    >
                                      <Users className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Unlink "${project.title}" from team? Members will lose access.`)) {
                                          unlinkProjectFromTeam(project.id);
                                        }
                                      }}
                                      className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                      title="Unlink from team"
                                    >
                                      <LinkIcon className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedTeamId("");
                                      setShowLinkModal(project.id);
                                    }}
                                    className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                    title="Link to team"
                                  >
                                    <Users className="h-4 w-4" />
                                  </button>
                                )}
                              </>
                            )}
                            <Link href={`/milestones?projectId=${project.id}`}>
                              <Button variant="ghost" className="text-blue-900 hover:text-blue-800 hover:bg-blue-50">
                                Open
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                            {project.is_owner && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${project.title}"? This will remove all phases, tasks, and submissions.`)) {
                                    deleteProject(project.id);
                                  }
                                }}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="h-4 w-4 text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 uppercase">Progress</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-900 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-blue-900">{progress}%</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-4 w-4 text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 uppercase">Tasks</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">
                              {stats?.completedTasks || 0}
                              <span className="text-sm text-slate-400 font-normal"> / {stats?.totalTasks || 0}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 uppercase">Current Phase</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-900">
                              {currentPhase ? `Phase ${currentPhase.phase_number}: ${currentPhase.name}` : "Not started"}
                            </div>
                          </div>
                        </div>

                        {stats?.phases && stats.phases.length > 0 && (
                          <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                            <span className="text-xs text-slate-500">Phases:</span>
                            {stats.phases.map((phase) => (
                              <div key={phase.id} className="flex items-center gap-1">
                                {phase.status === "completed" ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                ) : phase.status === "current" ? (
                                  <div className="w-3 h-3 rounded-full border-2 border-blue-900 flex items-center justify-center">
                                    <div className="w-1 h-1 rounded-full bg-blue-900"></div>
                                  </div>
                                ) : (
                                  <Circle className="h-3 w-3 text-slate-300" />
                                )}
                                <span className={`text-xs ${
                                  phase.status === "completed" ? "text-green-600" :
                                  phase.status === "current" ? "text-blue-900 font-medium" :
                                  "text-slate-400"
                                }`}>
                                  {phase.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <span className="text-xs text-slate-500">
                            Created {formatDate(project.created_at)}
                          </span>
                          <Link href={`/milestones?projectId=${project.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-900 hover:text-blue-800 hover:bg-blue-50">
                              View Milestones
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Footer />
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Create New Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Autonomous Swarm Logistics"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Brief description of your project..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                <input
                  type="text"
                  value={newProjectDomain}
                  onChange={(e) => setNewProjectDomain(e.target.value)}
                  placeholder="e.g. AI & Robotics"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                  onClick={createProject}
                  disabled={creatingProject || !newProjectTitle.trim()}
                >
                  {creatingProject ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLinkModal(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Link to Team</h3>
              <button onClick={() => setShowLinkModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Linking this project to a team will share it with all team members.
            </p>
            {userTeams.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500">
                <p>You're not in any teams yet.</p>
                <Link href="/team" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                  Browse teams →
                </Link>
              </div>
            ) : (
              <>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900 mb-4"
                >
                  <option value="">Select a team...</option>
                  {userTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowLinkModal(null)}>Cancel</Button>
                  <Button
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    onClick={() => showLinkModal && linkProjectToTeam(showLinkModal)}
                    disabled={linkingProject || !selectedTeamId}
                  >
                    {linkingProject ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                    Link
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showManageMembers && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowManageMembers(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Manage Project Access</h3>
              <button onClick={() => setShowManageMembers(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Remove team members' access to this project. They will be notified.
            </p>
            {loadingMembers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-900" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                <p>No team members have access to this project.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {member.profile?.full_name ? member.profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{member.profile?.full_name || "Unknown"}</p>
                        <p className="text-xs text-slate-500 truncate">{member.profile?.university_email || ""}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${member.profile?.full_name || "this member"} from this project?`)) {
                          removeMemberFromProject(showManageMembers, member.id);
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Remove access"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
