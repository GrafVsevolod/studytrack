import { createSlice } from "@reduxjs/toolkit";
import type { Goal } from "../../../features/goal/types";

type GoalState = {
  current: Goal;
};

const initialState: GoalState = {
  current: {
    id: "default",
    title: "Моя цель",
    targetMinutesPerDay: 60,
  },
};

const goalSlice = createSlice({
  name: "goal",
  initialState,
  reducers: {
    setGoalTitle(state, action: PayloadAction<string>) {
      state.current.title = action.payload;
    },
    setTargetMinutesPerDay(state, action: PayloadAction<number>) {
      state.current.targetMinutesPerDay = action.payload;
    },
  },
});

export const { setGoalTitle, setTargetMinutesPerDay } = goalSlice.actions;
export const goalReducer = goalSlice.reducer;
