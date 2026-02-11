import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = "http://localhost:4000";

const LS_TOKEN_KEY = "studytrack_token";

type AuthState = {
  isAuthenticated: boolean;
  email: string | null;
  displayName: string | null;
  token: string | null;
  registeredAt: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  email: null,
  displayName: null,
  token: localStorage.getItem(LS_TOKEN_KEY),
  registeredAt: null,
  loading: false,
  error: null,
};

/**
 * ============= THUNKS (реальные запросы на сервер) =============
 */

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    body: { email: string; password: string; displayName: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || "Ошибка регистрации");
      }

      return data; // { token, user }
    } catch {
      return rejectWithValue("Не удалось подключиться к серверу");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    body: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || "Ошибка входа");
      }

      return data; // { token, user }
    } catch {
      return rejectWithValue("Не удалось подключиться к серверу");
    }
  }
);

// загрузка текущего пользователя по токену
export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;

    if (!token) return rejectWithValue("Нет токена");

    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || "Невалидный токен");
      }

      return data; // { user }
    } catch {
      return rejectWithValue("Не удалось подключиться к серверу");
    }
  }
);

/**
 * ============= SLICE =============
 */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },

    logout(state) {
      state.isAuthenticated = false;
      state.email = null;
      state.displayName = null;
      state.token = null;
      state.registeredAt = null;
      state.error = null;
      localStorage.removeItem(LS_TOKEN_KEY);
    },

    resetAll() {
      localStorage.removeItem(LS_TOKEN_KEY);
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      // ===== REGISTER =====
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { token, user } = action.payload;

        state.loading = false;
        state.isAuthenticated = true;
        state.token = token;
        state.email = user.email;
        state.displayName = user.displayName;
        state.registeredAt = user.registeredAt;
        state.error = null;

        localStorage.setItem(LS_TOKEN_KEY, token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ===== LOGIN =====
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, user } = action.payload;

        state.loading = false;
        state.isAuthenticated = true;
        state.token = token;
        state.email = user.email;
        state.displayName = user.displayName;
        state.registeredAt = user.registeredAt;
        state.error = null;

        localStorage.setItem(LS_TOKEN_KEY, token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ===== ME =====
      .addCase(fetchMe.fulfilled, (state, action) => {
        const { user } = action.payload;
        state.isAuthenticated = true;
        state.email = user.email;
        state.displayName = user.displayName;
        state.registeredAt = user.registeredAt;
      });
  },
});

export const { logout, resetAll, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
