import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TaskFilters as FilterType } from "@/lib/firebase";

interface TaskFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export const TaskFilters = ({ filters, onFiltersChange }: TaskFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, searchTerm: searchTerm || undefined });
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (key: keyof FilterType, value: any) => {
    onFiltersChange({ ...filters, [key]: value === 'all' ? undefined : value });
  };

  const clearFilters = () => {
    setSearchTerm("");
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(v => v !== undefined).length;
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
          <i className="fas fa-filter text-primary-foreground text-sm"></i>
        </div>
        <h3 className="text-lg font-semibold text-foreground">Search & Filter Tasks</h3>
        {getActiveFiltersCount() > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              {getActiveFiltersCount()} active
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Enhanced Search Input */}
        <div className="flex-1">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <i className="fas fa-search text-muted-foreground group-focus-within:text-primary transition-colors"></i>
            </div>
            <Input
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 pr-4 h-12 bg-card/50 border-border/50 rounded-xl text-base placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              data-testid="input-task-search"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Filter Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <div className="relative">
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-[160px] h-12 bg-card/50 border-border/50 rounded-xl hover:bg-card transition-colors" data-testid="select-filter-category">
                <div className="flex items-center gap-2">
                  <i className="fas fa-tag text-muted-foreground text-sm"></i>
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="w-[160px]">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Work">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-briefcase text-blue-500 text-sm"></i>
                    Work
                  </div>
                </SelectItem>
                <SelectItem value="Personal">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-user text-green-500 text-sm"></i>
                    Personal
                  </div>
                </SelectItem>
                <SelectItem value="Shopping">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-shopping-cart text-purple-500 text-sm"></i>
                    Shopping
                  </div>
                </SelectItem>
                <SelectItem value="Health">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-heart text-red-500 text-sm"></i>
                    Health
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger className="w-[160px] h-12 bg-card/50 border-border/50 rounded-xl hover:bg-card transition-colors" data-testid="select-filter-priority">
                <div className="flex items-center gap-2">
                  <i className="fas fa-flag text-muted-foreground text-sm"></i>
                  <SelectValue placeholder="Priority" />
                </div>
              </SelectTrigger>
              <SelectContent className="w-[160px]">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle text-red-500 text-sm"></i>
                    High
                  </div>
                </SelectItem>
                <SelectItem value="Medium">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock text-amber-500 text-sm"></i>
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="Low">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check-circle text-green-500 text-sm"></i>
                    Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date Filter */}
          <div className="relative">
            <Select
              value={filters.dueDate || 'all'}
              onValueChange={(value) => handleFilterChange('dueDate', value)}
            >
              <SelectTrigger className="w-[160px] h-12 bg-card/50 border-border/50 rounded-xl hover:bg-card transition-colors" data-testid="select-filter-due-date">
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-muted-foreground text-sm"></i>
                  <SelectValue placeholder="Due Date" />
                </div>
              </SelectTrigger>
              <SelectContent className="w-[160px]">
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="overdue">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-exclamation-circle text-red-500 text-sm"></i>
                    Overdue
                  </div>
                </SelectItem>
                <SelectItem value="today">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-today text-blue-500 text-sm"></i>
                    Today
                  </div>
                </SelectItem>
                <SelectItem value="tomorrow">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-arrow-right text-indigo-500 text-sm"></i>
                    Tomorrow
                  </div>
                </SelectItem>
                <SelectItem value="thisWeek">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-calendar-week text-purple-500 text-sm"></i>
                    This Week
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Select
              value={filters.completed === undefined ? 'all' : filters.completed ? 'completed' : 'pending'}
              onValueChange={(value) => {
                const completedValue = value === 'all' ? undefined : value === 'completed';
                handleFilterChange('completed', completedValue);
              }}
            >
              <SelectTrigger className="w-[160px] h-12 bg-card/50 border-border/50 rounded-xl hover:bg-card transition-colors" data-testid="select-filter-status">
                <div className="flex items-center gap-2">
                  <i className="fas fa-tasks text-muted-foreground text-sm"></i>
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="w-[160px]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock text-amber-500 text-sm"></i>
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 text-sm"></i>
                    Completed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {getActiveFiltersCount() > 0 && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="h-12 px-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-200/50 dark:border-red-800/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-105"
              data-testid="button-clear-filters"
            >
              <i className="fas fa-times mr-2"></i>
              Clear All ({getActiveFiltersCount()})
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <i className="fas fa-filter text-muted-foreground text-sm"></i>
            <span className="text-sm font-semibold text-muted-foreground">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {filters.searchTerm && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded-lg">
                <i className="fas fa-search text-blue-600 dark:text-blue-400 text-xs"></i>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  "{filters.searchTerm}"
                </span>
                <button
                  onClick={() => handleFilterChange('searchTerm', undefined)}
                  className="ml-2 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  data-testid="button-remove-filter-search"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            )}
            {filters.category && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/30 rounded-lg">
                <i className="fas fa-tag text-purple-600 dark:text-purple-400 text-xs"></i>
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                  {filters.category}
                </span>
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className="ml-2 w-4 h-4 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                  data-testid="button-remove-filter-category"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            )}
            {filters.priority && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200/50 dark:border-orange-800/30 rounded-lg">
                <i className="fas fa-flag text-orange-600 dark:text-orange-400 text-xs"></i>
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  {filters.priority} Priority
                </span>
                <button
                  onClick={() => handleFilterChange('priority', undefined)}
                  className="ml-2 w-4 h-4 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                  data-testid="button-remove-filter-priority"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            )}
            {filters.dueDate && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/30 rounded-lg">
                <i className="fas fa-calendar-alt text-green-600 dark:text-green-400 text-xs"></i>
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Due: {filters.dueDate === 'thisWeek' ? 'This Week' : filters.dueDate.charAt(0).toUpperCase() + filters.dueDate.slice(1)}
                </span>
                <button
                  onClick={() => handleFilterChange('dueDate', undefined)}
                  className="ml-2 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                  data-testid="button-remove-filter-due-date"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            )}
            {filters.completed !== undefined && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-200/50 dark:border-teal-800/30 rounded-lg">
                <i className="fas fa-tasks text-teal-600 dark:text-teal-400 text-xs"></i>
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                  {filters.completed ? 'Completed' : 'Pending'}
                </span>
                <button
                  onClick={() => handleFilterChange('completed', undefined)}
                  className="ml-2 w-4 h-4 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors"
                  data-testid="button-remove-filter-status"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};