import { Button } from "@/components/ui/button";
import type { Task } from "@shared/schema";

interface SidebarProps {
  tasks: Task[];
  onNewTask: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ tasks, onNewTask, currentView, onViewChange }: SidebarProps) => {
  const categories = [
    { 
      name: "Work", 
      color: "bg-blue-500", 
      gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
      border: "border-blue-200/50 dark:border-blue-800/30",
      text: "text-blue-700 dark:text-blue-400",
      icon: "fas fa-briefcase",
      count: tasks.filter(t => t.category === "Work").length 
    },
    { 
      name: "Personal", 
      color: "bg-green-500", 
      gradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
      border: "border-green-200/50 dark:border-green-800/30",
      text: "text-green-700 dark:text-green-400",
      icon: "fas fa-user",
      count: tasks.filter(t => t.category === "Personal").length 
    },
    { 
      name: "Shopping", 
      color: "bg-purple-500", 
      gradient: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      border: "border-purple-200/50 dark:border-purple-800/30",
      text: "text-purple-700 dark:text-purple-400",
      icon: "fas fa-shopping-cart",
      count: tasks.filter(t => t.category === "Shopping").length 
    },
    { 
      name: "Health", 
      color: "bg-red-500", 
      gradient: "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
      border: "border-red-200/50 dark:border-red-800/30",
      text: "text-red-700 dark:text-red-400",
      icon: "fas fa-heart",
      count: tasks.filter(t => t.category === "Health").length 
    },
  ];

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: "fas fa-home", description: "Overview & summary" },
    { id: "all", name: "All Tasks", icon: "fas fa-list", description: "Complete task list" },
    { id: "important", name: "Important", icon: "fas fa-star", description: "High priority items" },
    { id: "today", name: "Today", icon: "fas fa-calendar", description: "Due today" },
  ];

  return (
    <aside className="w-72 bg-card/95 backdrop-blur-sm border-r border-border/50 p-6 hidden lg:block shadow-sm">
      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="space-y-4">
          <Button
            onClick={onNewTask}
            className="w-full gradient-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 btn-modern"
            data-testid="button-add-new-task"
          >
            <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-plus text-sm" aria-hidden="true"></i>
            </div>
            Add New Task
          </Button>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
            <p className="text-xs text-muted-foreground font-medium">Total Tasks</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Navigation</h3>
          {navigationItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-lg scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:scale-102"
                }`}
                data-testid={`button-nav-${item.id}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive ? "bg-white/20" : "bg-muted group-hover:bg-muted-foreground/20"
                }`}>
                  <i className={`${item.icon} text-sm`} aria-hidden="true"></i>
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                    {item.name}
                  </p>
                  <p className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Categories</h3>
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.name}
                className={`flex items-center justify-between p-4 bg-gradient-to-r ${category.gradient} border ${category.border} rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-md`}
                data-testid={`category-${category.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <i className={`${category.icon} text-white text-sm`}></i>
                  </div>
                  <div>
                    <p className={`font-semibold ${category.text}`}>{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.count} {category.count === 1 ? 'task' : 'tasks'}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 ${category.color} text-white text-xs font-bold rounded-full shadow-sm`}>
                  {category.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/30 dark:border-green-800/20">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {tasks.filter(t => t.completed).length}
              </p>
              <p className="text-2xs text-green-700/80 dark:text-green-400/80 font-medium">Completed</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200/30 dark:border-amber-800/20">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {tasks.filter(t => !t.completed).length}
              </p>
              <p className="text-2xs text-amber-700/80 dark:text-amber-400/80 font-medium">Pending</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
