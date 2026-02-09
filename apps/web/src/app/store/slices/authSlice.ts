import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type User = {
  email: string;
  displayName: string;
  password: string; // ⚠️ учебный проект
  registeredAt: string;
};

type AuthState = {
  // session
  isAuthenticated: boolean;
  email: string | null;
  displayName: string | null;
  token: string | null;
  registeredAt: string | null;

  // users db (local)
  users: Record<string, User>;

  // ui
  error: string | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  email: null,
  displayName: null,
  token: null,
  registeredAt: null,

  users: {},

  error: null,
};

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

function makeToken() {
  return "fake_jwt_" + Date.now();
}

// единые ключи, чтобы не путаться
const LS_TOKEN_KEY = "studytrack_token";
const LS_EMAIL_KEY = "studytrack_email";

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },

    // ✅ Register: сохраняем юзера + авто-логин
    registerUser(
      state,
      action: PayloadAction<{ email: string; password: string; displayName: string }>
    ) {
      const email = normEmail(action.payload.email);
      const password = action.payload.password;
      const displayName = action.payload.displayName.trim();

      if (!email) {
        state.error = "Email обязателен";
        return;
      }
      if (displayName.length < 2) {
        state.error = "Имя должно быть минимум 2 символа";
        return;
      }
      if (password.length < 6) {
        state.error = "Пароль должен быть минимум 6 символов";
        return;
      }
      if (state.users[email]) {
        state.error = "Пользователь с таким email уже существует";
        return;
      }

      const registeredAt = new Date().toISOString();
      state.users[email] = { email, displayName, password, registeredAt };

      // session
      state.isAuthenticated = true;
      state.email = email;
      state.displayName = displayName;
      state.registeredAt = registeredAt;
      state.token = makeToken();
      state.error = null;
    },

    // ✅ Login: проверяем по users
    loginUser(state, action: PayloadAction<{ email: string; password: string }>) {
      const email = normEmail(action.payload.email);
      const password = action.payload.password;

      const u = state.users[email];
      if (!u) {
        state.error = "Такого пользователя нет. Сначала зарегистрируйся.";
        return;
      }
      if (u.password !== password) {
        state.error = "Неверный пароль";
        return;
      }

      state.isAuthenticated = true;
      state.email = u.email;
      state.displayName = u.displayName;
      state.registeredAt = u.registeredAt;
      state.token = makeToken();
      state.error = null;
    },

    // ✅ кладём в localStorage РОВНО то, что лежит в state (без рассинхрона)
    persistSession(state) {
      if (!state.token || !state.email) return;
      localStorage.setItem(LS_TOKEN_KEY, state.token);
      localStorage.setItem(LS_EMAIL_KEY, state.email);
    },

    clearSessionStorage() {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_EMAIL_KEY);
    },

    // ✅ logout = сброс ТОЛЬКО сессии (users остаются!)
    logout(state) {
      state.isAuthenticated = false;
      state.email = null;
      state.displayName = null;
      state.token = null;
      state.registeredAt = null;
      state.error = null;
    },

    // ✅ “глобальный сброс” (например, на Logout) — но НЕ удаляем users
    resetAll(state) {
      const users = state.users;
      return {
        ...initialState,
        users,
      };
    },
  },
});

export const {
  registerUser,
  loginUser,
  logout,
  resetAll,
  clearAuthError,
  persistSession,
  clearSessionStorage,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
