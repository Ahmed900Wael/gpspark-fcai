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
  FileText, ChevronRight, Download, HelpCircle, Loader2, Plus, Upload, Paperclip
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { uploadMilestoneFile, validateFile } from "@/lib/upload";

interface Project {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  status: string;
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

const DUMMY_PROJECT: Project = {
  id: "demo-project",
  title: "Autonomous Swarm Logistics",
  description: "Optimization of decentralized routing protocols for urban drone fleets.",
  domain: "AI & Robotics",
  status: "active",
};

const DUMMY_PHASES: Phase[] = [
  {
    id: "demo-phase-1",
    project_id: "demo-project",
    phase_number: 1,
    name: "Proposal",
    description: "Define project scope, objectives, and methodology.",
    start_date: "2025-09-01",
    end_date: "2025-09-30",
    status: "completed",
  },
  {
    id: "demo-phase-2",
    project_id: "demo-project",
    phase_number: 2,
    name: "Lit. Review",
    description: "Survey existing research on swarm intelligence and drone routing.",
    start_date: "2025-10-01",
    end_date: "2025-10-31",
    status: "completed",
  },
  {
    id: "demo-phase-3",
    project_id: "demo-project",
    phase_number: 3,
    name: "Development",
    description: "Build prototype swarm coordination system and simulation environment.",
    start_date: "2025-11-01",
    end_date: "2026-01-31",
    status: "current",
  },
  {
    id: "demo-phase-4",
    project_id: "demo-project",
    phase_number: 4,
    name: "Market Analysis",
    description: "Feasibility study and competitive landscape for autonomous drone delivery.",
    start_date: "2026-02-01",
    end_date: "2026-02-28",
    status: "pending",
  },
  {
    id: "demo-phase-5",
    project_id: "demo-project",
    phase_number: 5,
    name: "Final Prep",
    description: "Documentation, testing, and presentation preparation.",
    start_date: "2026-03-01",
    end_date: "2026-04-30",
    status: "pending",
  },
];

const DUMMY_TASKS: Task[] = [
  {
    id: "demo-task-1",
    phase_id: "demo-phase-1",
    title: "Finalize swarm coordination algorithm",
    description: null,
    status: "completed",
    due_date: "2025-09-15",
    assets_count: 3,
  },
  {
    id: "demo-task-2",
    phase_id: "demo-phase-1",
    title: "Submit project proposal document",
    description: null,
    status: "completed",
    due_date: "2025-09-30",
    assets_count: 1,
  },
  {
    id: "demo-task-3",
    phase_id: "demo-phase-2",
    title: "Complete literature review on ACO algorithms",
    description: null,
    status: "completed",
    due_date: "2025-10-15",
    assets_count: 2,
  },
  {
    id: "demo-task-4",
    phase_id: "demo-phase-2",
    title: "Survey drone routing protocols",
    description: null,
    status: "completed",
    due_date: "2025-10-31",
    assets_count: 1,
  },
  {
    id: "demo-task-5",
    phase_id: "demo-phase-3",
    title: "UI/UX dashboard for drone monitoring",
    description: null,
    status: "in_progress",
    due_date: "2025-12-15",
    assets_count: 2,
  },
  {
    id: "demo-task-6",
    phase_id: "demo-phase-3",
    title: "Hardware sensor integration & testing",
    description: null,
    status: "pending",
    due_date: "2026-01-15",
    assets_count: 0,
  },
  {
    id: "demo-task-7",
    phase_id: "demo-phase-3",
    title: "Implement collision avoidance system",
    description: null,
    status: "pending",
    due_date: "2026-01-31",
    assets_count: 0,
  },
];

export default function Milestones() {
  const { supabase, user } = useAuth();
  const { addNotification } = useNotification();
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    if (!supabase || !user) {
      setProjects([DUMMY_PROJECT]);
      setSelectedProject(DUMMY_PROJECT);
      setPhases(DUMMY_PHASES);
      setTasks(DUMMY_TASKS);
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
        setProjects([DUMMY_PROJECT]);
        setSelectedProject(DUMMY_PROJECT);
        setPhases(DUMMY_PHASES);
        setTasks(DUMMY_TASKS);
      }
    } catch (error) {
      console.error("[MILESTONES] Error loading projects:", error);
      setProjects([DUMMY_PROJECT]);
      setSelectedProject(DUMMY_PROJECT);
      setPhases(DUMMY_PHASES);
      setTasks(DUMMY_TASKS);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectData = async (projectId: string) => {
    if (projectId === "demo-project") {
      setPhases(DUMMY_PHASES);
      setTasks(DUMMY_TASKS);
      return;
    }
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
      }
    } catch (error) {
      console.error("[MILESTONES] Error loading project data:", error);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !newTaskPhase) return;
    
