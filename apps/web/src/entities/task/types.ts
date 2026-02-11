export type TaskId = string;

export type Task = {
  id: TaskId;
  title: string;

  // план
  plannedMinutes: number;

  // факт (накапливаем по таймеру/ручным правкам)
  actualMinutes?: number;

  // если таймер запущен — хранит ISO-время старта, иначе null/undefined
  timerStartedAt?: string | null;

  // ✅ временная совместимость: если где-то в воркере/старом коде используется minutes
  // лучше потом выпилить и везде перейти на plannedMinutes/actualMinutes
  minutes?: number;

  done: boolean;
  createdAt: string; // ISO
  day: string; // YYYY-MM-DD
  goalId: string | null;
};
