export type TaskId = string;

export type Task = {
  id: TaskId;
  title: string;
  plannedMinutes: number;
  done: boolean;
  createdAt: string; // ISO
  day: string; // YYYY-MM-DD
  goalId?: string;
};
