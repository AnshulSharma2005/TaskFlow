import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createTask, updateTask } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { Task, InsertTask } from "@shared/schema";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onTaskSaved: () => void;
}

export const TaskModal = ({ open, onOpenChange, task, onTaskSaved }: TaskModalProps) => {
  const [formData, setFormData] = useState<Partial<InsertTask>>({
    title: task?.title || "",
    description: task?.description || "",
    category: task?.category || "Work",
    priority: task?.priority || "Medium",
    dueDate: task?.dueDate || undefined,
    completed: task?.completed || false,
  });
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const taskData: InsertTask = {
        ...formData,
        userId: currentUser.uid,
        title: formData.title!,
        category: formData.category!,
        priority: formData.priority!,
        completed: formData.completed!,
      };

      if (task) {
        await updateTask(task.id, taskData);
        toast({
          title: "Task updated successfully!",
          description: "Your task has been updated.",
        });
      } else {
        await createTask(taskData);
        toast({
          title: "Task created successfully!",
          description: "Your new task has been added.",
        });
      }

      onTaskSaved();
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        category: "Work",
        priority: "Medium",
        dueDate: undefined,
        completed: false,
      });
    } catch (error: any) {
      toast({
        title: "Failed to save task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
              data-testid="input-task-title"
            />
          </div>

          <div>
            <Label htmlFor="task-description">Description (Optional)</Label>
            <Textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
              data-testid="textarea-task-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as any })}
              >
                <SelectTrigger data-testid="select-task-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
              >
                <SelectTrigger data-testid="select-task-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="task-due-date">Due Date</Label>
            <Input
              type="datetime-local"
              id="task-due-date"
              value={formatDateForInput(formData.dueDate)}
              onChange={(e) => 
                setFormData({ 
                  ...formData, 
                  dueDate: e.target.value ? new Date(e.target.value) : undefined 
                })
              }
              data-testid="input-task-due-date"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading} data-testid="button-save-task">
              {loading ? "Saving..." : task ? "Update Task" : "Add Task"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-task"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
