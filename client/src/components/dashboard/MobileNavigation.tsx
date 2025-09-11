import { Button } from "@/components/ui/button";

interface MobileNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onNewTask: () => void;
}

export const MobileNavigation = ({ currentView, onViewChange, onNewTask }: MobileNavigationProps) => {
  const navigationItems = [
    { id: "dashboard", name: "Home", icon: "fas fa-home" },
    { id: "all", name: "Tasks", icon: "fas fa-list" },
    { id: "today", name: "Calendar", icon: "fas fa-calendar" },
    { id: "profile", name: "Profile", icon: "fas fa-user" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item, index) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === item.id ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => onViewChange(item.id)}
            data-testid={`button-mobile-nav-${item.id}`}
          >
            {index === 2 ? ( // Add button in the middle
              <>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-plus text-primary-foreground"></i>
                </div>
                <span className="text-xs">Add</span>
              </>
            ) : (
              <>
                <i className={`${item.icon} text-lg`}></i>
                <span className="text-xs">{item.name}</span>
              </>
            )}
          </Button>
        ))}
        {/* Replace middle button with Add button */}
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground absolute left-1/2 transform -translate-x-1/2"
          onClick={onNewTask}
          data-testid="button-mobile-add-task"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <i className="fas fa-plus text-primary-foreground"></i>
          </div>
          <span className="text-xs">Add</span>
        </Button>
      </div>
    </div>
  );
};
