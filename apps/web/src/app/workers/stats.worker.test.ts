import { describe, it, expect, vi } from "vitest";

// важно: импорт должен быть ДО использования self.onmessage
import "../workers/stats.worker";

describe("stats.worker", () => {
  it("считает статистику", () => {
    const postMessageMock = vi.fn();
    (globalThis as any).postMessage = postMessageMock;

    const tasks = [
      {
        id: "1",
        title: "A",
        plannedMinutes: 25,
        actualMinutes: 10,
        timerStartedAt: null,
        done: true,
        createdAt: "2026-02-11T10:00:00.000Z",
        day: "2026-02-11",
        goalId: null,
      },
      {
        id: "2",
        title: "B",
        plannedMinutes: 50,
        actualMinutes: 0,
        timerStartedAt: null,
        done: false,
        createdAt: "2026-02-11T10:00:00.000Z",
        day: "2026-02-11",
        goalId: null,
      },
    ];

    // дергаем обработчик как будто воркер получил сообщение
    (self as any).onmessage({ data: { tasks } });

    expect(postMessageMock).toHaveBeenCalledTimes(1);

    const payload = postMessageMock.mock.calls[0][0];

    expect(payload.total).toBe(2);
    expect(payload.done).toBe(1);
    expect(payload.active).toBe(1);
    expect(payload.plannedMinutes).toBe(75);
    expect(payload.doneMinutes).toBe(10);
    expect(payload.progress).toBe(50);
  });
});

it("stats.worker: empty tasks -> progress 0 and minutes 0", () => {
  const postMessage = vi.fn();
  (globalThis as any).postMessage = postMessage;

  // эмулируем onmessage
  (globalThis as any).self.onmessage({ data: { tasks: [] } });

  expect(postMessage).toHaveBeenCalledWith({
    total: 0,
    done: 0,
    active: 0,
    doneMinutes: 0,
    plannedMinutes: 0,
    progress: 0,
  });
});
