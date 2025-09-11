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
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              data-testid="input-task-search"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-filter-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) => handleFilterChange('priority', value)}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-filter-priority">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Due Date Filter */}
          <Select
            value={filters.dueDate || 'all'}
            onValueChange={(value) => handleFilterChange('dueDate', value)}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-filter-due-date">
              <SelectValue placeholder="Due Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.completed === undefined ? 'all' : filters.completed ? 'completed' : 'pending'}
            onValueChange={(value) => {
              const completedValue = value === 'all' ? undefined : value === 'completed';
              handleFilterChange('completed', completedValue);
            }}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {getActiveFiltersCount() > 0 && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <i className="fas fa-times mr-2"></i>
              Clear ({getActiveFiltersCount()})
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.searchTerm}"
              <button
                onClick={() => handleFilterChange('searchTerm', undefined)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                data-testid="button-remove-filter-search"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Category: {filters.category}
              <button
                onClick={() => handleFilterChange('category', undefined)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                data-testid="button-remove-filter-category"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="gap-1">
              Priority: {filters.priority}
              <button
                onClick={() => handleFilterChange('priority', undefined)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                data-testid="button-remove-filter-priority"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </Badge>
          )}
          {filters.dueDate && (
            <Badge variant="secondary" className="gap-1">
              Due: {filters.dueDate === 'thisWeek' ? 'This Week' : filters.dueDate.charAt(0).toUpperCase() + filters.dueDate.slice(1)}
              <button
                onClick={() => handleFilterChange('dueDate', undefined)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                data-testid="button-remove-filter-due-date"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </Badge>
          )}
          {filters.completed !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.completed ? 'Completed' : 'Pending'}
              <button
                onClick={() => handleFilterChange('completed', undefined)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                data-testid="button-remove-filter-status"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};