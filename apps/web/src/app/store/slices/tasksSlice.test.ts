import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { tasksReducer, addTask, toggleTaskDone, removeTask, linkGoal, setPlannedMinutes, clearDone, clearAllTasks, startTimer, stopTimer } from "./tasksSlice";

describe("tasksSlice", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-11T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("addTask creates task with defaults and trims title", () => {
    const s = tasksReducer(undefined, addTask("  hello  "));
    expect(s.items.length).toBe(1);
    expect(s.items[0].title).toBe("hello");
    expect(s.items[0].plannedMinutes).toBe(25);
    expect(s.items[0].actualMinutes).toBe(0);
    expect(s.items[0].timerStartedAt).toBe(null);
    expect(s.items[0].done).toBe(false);
    expect(s.items[0].day).toBe("2026-02-11");
  });

  it("toggleTaskDone flips done", () => {
    let s = tasksReducer(undefined, addTask("t1"));
    const id = s.items[0].id;

    s = tasksReducer(s, toggleTaskDone(id));
    expect(s.items[0].done).toBe(true);

    s = tasksReducer(s, toggleTaskDone(id));
    expect(s.items[0].done).toBe(false);
  });

  it("removeTask deletes by id", () => {
    let s = tasksReducer(undefined, addTask("t1"));
    const id = s.items[0].id;

    s = tasksReducer(s, removeTask(id));
    expect(s.items.length).toBe(0);
  });

  it("linkGoal sets and clears goalId", () => {
    let s = tasksReducer(undefined, addTask("t1"));
    const id = s.items[0].id;

    s = tasksReducer(s, linkGoal({ taskId: id, goalId: "main" }));
    expect(s.items[0].goalId).toBe("main");

    s = tasksReducer(s, linkGoal({ taskId: id, goalId: null }));
    expect(s.items[0].goalId).toBe(null);
  });

  it("setPlannedMinutes rounds and clamps to >=0", () => {
    let s = tasksReducer(undefined, addTask("t1"));
    const id = s.items[0].id;

    s = tasksReducer(s, setPlannedMinutes({ taskId: id, minutes: 10.4 }));
    expect(s.items[0].plannedMinutes).toBe(10);

    s = tasksReducer(s, setPlannedMinutes({ taskId: id, minutes: -5 }));
    expect(s.items[0].plannedMinutes).toBe(0);
  });

  it("clearDone removes done tasks", () => {
    let s = tasksReducer(undefined, addTask("t1"));
    const id = s.items[0].id;
    s = tasksReducer(s, toggleTaskDone(id)); // done = true
    s = tasksReducer(s, addTask("t2")); // second task (unshift) => first is t2

    s = tasksReducer(s, clearDone());
    expect(s.items.length).toBe(1);
    expect(s.items[0].title).toBe("t2");
  });

  it("clearAllTasks empties state", () => {
    let s = tasksReducer(undefined, addTask("t1"));
    s = tasksReducer(s, addTask("t2"));
    expect(s.items.length).toBe(2);

    s = tasksReducer(s, clearAllTasks());
    expect(s.items.length).toBe(0);
  });

  it("timer: startTimer sets timerStartedAt once, stopTimer adds minutes and clears timerStartedAt", () => {
    let s = tasksReducer(undefined, addTask("t1"));
    const id = s.items[0].id;

    s = tasksReducer(s, startTimer(id));
    const startedAt = s.items[0].timerStartedAt;
    expect(startedAt).toBeTruthy();

    // повторный startTimer не должен менять startedAt
    s = tasksReducer(s, startTimer(id));
    expect(s.items[0].timerStartedAt).toBe(startedAt);

    // +5 минут
    vi.advanceTimersByTime(5 * 60 * 1000);

    s = tasksReducer(s, stopTimer(id));
    expect(s.items[0].timerStartedAt).toBe(null);
    expect(s.items[0].actualMinutes).toBe(5);
  });

  it("stopTimer does nothing if timer not started", () => {
    let s = tasksReducer(undefined, addTask("t1"));
    const id = s.items[0].id;

    const before = s.items[0].actualMinutes;
    s = tasksReducer(s, stopTimer(id));
    expect(s.items[0].actualMinutes).toBe(before);
  });
});
