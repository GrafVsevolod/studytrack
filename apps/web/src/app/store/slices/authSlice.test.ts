import { describe, it, expect, beforeEach, vi } from "vitest";
import { authReducer, logout, resetAll, clearAuthError } from "./authSlice";
import { registerUser, loginUser, fetchMe } from "./authSlice";

const LS_TOKEN_KEY = "studytrack_token";

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return initial state", () => {
    const state = authReducer(undefined, { type: "unknown" });
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBe(localStorage.getItem(LS_TOKEN_KEY)); // null
  });

  it("clearAuthError clears error", () => {
    const withErr = {
      isAuthenticated: false,
      email: null,
      displayName: null,
      token: null,
      registeredAt: null,
      loading: false,
      error: "boom",
    };
    const next = authReducer(withErr as any, clearAuthError());
    expect(next.error).toBe(null);
  });

  it("logout resets session and removes token from localStorage", () => {
    localStorage.setItem(LS_TOKEN_KEY, "t");
    const authed = {
      isAuthenticated: true,
      email: "a@a.com",
      displayName: "A",
      token: "t",
      registeredAt: "x",
      loading: false,
      error: null,
    };
    const next = authReducer(authed as any, logout());
    expect(next.isAuthenticated).toBe(false);
    expect(next.token).toBe(null);
    expect(localStorage.getItem(LS_TOKEN_KEY)).toBe(null);
  });

  it("resetAll returns initial state and clears token", () => {
    localStorage.setItem(LS_TOKEN_KEY, "t");
    const state = authReducer(undefined, resetAll());
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem(LS_TOKEN_KEY)).toBe(null);
  });

  it("registerUser pending/fulfilled/rejected updates state", () => {
    const args = { email: "test@example.com", password: "123456", displayName: "Test" };

    let s = authReducer(undefined, registerUser.pending("req1", args));
    expect(s.loading).toBe(true);
    expect(s.error).toBe(null);

    s = authReducer(
      s,
      registerUser.fulfilled(
        {
          token: "jwt_token",
          user: {
            id: 1,
            email: "test@example.com",
            displayName: "Test",
            registeredAt: "2026-02-11T00:00:00.000Z",
          },
        } as any,
        "req1",
        args
      )
    );

    expect(s.loading).toBe(false);
    expect(s.isAuthenticated).toBe(true);
    expect(s.token).toBe("jwt_token");
    expect(localStorage.getItem(LS_TOKEN_KEY)).toBe("jwt_token");

    s = authReducer(
      s,
      registerUser.rejected({ name: "Err", message: "x" } as any, "req2", args, "Ошибка регистрации" as any)
    );
    expect(s.loading).toBe(false);
    expect(s.error).toBe("Ошибка регистрации");
  });

  it("loginUser fulfilled sets session and stores token", () => {
    const args = { email: "test@example.com", password: "123456" };

    let s = authReducer(undefined, loginUser.pending("req1", args));
    expect(s.loading).toBe(true);

    s = authReducer(
      s,
      loginUser.fulfilled(
        {
          token: "jwt2",
          user: {
            id: 1,
            email: "test@example.com",
            displayName: "Test",
            registeredAt: "2026-02-11T00:00:00.000Z",
          },
        } as any,
        "req1",
        args
      )
    );

    expect(s.loading).toBe(false);
    expect(s.isAuthenticated).toBe(true);
    expect(s.token).toBe("jwt2");
    expect(localStorage.getItem(LS_TOKEN_KEY)).toBe("jwt2");

    s = authReducer(
      s,
      loginUser.rejected({ name: "Err", message: "x" } as any, "req2", args, "Ошибка входа" as any)
    );
    expect(s.loading).toBe(false);
    expect(s.error).toBe("Ошибка входа");
  });

  it("fetchMe fulfilled marks authenticated and fills profile", () => {
    const prev = {
      isAuthenticated: false,
      email: null,
      displayName: null,
      token: "jwt",
      registeredAt: null,
      loading: false,
      error: null,
    };

    const next = authReducer(
      prev as any,
      fetchMe.fulfilled(
        {
          user: {
            id: 1,
            email: "me@example.com",
            displayName: "Me",
            registeredAt: "2026-02-11T00:00:00.000Z",
          },
        } as any,
        "req",
        undefined
      )
    );

    expect(next.isAuthenticated).toBe(true);
    expect(next.email).toBe("me@example.com");
    expect(next.displayName).toBe("Me");
  });

  it("registerUser thunk: network error -> rejected payload", async () => {
    // покрываем catch-ветку в thunk
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("net")));
    const thunk = registerUser({ email: "a@a.com", password: "123456", displayName: "A" });

    // минимальный fake dispatch/getState
    const dispatch = vi.fn();
    const getState = vi.fn();
    const res = await thunk(dispatch as any, getState as any, undefined as any);

    expect(res.type).toContain("rejected");
    expect((res as any).payload).toBe("Не удалось подключиться к серверу");
  });
});

it("registerUser thunk: res.ok=false -> rejected payload with server error", async () => {
  (globalThis as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: "Пользователь уже существует" }),
  });

  const thunk = registerUser({ email: "a@a.com", password: "123456", displayName: "A" });
  const dispatch = vi.fn();
  const getState = vi.fn();

  const res = await thunk(dispatch as any, getState as any, undefined as any);
  expect(res.type).toContain("rejected");
  expect((res as any).payload).toBe("Пользователь уже существует");
});

it("fetchMe thunk: no token -> rejected payload", async () => {
  const thunk = fetchMe();
  const dispatch = vi.fn();
  const getState = vi.fn().mockReturnValue({ auth: { token: null } });

  const res = await thunk(dispatch as any, getState as any, undefined as any);
  expect(res.type).toContain("rejected");
  expect((res as any).payload).toBe("Нет токена");
});

it("loginUser thunk: fetch throws -> rejected payload 'Не удалось подключиться к серверу'", async () => {
  (globalThis as any).fetch = vi.fn().mockRejectedValueOnce(new Error("network"));

  const thunk = loginUser({ email: "x@x.com", password: "123" });
  const dispatch = vi.fn();
  const getState = vi.fn();

  const res = await thunk(dispatch as any, getState as any, undefined as any);
  expect(res.type).toContain("rejected");
  expect((res as any).payload).toBe("Не удалось подключиться к серверу");
});

it("fetchMe thunk: server returns ok=false -> rejected payload with server error", async () => {
  (globalThis as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: "Невалидный токен" }),
  });

  const thunk = fetchMe();
  const dispatch = vi.fn();
  const getState = vi.fn().mockReturnValue({ auth: { token: "bad_token" } });

  const res = await thunk(dispatch as any, getState as any, undefined as any);
  expect(res.type).toContain("rejected");
  expect((res as any).payload).toBe("Невалидный токен");
});

it("fetchMe thunk: no token -> rejected 'Нет токена'", async () => {
  const thunk = fetchMe();
  const dispatch = vi.fn();
  const getState = vi.fn().mockReturnValue({ auth: { token: null } });

  const res = await thunk(dispatch as any, getState as any, undefined as any);
  expect(res.type).toContain("rejected");
  expect((res as any).payload).toBe("Нет токена");
});