    if (!supabase || selectedProject?.id === "demo-project") {
      addNotification("success", "Demo Mode", "Task would be added in production.");
      setNewTaskTitle("");
      setShowAddTask(false);
      return;
    }
    
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
    if (taskId.startsWith("demo-")) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      addNotification("success", "Updated", `Task marked as ${newStatus.replace("_", " ")} (demo).`);
      return;
    }
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

  const handleFileUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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

    if (taskId.startsWith("demo-")) {
      addNotification("success", "Demo Mode", `File "${file.name}" would be uploaded in production.`);
      setUploadingTaskId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const { path, error } = await uploadMilestoneFile(user.id, taskId, file);

    if (error) {
      addNotification("error", "Upload Failed", error);
    } else if (path) {
      const { data } = supabase!.storage
        .from("milestones")
        .getPublicUrl(path);

      const fileUrl = data.publicUrl;

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, file_url: fileUrl, assets_count: (t.assets_count || 0) + 1 }
            : t
        )
      );

      if (!taskId.startsWith("demo-") && supabase) {
        await supabase
          .from("milestone_tasks")
          .update({ assets_count: (tasks.find(t => t.id === taskId)?.assets_count || 0) + 1 })
          .eq("id", taskId);
      }

      addNotification("success", "File Uploaded", `"${file.name}" attached to task.`);
    }

    setUploadingTaskId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {selectedProject?.title || "My Project"}
            </h1>
            <p className="text-slate-600 mt-1">{selectedProject?.description || "Track your graduation project milestones."}</p>
          </div>

          {projects.length > 1 && (
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
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <span>PROJECTS</span>
                  <ChevronRight className="h-4 w-4" />
                  <span>{selectedProject?.title.toUpperCase() || "MY PROJECT"}</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" className="border-slate-200">
                    <Share2 className="h-4 w-4 mr-2" />
                    Project Brief
                  </Button>
                </div>
              </div>

              {phases.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-8 overflow-x-auto">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Roadmap Overview</h3>
                  <div className="flex items-center justify-between">
                    {phases.map((phase, index) => (
                      <div key={phase.id} className="flex flex-col items-center relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                          phase.status === "completed"
                            ? "bg-green-600 text-white"
                            : phase.status === "current"
                            ? "bg-blue-900 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}>
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
                          <div className={`absolute top-6 left-12 w-full h-0.5 ${
                            phase.status === "completed" ? "bg-green-600" :
                            phase.status === "current" ? "bg-blue-900" :
                            "bg-slate-200"
                          }`} style={{ width: "calc(100% + 2rem)" }}></div>
                        )}
                      </div>
                    ))}
                  </div>
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
                          {currentPhase ? `Phase ${currentPhase.phase_number}: ${currentPhase.name}` : "No Active Phase"}
                        </h3>
                        {currentPhase && (
                          <p className="text-sm text-slate-500">
                            {currentPhase.start_date && formatDate(currentPhase.start_date)} - {currentPhase.end_date && formatDate(currentPhase.end_date)}
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
                    {currentPhaseTasks.length > 0 ? currentPhaseTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          task.status === "completed"
                            ? "bg-slate-50 border-slate-200"
                            : task.status === "in_progress"
                            ? "bg-white border-blue-200"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
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
                            <div className={`text-sm font-medium ${
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
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  View file
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(task.id, e)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingTaskId === task.id}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                            title="Upload file"
                          >
                            {uploadingTaskId === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>No tasks in current phase</p>
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
                    <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                      Submit Milestone
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {nextPhase && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Next Phase</h4>
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Phase {nextPhase.phase_number}</div>
                        <h5 className="font-semibold text-slate-900 mb-2">{nextPhase.name}</h5>
                        <p className="text-sm text-slate-600 mb-3">
                          {nextPhase.description || "Upcoming project phase."}
                        </p>
                      </div>
                    </div>
                  )}

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
    </div>
    </ProtectedRoute>
  );
}
