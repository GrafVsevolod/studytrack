import { describe, it, expect } from "vitest";
import { goalReducer, setGoalTitle, setTargetMinutes, resetGoal } from "./goalSlice";

describe("goalSlice", () => {
  it("setGoalTitle / setTargetMinutes", () => {
    let state = goalReducer(undefined, setGoalTitle("New Goal"));
    expect(state.title).toBe("New Goal");

    state = goalReducer(state, setTargetMinutes(120));
    expect(state.targetMinutes).toBe(120);
  });

  it("resetGoal возвращает initialState", () => {
    let state = goalReducer(undefined, setGoalTitle("X"));
    state = goalReducer(state, setTargetMinutes(50));

    state = goalReducer(state, resetGoal());

    expect(state.id).toBe("main");
    expect(state.title).toBe("Моя цель");
    expect(state.targetMinutes).toBe(0);
  });
});
