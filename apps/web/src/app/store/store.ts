import { configureStore } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";

import { authReducer } from "./slices/authSlice";
import { tasksReducer } from "./slices/tasksSlice";
import { goalReducer } from "./slices/goalSlice";
import { uiReducer } from "./slices/uiSlice";

import { loadState, saveState } from "../../shared/lib/storage";
import { resetAll } from "./slices/authSlice";

const PERSIST_KEY = "studytrack_state_v1";

// ✅ чтобы после resetAll мы не записали обратно "пустой" стейт тем же ключом
let skipNextPersist = false;

// ✅ middleware: при resetAll чистим persisted state + localStorage session keys
const resetAllMiddleware: Middleware = () => (next) => (action) => {
  const type =
    typeof action === "object" && action !== null && "type" in action
      ? (action as { type: string }).type
      : null;

  if (type === resetAll.type) {
    try {
      // чистим persisted redux state
      localStorage.removeItem(PERSIST_KEY);

      // чистим session keys (логин/токен), чтобы роут-гард не считал что ты залогинен
      localStorage.removeItem("studytrack_token");
      localStorage.removeItem("studytrack_email");
    } catch {
      // ignore
    }
    skipNextPersist = true;
  }

  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    goal: goalReducer,
    ui: uiReducer,
  },
  preloadedState: loadState(PERSIST_KEY),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ localStorage/Date/и т.п. — чтобы не ловить лишние варнинги
    }).concat(resetAllMiddleware),
});

store.subscribe(() => {
  if (skipNextPersist) {
    skipNextPersist = false;
    return;
  }

  saveState(PERSIST_KEY, {
    auth: store.getState().auth,
    tasks: store.getState().tasks,
    goal: store.getState().goal,
  });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
