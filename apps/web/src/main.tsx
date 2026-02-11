import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/react";
import { store } from "./app/store/store";
import App from "./App";
import "./index.css";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const appEnv = (import.meta.env.VITE_APP_ENV as string | undefined) ?? "local";

// 1) Никогда не включаем Sentry в unit-тестах
const isVitest = import.meta.env.MODE === "test";

// 2) В e2e тоже лучше выключать (чтобы не мешал и не слал лишнего)
const isPlaywright =
  typeof navigator !== "undefined" &&
  /Playwright/i.test(navigator.userAgent || "");

// 3) Включаем только если есть DSN и мы не в тестовой среде
if (dsn && !isVitest && !isPlaywright) {
  Sentry.init({
    dsn,
    environment: appEnv,

    // В проде всегда включено.
    // В dev — по умолчанию выключено, но можно включить флагом VITE_SENTRY_ENABLED=1
    enabled:
      import.meta.env.PROD ||
      (import.meta.env.VITE_SENTRY_ENABLED as string | undefined) === "1",

    tracesSampleRate: 0.1,
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
