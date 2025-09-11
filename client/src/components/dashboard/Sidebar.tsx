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
    { name: "Work", color: "bg-blue-500", count: tasks.filter(t => t.category === "Work").length },
    { name: "Personal", color: "bg-green-500", count: tasks.filter(t => t.category === "Personal").length },
    { name: "Shopping", color: "bg-purple-500", count: tasks.filter(t => t.category === "Shopping").length },
    { name: "Health", color: "bg-red-500", count: tasks.filter(t => t.category === "Health").length },
  ];

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: "fas fa-home" },
    { id: "all", name: "All Tasks", icon: "fas fa-list" },
    { id: "important", name: "Important", icon: "fas fa-star" },
    { id: "today", name: "Today", icon: "fas fa-calendar" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border p-6 hidden lg:block">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div>
          <Button
            onClick={onNewTask}
            className="w-full flex items-center justify-center gap-2"
            data-testid="button-add-new-task"
          >
            <i className="fas fa-plus"></i>
            Add New Task
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                currentView === item.id
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              data-testid={`button-nav-${item.id}`}
            >
              <i className={`${item.icon} w-4`}></i>
              {item.name}
            </button>
          ))}
        </nav>

        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
                data-testid={`category-${category.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                  <span className="text-sm">{category.name}</span>
                </div>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
