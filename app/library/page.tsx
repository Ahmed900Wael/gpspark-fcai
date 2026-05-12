"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { useNotification } from "@/contexts/notification-context";
import { createClient } from "@supabase/supabase-js";
import { 
  Search, Filter, Calendar, Star, ArrowRight, Lightbulb,
  User, ChevronDown, Loader2, Heart
} from "lucide-react";
import { useState, useEffect } from "react";

interface LibraryProject {
  id: string;
  title: string;
  description: string;
  domain: string;
  tech_stack: string[];
  uniqueness_score: number;
  release_date: string | null;
  honors: string | null;
  image_url: string | null;
  case_study_url: string | null;
}

export default function GPLibrary() {
  const { supabase } = useAuth();
  const { addNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");
  const [selectedYear, setSelectedYear] = useState("Release Year");
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState<LibraryProject[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
    loadFavorites();
  }, []);

  const loadProjects = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("library_projects")
        .select("*")
        .order("uniqueness_score", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("[LIBRARY] Error loading projects:", error);
      addNotification("error", "Load Failed", "Could not load library projects.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("project_favorites")
        .select("project_id");

      if (error) throw error;
      setFavorites(data?.map(f => f.project_id) || []);
    } catch (error) {
      console.error("[LIBRARY] Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (projectId: string) => {
    if (!supabase) return;
    setTogglingFavorite(projectId);
    try {
      const isFavorited = favorites.includes(projectId);
      
      if (isFavorited) {
        const { error } = await supabase
          .from("project_favorites")
          .delete()
          .eq("project_id", projectId);
        
        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== projectId));
        addNotification("success", "Removed", "Project removed from favorites.");
      } else {
        const { error } = await supabase
          .from("project_favorites")
          .insert({ project_id: projectId });
        
        if (error) throw error;
        setFavorites(prev => [...prev, projectId]);
        addNotification("success", "Added", "Project added to favorites.");
      }
    } catch (error) {
      console.error("[LIBRARY] Error toggling favorite:", error);
      addNotification("error", "Error", "Failed to update favorites.");
    } finally {
      setTogglingFavorite(null);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === "" || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tech_stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDomain = selectedDomain === "All Domains" || project.domain === selectedDomain;
    
    const matchesYear = selectedYear === "Release Year" || 
      (project.release_date && new Date(project.release_date).getFullYear().toString() === selectedYear);
    
    const matchesTab = activeTab === "all" || (activeTab === "favorites" && favorites.includes(project.id));
    
    return matchesSearch && matchesDomain && matchesYear && matchesTab;
  });

  const domains = Array.from(new Set(projects.map(p => p.domain)));
  const years = Array.from(new Set(
    projects
      .filter(p => p.release_date)
      .map(p => new Date(p.release_date!).getFullYear().toString())
  )).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-slate-50">
      <Sidebar activePage="/library" />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <SimpleHeader />

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200">
                {projects.length} Projects
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">GP Library</h1>
            <p className="text-slate-600 mt-1 max-w-2xl">
              Explore historical graduation projects. Analyze market gaps and technical implementations to define your own{" "}
              <span className="font-semibold text-green-600">Uniqueness Factor</span>.
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "all" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "favorites" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Favorites
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search keywords, stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none flex-1"
              />
            </div>
            <div className="relative">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none cursor-pointer"
              >
                <option>All Domains</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none cursor-pointer"
              >
                <option>Release Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <Button variant="outline" className="border-slate-200">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {activeTab === "favorites" ? "No favorites yet" : "Can't find a project similar to yours?"}
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                {activeTab === "favorites" 
                  ? "Start exploring and save projects that inspire you."
                  : "That's a good sign! It means your idea might have a very high Uniqueness Factor. Use our AI Brainstorm tool to validate your proposition."
                }
              </p>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                {activeTab === "favorites" ? "Explore Projects" : "Start Uniqueness Audit"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 mb-8">
              {filteredProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={`bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col ${
                    index === 0 ? "lg:flex-row" : ""
                  }`}
                >
                  {index === 0 && (
                    <div className="w-full lg:w-64 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8 relative">
                      <div className="text-center text-white">
                        <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Project Visual</div>
                        <div className="text-lg font-bold">FEATURED</div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                          {project.domain}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className={`flex-1 p-6 ${index !== 0 ? "relative" : ""}`}>
                    {index !== 0 && (
                      <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {project.domain}
                      </span>
                    )}
                    <div className={`flex items-start justify-between ${index !== 0 ? "mt-6" : "mb-4"}`}>
                      <h3 className="text-xl font-bold text-slate-900 pr-4">
                        {project.title}
                      </h3>
                      <div className="text-right flex-shrink-0">
                        <div className="text-3xl font-bold text-green-600">{project.uniqueness_score}<span className="text-lg text-slate-400">/10</span></div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Uniqueness Factor</div>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech_stack.map((tech) => (
                        <span key={tech} className={`px-3 py-1 rounded-md text-xs font-medium ${
                          index === 0 ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-sm text-slate-500">
                        {project.release_date && `Released ${new Date(project.release_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                        {project.honors && ` • `}
                        {project.honors && <span className="text-slate-700 font-medium">{project.honors}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(project.id)}
                          disabled={togglingFavorite === project.id}
                          className={`p-2 rounded-lg transition-colors ${
                            favorites.includes(project.id)
                              ? "text-red-500 hover:bg-red-50"
                              : "text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          {togglingFavorite === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Heart className={`h-4 w-4 ${favorites.includes(project.id) ? "fill-current" : ""}`} />
                          )}
                        </button>
                        <Button variant="ghost" className="text-blue-900 hover:text-blue-800 hover:bg-blue-50">
                          View Case Study
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
    </ProtectedRoute>
  );
}
