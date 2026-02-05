import { createSlice } from "@reduxjs/toolkit";
import type { Task } from "../../../entities/task/types";

type TasksState = {
  items: Task[];
};

const initialState: TasksState = {
  items: [],
};

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function randomId(): string {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask(
      state,
      action: PayloadAction<{ title: string; plannedMinutes: number; day?: string; goalId?: string }>
    ) {
      const now = new Date().toISOString();
      const day = action.payload.day ?? todayISO();

      state.items.unshift({
        id: randomId(),
        title: action.payload.title.trim(),
        plannedMinutes: action.payload.plannedMinutes,
        done: false,
        createdAt: now,
        day,
        goalId: action.payload.goalId,
      });
    },
    toggleDone(state, action: PayloadAction<{ id: string }>) {
      const t = state.items.find((x) => x.id === action.payload.id);
      if (t) t.done = !t.done;
    },
    deleteTask(state, action: PayloadAction<{ id: string }>) {
      state.items = state.items.filter((x) => x.id !== action.payload.id);
    },
    linkGoal(state, action: PayloadAction<{ id: string; goalId?: string }>) {
      const t = state.items.find((x) => x.id === action.payload.id);
      if (t) t.goalId = action.payload.goalId;
    },
  },
});

export const { addTask, toggleDone, deleteTask, linkGoal } = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;
