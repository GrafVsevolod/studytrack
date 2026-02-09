import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Task } from "../../../entities/task/types";

type TasksState = {
  items: Task[];
};

const initialState: TasksState = {
  items: [],
};

function makeId() {
  // достаточно для лабы, без доп. зависимостей
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayYmd() {
  // YYYY-MM-DD
  return new Date().toISOString().slice(0, 10);
}

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: {
      reducer: (state, action: PayloadAction<Task>) => {
        state.items.unshift(action.payload);
      },
      prepare: (text: string) => {
        const now = new Date().toISOString();
        const task: Task = {
          id: makeId(),
          title: text.trim(),
          plannedMinutes: 25, // дефолт оставляем
          actualMinutes: 0, // ✅ B1 — новое поле
          timerStartedAt: null, // ✅ B1 — новое поле
          done: false,
          createdAt: now,
          day: todayYmd(),
          goalId: null,
        };
        return { payload: task };
      },
    },

    toggleTaskDone: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const t = state.items.find((x) => x.id === id);
      if (!t) return;
      t.done = !t.done;
    },

    removeTask: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.items = state.items.filter((x) => x.id !== id);
    },

    linkGoal: (
      state,
      action: PayloadAction<{ taskId: string; goalId: string | null }>
    ) => {
      const { taskId, goalId } = action.payload;
      const t = state.items.find((x) => x.id === taskId);
      if (!t) return;
      t.goalId = goalId;
    },

    setPlannedMinutes: (
      state,
      action: PayloadAction<{ taskId: string; minutes: number }>
    ) => {
      const { taskId, minutes } = action.payload;
      const t = state.items.find((x) => x.id === taskId);
      if (!t) return;

      t.plannedMinutes = Math.max(0, Math.round(minutes));
    },

    // ===================== 🔥 B1 — ТАЙМЕР =====================

    startTimer: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const t = state.items.find((x) => x.id === id);
      if (!t) return;

      // если уже идёт — не перезапускаем
      if (t.timerStartedAt) return;

      t.timerStartedAt = new Date().toISOString();
    },

    stopTimer: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const t = state.items.find((x) => x.id === id);
      if (!t || !t.timerStartedAt) return;

      const started = new Date(t.timerStartedAt).getTime();
      const now = Date.now();

      const diffMinutes = Math.round((now - started) / 60000);

      t.actualMinutes = (t.actualMinutes ?? 0) + Math.max(0, diffMinutes);
      t.timerStartedAt = null;
    },

    // =========================================================

    clearDone: (state) => {
      state.items = state.items.filter((x) => !x.done);
    },

    // ✅ 🔥 NEW — очищаем ВСЕ задачи (используем при register/login/logout)
    clearAllTasks: (state) => {
      state.items = [];
    },
  },
});

export const {
  addTask,
  toggleTaskDone,
  removeTask,
  linkGoal,
  clearDone,
  setPlannedMinutes,
  startTimer,
  stopTimer,
  clearAllTasks,
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;
