import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string | null;
  };
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: {
    email: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ email: string }>) {
      state.isAuthenticated = true;
      state.user.email = action.payload.email;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user.email = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
