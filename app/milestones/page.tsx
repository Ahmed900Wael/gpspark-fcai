"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { useNotification } from "@/contexts/notification-context";
import { 
  Share2, CheckCircle2, Circle, Clock, MessageSquare, 
  FileText, ChevronRight, Download, HelpCircle, Loader2, Plus, Upload, Paperclip, X, Calendar, Edit3, Trash2, FolderOpen
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { uploadMilestoneFile, validateFile } from "@/lib/upload";

interface Project {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  status: string;
  team_id: string | null;
}

interface Phase {
  id: string;
  project_id: string;
  phase_number: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  submission_text: string;
  file_url: string | null;
  status: string;
  submitted_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  phase_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assets_count: number;
  file_url?: string | null;
}

function MilestonesContent() {
  const { supabase, user } = useAuth();
  const { addNotification, createNotification, refreshNotifications } = useNotification();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPhase, setNewTaskPhase] = useState<string>("");
  const [addingTask, setAddingTask] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const [showSubmitMilestone, setShowSubmitMilestone] = useState(false);
  const [submitText, setSubmitText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [editingTaskDate, setEditingTaskDate] = useState<string | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projects.length === 0) return;
    const projectId = searchParams.get("projectId");
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
        return;
      }
    }
    if (!selectedProject || !projects.find(p => p.id === selectedProject.id)) {
      setSelectedProject(projects[0]);
    }
  }, [searchParams, projects]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData(selectedProject.id);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (phases.length > 0) {
      const current = phases.find(p => p.status === "current");
      setActivePhaseId(current?.id || phases[0]?.id || null);
    }
  }, [phases]);

  const loadProjects = async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setProjects(data);
        setSelectedProject(data[0]);
      } else {
        setProjects([]);
        setSelectedProject(null);
        setPhases([]);
        setTasks([]);
      }
    } catch (error) {
      console.error("[MILESTONES] Error loading projects:", error);
      setProjects([]);
      setSelectedProject(null);
      setPhases([]);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectData = async (projectId: string, activePhaseId?: string | null) => {
    if (!supabase) return;
    try {
      const { data: phasesData, error: phasesError } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .order("phase_number", { ascending: true });

      if (phasesError) throw phasesError;
      setPhases(phasesData || []);

      const phaseIds = phasesData?.map(p => p.id) || [];
      if (phaseIds.length > 0) {
        const { data: tasksData, error: tasksError } = await supabase
          .from("milestone_tasks")
          .select("*")
          .in("phase_id", phaseIds)
          .order("created_at", { ascending: true });

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);

        const taskIds = tasksData?.map(t => t.id) || [];
        if (taskIds.length > 0 && user) {
          setLoadingSubmissions(true);
          const { data: subsData } = await supabase
            .from("milestone_submissions")
            .select("*")
            .in("task_id", taskIds)
            .eq("user_id", user.id)
            .order("submitted_at", { ascending: false });

          setSubmissions(subsData || []);
          setLoadingSubmissions(false);
        }
      } else {
        setTasks([]);
        setSubmissions([]);
      }
    } catch (error) {
      console.error("[MILESTONES] Error loading project data:", error);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !newTaskPhase || !supabase) return;
    
    setAddingTask(true);
    try {
      const { error } = await supabase
        .from("milestone_tasks")
        .insert({
          phase_id: newTaskPhase,
          title: newTaskTitle.trim(),
          status: "pending",
        });

      if (error) throw error;
      addNotification("success", "Task Added", "New milestone task created.");
      setNewTaskTitle("");
      setShowAddTask(false);
      if (selectedProject) loadProjectData(selectedProject.id);
    } catch (error) {
      console.error("[MILESTONES] Error adding task:", error);
      addNotification("error", "Failed", "Could not add task.");
    } finally {
      setAddingTask(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("milestone_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      addNotification("success", "Updated", `Task marked as ${newStatus.replace("_", " ")}.`);
    } catch (error) {
      console.error("[MILESTONES] Error updating task:", error);
    }
  };

  const handleFileUpload = async (taskId: string, file: File) => {
    if (!user) return;

    const validation = validateFile(file, {
      maxSizeMB: 50,
      allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "application/zip",
      ],
    });

    if (!validation.valid) {
      addNotification("error", "Invalid File", validation.error || "Invalid file");
      return;
    }

    setUploadingTaskId(taskId);

    const { path, error } = await uploadMilestoneFile(user.id, taskId, file);

    if (error) {
      addNotification("error", "Upload Failed", error);
    } else if (path && supabase) {
      const { data } = supabase.storage
        .from("milestones")
        .getPublicUrl(path);

      const fileUrl = data.publicUrl;
      const currentTask = tasks.find(t => t.id === taskId);
      const newCount = (currentTask?.assets_count || 0) + 1;

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, file_url: fileUrl, assets_count: newCount }
            : t
        )
      );

      await supabase
        .from("milestone_tasks")
        .update({ assets_count: newCount })
        .eq("id", taskId);

      addNotification("success", "File Uploaded", `"${file.name}" attached to task.`);
    }

    setUploadingTaskId(null);
  };

  const submitMilestone = async () => {
    if (!submitText.trim() || !supabase || !user) return;

    const phaseTasks = activePhase 
      ? tasks.filter(t => t.phase_id === activePhase.id)
      : [];

    if (phaseTasks.length === 0) {
      addNotification("error", "No Tasks", "Add at least one task to this phase before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("milestone_submissions")
        .insert({
          task_id: phaseTasks[0].id,
          user_id: user.id,
          submission_text: submitText.trim(),
          status: "submitted",
        });

      if (error) throw error;

      const { data: newSub } = await supabase
        .from("milestone_submissions")
        .select("*")
        .eq("task_id", phaseTasks[0].id)
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1);

      if (newSub) {
        setSubmissions(prev => [newSub[0], ...prev]);
      }

      if (selectedProject?.team_id) {
        const { data: teamMembers } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("team_id", selectedProject.team_id)
          .neq("user_id", user.id);

        for (const member of teamMembers || []) {
          await createNotification(
            member.user_id,
            "milestone_submitted",
            "Milestone Submitted",
            `${user.fullName} submitted "${activePhase?.name}" for ${selectedProject.title}.`,
            selectedProject.team_id,
            selectedProject.id
          );
        }
      }

      addNotification("success", "Submitted", "Milestone submission sent for review.");
      setSubmitText("");
      setShowSubmitMilestone(false);
      await refreshNotifications();
    } catch (error) {
      console.error("[MILESTONES] Error submitting milestone:", error);
      addNotification("error", "Failed", "Could not submit milestone.");
    } finally {
      setSubmitting(false);
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setEditingTaskDate(task.due_date || "");
    setShowTaskDetail(true);
  };

  const updateTaskDate = async () => {
    if (!selectedTask || !supabase) return;
    setSavingTask(true);
    try {
      const { error } = await supabase
        .from("milestone_tasks")
        .update({ due_date: editingTaskDate || null })
        .eq("id", selectedTask.id);

      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, due_date: editingTaskDate || null } : t));
      setSelectedTask(prev => prev ? { ...prev, due_date: editingTaskDate || null } : null);
      addNotification("success", "Updated", "Task date saved.");
    } catch (error) {
      console.error("[MILESTONES] Error updating task date:", error);
      addNotification("error", "Failed", "Could not update task date.");
    } finally {
      setSavingTask(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("milestone_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addNotification("success", "Deleted", "Task removed.");
      setShowTaskDetail(false);
    } catch (error) {
      console.error("[MILESTONES] Error deleting task:", error);
      addNotification("error", "Failed", "Could not delete task.");
    }
  };

  const advancePhase = async (phaseId: string) => {
    if (!supabase) return;
    try {
      const currentIndex = phases.findIndex(p => p.id === phaseId);
      if (currentIndex >= phases.length - 1) {
        addNotification("info", "Info", "This is the last phase.");
        return;
      }

      const { error } = await supabase
        .from("project_phases")
        .update({ status: "completed" })
        .eq("id", phaseId);

      if (error) throw error;

      const nextPhase = phases[currentIndex + 1];
      const { error: error2 } = await supabase
        .from("project_phases")
        .update({ status: "current" })
        .eq("id", nextPhase.id);

      if (error2) throw error2;

      if (selectedProject?.team_id && user) {
        const { data: teamMembers } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("team_id", selectedProject.team_id)
          .neq("user_id", user.id);

        for (const member of teamMembers || []) {
          await createNotification(
            member.user_id,
            "milestone_submitted",
            "Phase Advanced",
            `${user.fullName} advanced ${selectedProject.title} to Phase ${nextPhase.phase_number}: ${nextPhase.name}.`,
            selectedProject.team_id,
            selectedProject.id
          );
        }
      }

      addNotification("success", "Phase Advanced", `Moved to Phase ${nextPhase.phase_number}: ${nextPhase.name}`);
      await refreshNotifications();
      loadProjectData(selectedProject!.id);
    } catch (error) {
      console.error("[MILESTONES] Error advancing phase:", error);
      addNotification("error", "Failed", "Could not advance phase.");
    }
  };

  const navigateToPhase = (phaseId: string) => {
    setActivePhaseId(phaseId);
  };

  const activePhase = phases.find(p => p.id === activePhaseId);
  const activePhaseTasks = activePhase 
    ? tasks.filter(t => t.phase_id === activePhase.id)
    : [];
  
  const currentPhase = phases.find(p => p.status === "current");
  const currentPhaseTasks = currentPhase 
    ? tasks.filter(t => t.phase_id === currentPhase.id)
    : [];
  
  const nextPhase = phases.find(p => p.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No date set";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (projects.length === 0 && !isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50">
          <Sidebar activePage="/milestones" />
          <div className="lg:ml-64 flex flex-col min-h-screen">
            <SimpleHeader />
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No Projects Yet</h2>
                <p className="text-slate-600 mb-6">
                  Create a project first to start tracking milestones and progress.
                </p>
                <Link href="/projects">
                  <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Go to My Projects
                  </Button>
                </Link>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-slate-50">
      <Sidebar activePage="/milestones" />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <SimpleHeader />

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200">
                {currentPhase ? `Phase ${currentPhase.phase_number}` : "No Active Phase"}
              </span>
              <Link href="/projects" className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors inline-flex items-center gap-1">
                <FolderOpen className="h-3 w-3" />
                My Projects
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {selectedProject?.title || "My Project"}
            </h1>
            <p className="text-slate-600 mt-1">{selectedProject?.description || "Track your graduation project milestones."}</p>
          </div>

          {projects.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Project</label>
              <select
                value={selectedProject?.id || ""}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value);
                  setSelectedProject(project || null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
            </div>
          ) : (
            <>
              {phases.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-8 overflow-x-auto">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Roadmap Overview</h3>
                  <div className="flex items-center justify-between min-w-[600px]">
                    {phases.map((phase, index) => (
                      <button
                        key={phase.id}
                        onClick={() => navigateToPhase(phase.id)}
                        className={`flex flex-col items-center relative flex-1 transition-all ${
                          activePhaseId === phase.id ? "scale-105" : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                          phase.status === "completed"
                            ? "bg-green-600 text-white"
                            : phase.status === "current"
                            ? "bg-blue-900 text-white"
                            : "bg-slate-100 text-slate-400"
                        } ${activePhaseId === phase.id ? "ring-4 ring-blue-200" : ""}`}>
                          {phase.status === "completed" ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : phase.status === "current" ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-slate-900">{phase.name}</div>
                          <div className={`text-xs uppercase tracking-wide ${
                            phase.status === "completed" ? "text-green-600" :
                            phase.status === "current" ? "text-blue-900" :
                            "text-slate-400"
                          }`}>
                            {phase.status.toUpperCase()}
                          </div>
                        </div>
                        {index < phases.length - 1 && (
                          <div className={`absolute top-6 left-[calc(50%+1.5rem)] w-[calc(100%-3rem)] h-0.5 ${
                            phase.status === "completed" ? "bg-green-600" :
                            phase.status === "current" ? "bg-blue-900" :
                            "bg-slate-200"
                          }`}></div>
                        )}
                      </button>
                    ))}
                  </div>
                  {activePhase && activePhase.status === "current" && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-600 text-white"
                        onClick={() => advancePhase(activePhase.id)}
                      >
                        Advance to Next Phase
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-900 flex items-center justify-center text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {activePhase ? `Phase ${activePhase.phase_number}: ${activePhase.name}` : "No Active Phase"}
                        </h3>
                        {activePhase && (
                          <p className="text-sm text-slate-500">
                            {activePhase.start_date && formatDate(activePhase.start_date)} - {activePhase.end_date && formatDate(activePhase.end_date)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">{progress}%</div>
                      <div className="text-xs text-slate-500 uppercase">Progress</div>
                    </div>
                  </div>

                  {showAddTask && (
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Add New Task</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Task title..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                        />
                        <select
                          value={newTaskPhase}
                          onChange={(e) => setNewTaskPhase(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                        >
                          <option value="">Select phase...</option>
                          {phases.map(p => (
                            <option key={p.id} value={p.id}>Phase {p.phase_number}: {p.name}</option>
                          ))}
                        </select>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowAddTask(false)}>Cancel</Button>
                          <Button 
                            size="sm" 
                            className="bg-blue-900 hover:bg-blue-800"
                            onClick={addTask}
                            disabled={addingTask || !newTaskTitle.trim()}
                          >
                            {addingTask ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    {activePhaseTasks.length > 0 ? activePhaseTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                          task.status === "completed"
                            ? "bg-slate-50 border-slate-200 hover:border-slate-300"
                            : task.status === "in_progress"
                            ? "bg-white border-blue-200 hover:border-blue-300"
                            : "bg-slate-50 border-slate-200 opacity-60 hover:opacity-80"
                        }`}
                        onClick={() => openTaskDetail(task)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus = task.status === "pending" ? "in_progress" : 
                                               task.status === "in_progress" ? "completed" : "pending";
                              updateTaskStatus(task.id, nextStatus);
                            }}
                            className="flex-shrink-0"
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : task.status === "in_progress" ? (
                              <div className="w-5 h-5 rounded-full border-2 border-blue-900 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                              </div>
                            ) : (
                              <Circle className="h-5 w-5 text-slate-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${
                              task.status === "pending" ? "text-slate-500" : "text-slate-900"
                            }`}>
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {task.due_date && (
                                <span className={`text-xs font-medium ${
                                  task.status === "in_progress" ? "text-red-600" : "text-slate-500"
                                }`}>
                                  {task.status === "in_progress" ? "Due" : "Start"} {formatDate(task.due_date)}
                                </span>
                              )}
                              {task.assets_count > 0 && (
                                <span className="text-xs text-slate-500">{task.assets_count} assets</span>
                              )}
                              {task.file_url && (
                                <a
                                  href={task.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  View file
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <label className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50" onClick={(e) => e.stopPropagation()}>
                            {uploadingTaskId === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(task.id, file);
                              }}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                              className="hidden"
                              disabled={uploadingTaskId === task.id}
                            />
                          </label>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>No tasks in current phase</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowAddTask(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Task
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddTask(!showAddTask)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                    <Button 
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                      onClick={() => setShowSubmitMilestone(true)}
                    >
                      Submit Milestone
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Submissions Status */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Submissions
                    </h4>
                    {loadingSubmissions ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 text-blue-900 animate-spin" />
                      </div>
                    ) : submissions.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No submissions yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {submissions.map((sub) => (
                          <div key={sub.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                sub.status === "approved" ? "bg-green-100 text-green-700" :
                                sub.status === "rejected" ? "bg-red-100 text-red-700" :
                                sub.status === "under_review" ? "bg-amber-100 text-amber-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>
                                {sub.status.replace("_", " ").toUpperCase()}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 line-clamp-2">{sub.submission_text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Next Phase */}
                  {(() => {
                    const activeIndex = phases.findIndex(p => p.id === activePhaseId);
                    const nextP = phases[activeIndex + 1];
                    return nextP ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Next Phase</h4>
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Phase {nextP.phase_number}</div>
                          <h5 className="font-semibold text-slate-900 mb-2">{nextP.name}</h5>
                          <p className="text-sm text-slate-600 mb-3">
                            {nextP.description || "Upcoming project phase."}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl p-4 md:p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="h-5 w-5" />
                      <h4 className="font-semibold">Mentor Feedback</h4>
                    </div>
                    <p className="text-sm text-blue-100 mb-4 italic">
                      "Keep pushing forward on your current tasks. Focus on edge cases for the next review."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-sm font-bold">M</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Assigned Mentor</div>
                        <div className="text-xs text-blue-200">Faculty Advisor</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-4 md:p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                      <HelpCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">Need Help?</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Stuck on a specific task? Connect with a mentor or peer.
                    </p>
                    <Button variant="outline" className="border-blue-200 text-blue-900 hover:bg-blue-50">
                      Start a Discussion
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6 md:p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Review Archive</h3>
                <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
                  All previous milestone submissions and feedback logs are archived and available for your final presentation assembly.
                </p>
                <Button variant="ghost" className="text-blue-900 hover:text-blue-800 hover:bg-blue-50">
                  Access Project Archive
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>

      {/* Submit Milestone Modal */}
      {showSubmitMilestone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSubmitMilestone(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Submit Milestone</h3>
              <button
                onClick={() => setShowSubmitMilestone(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {activePhase ? `Submitting for Phase ${activePhase.phase_number}: ${activePhase.name}` : "No active phase"}
            </p>
            <textarea
              value={submitText}
              onChange={(e) => setSubmitText(e.target.value)}
              placeholder="Describe your milestone submission, progress made, and any challenges..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900 resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSubmitMilestone(false)}>Cancel</Button>
              <Button
                className="bg-blue-900 hover:bg-blue-800 text-white"
                onClick={submitMilestone}
                disabled={submitting || !submitText.trim()}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTaskDetail(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Task Details</h3>
              <button
                onClick={() => setShowTaskDetail(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Title</label>
                <p className="text-base font-semibold text-slate-900">{selectedTask.title}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Status</label>
                <div className="flex items-center gap-2">
                  {selectedTask.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : selectedTask.status === "in_progress" ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-900 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-slate-400" />
                  )}
                  <span className={`text-sm font-medium capitalize ${
                    selectedTask.status === "completed" ? "text-green-600" :
                    selectedTask.status === "in_progress" ? "text-blue-900" :
                    "text-slate-500"
                  }`}>
                    {selectedTask.status.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => {
                      const nextStatus = selectedTask.status === "pending" ? "in_progress" : 
                                       selectedTask.status === "in_progress" ? "completed" : "pending";
                      updateTaskStatus(selectedTask.id, nextStatus);
                      setSelectedTask(prev => prev ? { ...prev, status: nextStatus } : null);
                    }}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Phase</label>
                <p className="text-sm text-slate-700">
                  {(() => {
                    const phase = phases.find(p => p.id === selectedTask.phase_id);
                    return phase ? `Phase ${phase.phase_number}: ${phase.name}` : "Unknown";
                  })()}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Due Date</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={editingTaskDate || ""}
                      onChange={(e) => setEditingTaskDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-900 hover:bg-blue-800 text-white flex-shrink-0"
                    onClick={updateTaskDate}
                    disabled={savingTask}
                  >
                    {savingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Attachments</label>
                <div className="flex items-center gap-2">
                  {selectedTask.assets_count > 0 ? (
                    <>
                      <span className="text-sm text-slate-700">{selectedTask.assets_count} file(s)</span>
                      {selectedTask.file_url && (
                        <a
                          href={selectedTask.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Paperclip className="h-4 w-4" />
                          View latest
                        </a>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">No files attached</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => deleteTask(selectedTask.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
                <Button onClick={() => setShowTaskDetail(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </ProtectedRoute>
  );
}

export default function Milestones() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
      </div>
    }>
      <MilestonesContent />
    </Suspense>
  );
}
