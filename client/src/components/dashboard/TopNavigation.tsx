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
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border/50 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-tasks text-primary-foreground text-lg" aria-hidden="true"></i>
            </div>
            <div className="absolute inset-0 gradient-primary rounded-xl opacity-30 blur-sm animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">TaskFlow</h1>
            <p className="text-xs text-muted-foreground font-medium">Stay organized, stay productive</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Enhanced User Stats */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/30">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400" data-testid="text-completed-total">
                {stats.completed} completed total
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400" data-testid="text-pending-tasks">
                {stats.pending} pending
              </span>
            </div>
          </div>

          {/* Enhanced User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 p-2 hover:bg-secondary/80 rounded-xl transition-all duration-200 hover:scale-105" 
                data-testid="button-user-menu"
              >
                <div className="relative">
                  <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-primary-foreground" data-testid="text-user-initials">
                      {getInitials()}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-foreground">{userProfile?.displayName || "User"}</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
                <i className="fas fa-chevron-down text-muted-foreground text-xs transition-transform duration-200 group-hover:rotate-180" aria-hidden="true"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 p-2 bg-card/95 backdrop-blur-sm border border-border/50 shadow-xl"
            >
              <DropdownMenuItem className="p-3 rounded-lg" disabled>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">
                      {getInitials()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{userProfile?.displayName || "User"}</span>
                    <span className="text-sm text-muted-foreground">{userProfile?.email}</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <div className="h-px bg-border/50 my-2"></div>
              <DropdownMenuItem 
                onClick={handleLogout} 
                disabled={loading} 
                data-testid="button-logout"
                className="p-3 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'} mr-3`} aria-hidden="true"></i>
                {loading ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
