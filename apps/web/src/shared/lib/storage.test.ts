import { describe, expect, it, beforeEach } from "vitest";
import { loadState, saveState } from "./storage";

describe("storage", () => {
  const KEY = "vitest_storage_key";

  beforeEach(() => {
    localStorage.clear();
  });

  it("saveState -> loadState roundtrip", () => {
    const state = { a: 1, b: { c: "x" } };
    saveState(KEY, state);
    expect(loadState(KEY)).toEqual(state);
  });

  it("loadState returns undefined on empty", () => {
    expect(loadState(KEY)).toBeUndefined();
  });

  it("loadState returns undefined on broken json", () => {
    localStorage.setItem(KEY, "{broken");
    expect(loadState(KEY)).toBeUndefined();
  });
});
