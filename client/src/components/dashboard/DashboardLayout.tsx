import { useState } from "react";
import { TopNavigation } from "./TopNavigation";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { TaskModal } from "./TaskModal";
import { MobileNavigation } from "./MobileNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks } from "@/lib/firebase";
import { useEffect } from "react";
import type { Task, TaskStats } from "@shared/schema";

export const DashboardLayout = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({ total: 0, completed: 0, inProgress: 0, pending: 0 });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [currentView, setCurrentView] = useState("dashboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { currentUser } = useAuth();

  const loadTasks = async () => {
    if (!currentUser) return;

    try {
      const allTasks = await getUserTasks(currentUser.uid);
      setTasks(allTasks);

      // Calculate stats
      const total = allTasks.length;
      const completed = allTasks.filter(t => t.completed).length;
      const pending = allTasks.filter(t => !t.completed).length;
      const inProgress = pending;

      setStats({ total, completed, inProgress, pending });
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [currentUser, refreshTrigger]);

  const handleNewTask = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation stats={stats} />
      
      <div className="flex">
        <Sidebar
          tasks={tasks}
          onNewTask={handleNewTask}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        
        <MainContent
          onEditTask={handleEditTask}
          refreshTrigger={refreshTrigger}
          currentView={currentView}
        />
      </div>

      <MobileNavigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewTask={handleNewTask}
      />

      <TaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        task={editingTask}
        onTaskSaved={handleTaskSaved}
      />
    </div>
  );
};
