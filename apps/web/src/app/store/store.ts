import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "./slices/authSlice";
import { tasksReducer } from "./slices/tasksSlice";
import { goalReducer } from "./slices/goalSlice";
import { uiReducer } from "./slices/uiSlice";
import { loadState, saveState } from "../../shared/lib/storage";

const PERSIST_KEY = "studytrack_state_v1";

const preloadedState = loadState(PERSIST_KEY);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    goal: goalReducer,
    ui: uiReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  saveState(PERSIST_KEY, store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
