import { describe, it, expect } from "vitest";
import { uiReducer, showMessage, closeMessage } from "./uiSlice";

describe("uiSlice", () => {
  it("showMessage открывает snackbar и ставит message", () => {
    const state = uiReducer(undefined, showMessage("Hello"));
    expect(state.snackbar.open).toBe(true);
    expect(state.snackbar.message).toBe("Hello");
  });

  it("closeMessage закрывает snackbar", () => {
    let state = uiReducer(undefined, showMessage("Hello"));
    state = uiReducer(state, closeMessage());
    expect(state.snackbar.open).toBe(false);
  });
});
