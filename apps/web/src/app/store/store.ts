import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "./slices/authSlice";
import { tasksReducer } from "./slices/tasksSlice";
import { goalReducer } from "./slices/goalSlice";
import { uiReducer } from "./slices/uiSlice";

import { loadState, saveState } from "../../shared/lib/storage";

const PERSIST_KEY = "studytrack_state_v1";

/**
 * Персистим ТОЛЬКО tasks и goal.
 * Auth НЕ персистим — токен живёт отдельно в localStorage (studytrack_token).
 */

type PersistedState = {
  tasks?: ReturnType<typeof tasksReducer>;
  goal?: ReturnType<typeof goalReducer>;
};

const preloaded = (loadState(PERSIST_KEY) as PersistedState | undefined) ?? {};

export const store = configureStore({
  reducer: {
    auth: authReducer, // auth НЕ персистим
    tasks: tasksReducer,
    goal: goalReducer,
    ui: uiReducer,
  },
  preloadedState: {
    tasks: preloaded.tasks,
    goal: preloaded.goal,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// сохраняем только то, что должно жить между logout/login
store.subscribe(() => {
  saveState(PERSIST_KEY, {
    tasks: store.getState().tasks,
    goal: store.getState().goal,
  });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
