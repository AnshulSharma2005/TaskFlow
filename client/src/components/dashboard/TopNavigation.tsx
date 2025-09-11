import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { TaskStats } from "@shared/schema";

interface TopNavigationProps {
  stats: TaskStats;
}

export const TopNavigation = ({ stats }: TopNavigationProps) => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logOut();
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return userProfile?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-tasks text-primary-foreground"></i>
          </div>
          <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* User Stats */}
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span data-testid="text-completed-today">{stats.completed} completed today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span data-testid="text-pending-tasks">{stats.pending} pending</span>
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 p-2" data-testid="button-user-menu">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-secondary-foreground" data-testid="text-user-initials">
                    {getInitials()}
                  </span>
                </div>
                <i className="fas fa-chevron-down text-muted-foreground"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <div className="flex flex-col">
                  <span className="font-medium">{userProfile?.displayName || "User"}</span>
                  <span className="text-sm text-muted-foreground">{userProfile?.email}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} disabled={loading} data-testid="button-logout">
                <i className="fas fa-sign-out-alt mr-2"></i>
                {loading ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
