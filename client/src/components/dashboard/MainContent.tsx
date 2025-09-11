import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks, getTodayTasks, updateTask, deleteTask, type TaskFilters } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { TaskFilters as TaskFiltersComponent } from "./TaskFilters";
import type { Task, TaskStats } from "@shared/schema";
import { format } from "date-fns";

interface MainContentProps {
  onEditTask: (task: Task) => void;
  refreshTrigger: number;
  currentView: string;
}

export const MainContent = ({ onEditTask, refreshTrigger, currentView }: MainContentProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats>({ total: 0, completed: 0, inProgress: 0, pending: 0 });
  const [filters, setFilters] = useState<TaskFilters>({});
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  // Load fresh data from network only (no filtering)
  const loadTasks = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [allTasksList, todayTasksList] = await Promise.all([
        getUserTasks(currentUser.uid), // Fetch all tasks without filters
        getTodayTasks(currentUser.uid),
      ]);

      setAllTasks(allTasksList);
      setTodayTasks(todayTasksList);

      // Calculate stats from all tasks
      const total = allTasksList.length;
      const completed = allTasksList.filter(t => t.completed).length;
      const pending = allTasksList.filter(t => !t.completed).length;
      const inProgress = pending; // For this implementation, pending = in progress

      setStats({ total, completed, inProgress, pending });
    } catch (error: any) {
      toast({
        title: "Failed to load tasks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering function
  const applyFilters = (allTasks: Task[], filters: TaskFilters): Task[] => {
    if (!filters || Object.keys(filters).length === 0) {
      return allTasks;
    }

    return allTasks.filter(task => {
      // Completion status filter
      if (filters.completed !== undefined && task.completed !== filters.completed) {
        return false;
      }
      
      // Category filter
      if (filters.category && task.category !== filters.category) {
        return false;
      }
      
      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      
      // Date filter
      if (filters.dueDate) {
        const now = new Date();
        const taskDueDate = task.dueDate;
        
        switch (filters.dueDate) {
          case 'today':
            if (!taskDueDate) return false;
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (taskDueDate < today || taskDueDate >= tomorrow) return false;
            break;
            
          case 'tomorrow':
            if (!taskDueDate) return false;
            const tomorrowStart = new Date(now);
            tomorrowStart.setDate(tomorrowStart.getDate() + 1);
            tomorrowStart.setHours(0, 0, 0, 0);
            const tomorrowEnd = new Date(tomorrowStart);
            tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
            if (taskDueDate < tomorrowStart || taskDueDate >= tomorrowEnd) return false;
            break;
            
          case 'thisWeek':
            if (!taskDueDate) return false;
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            if (taskDueDate < weekStart || taskDueDate >= weekEnd) return false;
            break;
            
          case 'overdue':
            if (!taskDueDate || task.completed) return false;
            const nowStart = new Date(now);
            nowStart.setHours(0, 0, 0, 0);
            if (taskDueDate >= nowStart) return false;
            break;
        }
      }
      
      // Search term filter (full-text search)
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = task.description && task.description.toLowerCase().includes(searchTerm);
        if (!titleMatch && !descriptionMatch) return false;
      }
      
      return true;
    });
  };

  // Load fresh data from network when user changes or refresh is triggered
  useEffect(() => {
    loadTasks();
  }, [currentUser, refreshTrigger]);

  // Apply filters client-side whenever allTasks or filters change
  useEffect(() => {
    const filteredTasks = applyFilters(allTasks, filters);
    setTasks(filteredTasks);
  }, [allTasks, filters]);

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed });
      await loadTasks(); // Reload fresh data from network
      toast({
        title: completed ? "Task completed!" : "Task marked incomplete",
        description: "Task status updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      await loadTasks(); // Reload fresh data from network
      toast({
        title: "Task deleted",
        description: "Task has been permanently removed.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.displayName?.split(" ")[0] || "there";
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "High": 
        return {
          bg: "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200/50 dark:border-red-800/30",
          icon: "fas fa-exclamation-triangle",
          dot: "bg-red-500"
        };
      case "Medium": 
        return {
          bg: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
          text: "text-amber-700 dark:text-amber-400",
          border: "border-amber-200/50 dark:border-amber-800/30",
          icon: "fas fa-clock",
          dot: "bg-amber-500"
        };
      case "Low": 
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
          text: "text-green-700 dark:text-green-400",
          border: "border-green-200/50 dark:border-green-800/30",
          icon: "fas fa-check-circle",
          dot: "bg-green-500"
        };
      default: 
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30",
          text: "text-gray-700 dark:text-gray-400",
          border: "border-gray-200/50 dark:border-gray-800/30",
          icon: "fas fa-circle",
          dot: "bg-gray-500"
        };
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "Work": 
        return {
          bg: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
          text: "text-blue-700 dark:text-blue-400",
          border: "border-blue-200/50 dark:border-blue-800/30",
          icon: "fas fa-briefcase",
          solid: "bg-blue-500"
        };
      case "Personal": 
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
          text: "text-green-700 dark:text-green-400",
          border: "border-green-200/50 dark:border-green-800/30",
          icon: "fas fa-user",
          solid: "bg-green-500"
        };
      case "Shopping": 
        return {
          bg: "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
          text: "text-purple-700 dark:text-purple-400",
          border: "border-purple-200/50 dark:border-purple-800/30",
          icon: "fas fa-shopping-cart",
          solid: "bg-purple-500"
        };
      case "Health": 
        return {
          bg: "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200/50 dark:border-red-800/30",
          icon: "fas fa-heart",
          solid: "bg-red-500"
        };
      default: 
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30",
          text: "text-gray-700 dark:text-gray-400",
          border: "border-gray-200/50 dark:border-gray-800/30",
          icon: "fas fa-tag",
          solid: "bg-gray-500"
        };
    }
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const categoryConfig = getCategoryConfig(task.category);
    const priorityConfig = getPriorityConfig(task.priority);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    
    return (
      <div className={`group relative p-5 bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-102 hover:border-border ${task.completed ? 'opacity-75' : ''} ${isOverdue ? 'ring-1 ring-red-200 dark:ring-red-800/30' : ''}`}>
        {/* Priority indicator strip */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityConfig.solid} rounded-l-xl`}></div>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 pt-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => handleToggleTask(task.id, !!checked)}
              className="w-5 h-5"
              data-testid={`checkbox-task-${task.id}`}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className={`font-semibold text-lg leading-6 ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {task.title}
              </h4>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg"
                    data-testid={`button-task-menu-${task.id}`}
                  >
                    <i className="fas fa-ellipsis-h text-sm"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEditTask(task)} data-testid={`button-edit-task-${task.id}`}>
                    <i className="fas fa-edit mr-2 w-4"></i>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-destructive hover:bg-destructive/10"
                    data-testid={`button-delete-task-${task.id}`}
                  >
                    <i className="fas fa-trash mr-2 w-4"></i>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {/* Category Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 ${categoryConfig.bg} border ${categoryConfig.border} rounded-lg`}>
                <div className={`w-2 h-2 ${categoryConfig.solid} rounded-full`}></div>
                <span className={`text-xs font-semibold ${categoryConfig.text}`}>
                  {task.category}
                </span>
              </div>

              {/* Priority Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 ${priorityConfig.bg} border ${priorityConfig.border} rounded-lg`}>
                <i className={`${priorityConfig.icon} text-xs ${priorityConfig.text}`}></i>
                <span className={`text-xs font-semibold ${priorityConfig.text}`}>
                  {task.priority}
                </span>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isOverdue 
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-200/50 dark:border-red-800/30' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/30'
                }`}>
                  <i className={`fas fa-calendar-alt text-xs ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}></i>
                  <span className={`text-xs font-semibold ${isOverdue ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>
                    {format(task.dueDate, "MMM d, h:mm a")}
                  </span>
                  {isOverdue && (
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 ml-1">OVERDUE</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Completion Overlay */}
        {task.completed && (
          <div className="absolute inset-0 bg-green-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <i className="fas fa-check text-sm"></i>
              <span className="font-semibold text-sm">Completed</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="relative">
              <div className="w-12 h-12 gradient-primary rounded-xl animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-12 h-12 gradient-primary rounded-xl opacity-50 blur-sm animate-pulse mx-auto"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Loading your tasks</h3>
            <p className="text-muted-foreground">Just a moment while we fetch everything...</p>
            
            {/* Loading skeleton cards */}
            <div className="mt-8 space-y-4 max-w-md mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card/50 rounded-xl p-4 border border-border/30 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="flex gap-2">
                        <div className="h-3 bg-muted rounded w-16"></div>
                        <div className="h-3 bg-muted rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const getResultsMessage = () => {
    const hasFilters = Object.values(filters).some(v => v !== undefined);
    if (!hasFilters) return null;
    
    return (
      <div className="mb-6 p-3 bg-muted/50 rounded-md">
        <p className="text-sm text-muted-foreground">
          {tasks.length === 0 
            ? "No tasks found matching your filters" 
            : `Found ${tasks.length} task${tasks.length !== 1 ? 's' : ''} matching your filters`
          }
        </p>
      </div>
    );
  };

  return (
    <main className="flex-1 p-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-greeting">
          {getGreeting()}
        </h2>
        <p className="text-muted-foreground">Here's what you have planned for today</p>
      </div>

      {/* Search and Filters */}
      <TaskFiltersComponent 
        filters={filters} 
        onFiltersChange={(newFilters) => {
          // Only update filters - no network calls
          // Client-side filtering will happen automatically via useEffect
          setFilters(newFilters);
        }} 
      />
      
      {/* Results Message */}
      {getResultsMessage()}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600/80 dark:text-blue-400/80 mb-1">Total Tasks</p>
              <p className="text-4xl font-black text-blue-700 dark:text-blue-300" data-testid="text-stats-total">{stats.total}</p>
              <p className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-1">All your tasks</p>
            </div>
            <div className="relative">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-tasks text-primary-foreground text-2xl"></i>
              </div>
              <div className="absolute inset-0 gradient-primary rounded-2xl opacity-30 blur-sm animate-pulse"></div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50"></div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600/80 dark:text-green-400/80 mb-1">Completed</p>
              <p className="text-4xl font-black text-green-700 dark:text-green-300" data-testid="text-stats-completed">{stats.completed}</p>
              <p className="text-xs text-green-600/60 dark:text-green-400/60 mt-1">Great job! 🎉</p>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-check-circle text-white text-2xl"></i>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl opacity-30 blur-sm animate-pulse"></div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-50"></div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-600/80 dark:text-amber-400/80 mb-1">Pending</p>
              <p className="text-4xl font-black text-amber-700 dark:text-amber-300" data-testid="text-stats-pending">{stats.pending}</p>
              <p className="text-xs text-amber-600/60 dark:text-amber-400/60 mt-1">Keep going! 💪</p>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-clock text-white text-2xl"></i>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl opacity-30 blur-sm animate-pulse"></div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-50"></div>
        </div>
      </div>

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Tasks */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Today's Tasks</h3>
            <Button variant="ghost" size="sm">
              <i className="fas fa-external-link-alt"></i>
            </Button>
          </div>
          
          <div className="space-y-4" data-testid="list-today-tasks">
            {todayTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tasks scheduled for today</p>
            ) : (
              todayTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))
            )}
          </div>
        </div>

        {/* Filtered Tasks */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {Object.values(filters).some(v => v !== undefined) ? 'Filtered Tasks' : 'Recent Tasks'}
          </h3>
          
          <div className="space-y-4" data-testid="list-filtered-tasks">
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {Object.values(filters).some(v => v !== undefined) 
                  ? "No tasks match your current filters"
                  : "No tasks yet. Create your first task!"
                }
              </p>
            ) : (
              tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
