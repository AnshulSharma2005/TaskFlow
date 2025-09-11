import { z } from "zod";

export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.enum(["Work", "Personal", "Shopping", "Health"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.date().optional(),
  completed: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertTaskSchema = taskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  createdAt: z.date(),
});

export const insertUserSchema = userSchema.omit({
  createdAt: true,
});

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface TaskFilters {
  category?: string;
  priority?: string;
  completed?: boolean;
  dueToday?: boolean;
}
