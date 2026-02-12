import { combineReducers, configureStore, type Middleware } from "@reduxjs/toolkit";

import { authReducer, resetAll } from "./slices/authSlice";
import { tasksReducer } from "./slices/tasksSlice";
import { goalReducer } from "./slices/goalSlice";
import { uiReducer } from "./slices/uiSlice";

import { loadState, saveState } from "../../shared/lib/storage";

const PERSIST_KEY = "studytrack_state_v1";

/**
 * Персистим ТОЛЬКО tasks и goal.
 * Auth НЕ персистим — токен живёт отдельно в localStorage (studytrack_token).
 */

// ✅ middleware: если кто-то диспатчит resetAll — чистим только auth keys,
// ✅ но НЕ трогаем persisted state (tasks/goal должны жить между logout/login)
const resetAllMiddleware: Middleware = () => (next) => (action) => {
  const type =
    typeof action === "object" && action !== null && "type" in action
      ? (action as { type: string }).type
      : null;

  if (type === resetAll.type) {
    try {
      localStorage.removeItem("studytrack_token");
      localStorage.removeItem("studytrack_email");
    } catch {
      // ignore
    }
  }

  return next(action);
};

const rootReducer = combineReducers({
  auth: authReducer, // auth НЕ персистим
  tasks: tasksReducer,
  goal: goalReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// ✅ грузим persisted (только tasks/goal)
const persisted = (loadState(PERSIST_KEY) ?? {}) as {
  tasks?: RootState["tasks"];
  goal?: RootState["goal"];
};

// ✅ важный момент: НЕ задаём auth/ui в preloadedState вообще
// (иначе можно случайно перетереть initialState редьюсеров)
const preloadedState: Partial<RootState> = {
  tasks: persisted.tasks,
  goal: persisted.goal,
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(resetAllMiddleware),
});

// ✅ сохраняем только то, что должно жить между logout/login
store.subscribe(() => {
  saveState(PERSIST_KEY, {
    tasks: store.getState().tasks,
    goal: store.getState().goal,
  });
});

export type AppDispatch = typeof store.dispatch;
