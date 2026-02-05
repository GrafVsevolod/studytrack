import { createSlice } from "@reduxjs/toolkit";

type UiState = {
  snackbar: { open: boolean; message: string };
};

const initialState: UiState = {
  snackbar: { open: false, message: "" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showMessage(state, action: PayloadAction<string>) {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
    },
    closeMessage(state) {
      state.snackbar.open = false;
    },
  },
});

export const { showMessage, closeMessage } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
