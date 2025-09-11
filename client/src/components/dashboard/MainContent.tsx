import { useState, useEffect } from "react";
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

  const loadTasks = async (taskFilters?: TaskFilters) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [filteredTasks, allTasksList, todayTasksList] = await Promise.all([
        getUserTasks(currentUser.uid, taskFilters),
        getUserTasks(currentUser.uid),
        getTodayTasks(currentUser.uid),
      ]);

      setTasks(filteredTasks);
      setAllTasks(allTasksList);
      setTodayTasks(todayTasksList);

      // Calculate stats from all tasks (not filtered)
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

  useEffect(() => {
    loadTasks(filters);
  }, [currentUser, refreshTrigger, filters]);

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed });
      await loadTasks(filters);
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
      await loadTasks(filters);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Work": return "bg-blue-100 text-blue-700";
      case "Personal": return "bg-green-100 text-green-700";
      case "Shopping": return "bg-purple-100 text-purple-700";
      case "Health": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => handleToggleTask(task.id, !!checked)}
        data-testid={`checkbox-task-${task.id}`}
      />
      <div className="flex-1">
        <p className={`font-medium ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-4 mt-2">
          {task.dueDate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <i className="fas fa-calendar"></i>
              <span>{format(task.dueDate, "MMM d, h:mm a")}</span>
            </span>
          )}
          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(task.category)}`}>
            {task.category}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            data-testid={`button-task-menu-${task.id}`}
          >
            <i className="fas fa-ellipsis-v"></i>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEditTask(task)} data-testid={`button-edit-task-${task.id}`}>
            <i className="fas fa-edit mr-2"></i>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDeleteTask(task.id)}
            className="text-destructive"
            data-testid={`button-delete-task-${task.id}`}
          >
            <i className="fas fa-trash mr-2"></i>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
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
      <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />
      
      {/* Results Message */}
      {getResultsMessage()}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-stats-total">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-tasks text-primary text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-stats-completed">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-circle text-green-500 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-stats-pending">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-yellow-500 text-xl"></i>
            </div>
          </div>
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
