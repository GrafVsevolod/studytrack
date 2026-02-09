// src/app/workers/stats.worker.ts
import type { Task } from "../../entities/task/types";

export type StatsRequest = {
  tasks: Task[];
};

export type StatsResponse = {
  total: number;
  done: number;
  active: number;
  doneMinutes: number;
  plannedMinutes: number;
  progress: number; // 0..100
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

self.onmessage = (event: MessageEvent<StatsRequest>) => {
  const tasks = event.data.tasks || [];

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const active = total - done;

  const doneMinutes = tasks.filter((t) => t.done).reduce((s, t) => s + (t.minutes ?? 0), 0);
  const plannedMinutes = tasks.reduce((s, t) => s + (t.minutes ?? 0), 0);

  const progress = total === 0 ? 0 : clamp(Math.round((done / total) * 100), 0, 100);

  const result: StatsResponse = {
    total,
    done,
    active,
    doneMinutes,
    plannedMinutes,
    progress,
  };

  postMessage(result);
};
