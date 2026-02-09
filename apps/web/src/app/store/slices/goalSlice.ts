import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type GoalState = {
  id: string; // фиксируем один id для лабы
  title: string;
  targetMinutes: number; // одно поле, без “perDay” и т.п.
};

const initialState: GoalState = {
  id: "main",
  title: "Моя цель",
  targetMinutes: 0,
};

const goalSlice = createSlice({
  name: "goal",
  initialState,
  reducers: {
    setGoalTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    setTargetMinutes(state, action: PayloadAction<number>) {
      state.targetMinutes = action.payload;
    },
    resetGoal() {
      return initialState;
    },
  },
});

export const { setGoalTitle, setTargetMinutes, resetGoal } = goalSlice.actions;
export const goalReducer = goalSlice.reducer;
