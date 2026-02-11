import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/react";
import { store } from "./app/store/store";
import App from "./App";
import "./index.css";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const appEnv =
  (import.meta.env.VITE_APP_ENV as string | undefined) ?? "local";

// Не включаем Sentry в тестах и Playwright
const isTestLike =
  import.meta.env.MODE === "test" ||
  (import.meta.env.MODE as string) === "vitest" ||
  (typeof navigator !== "undefined" &&
    /Playwright/i.test(navigator.userAgent || ""));

if (dsn && !isTestLike) {
  Sentry.init({
    dsn,
    environment: appEnv,
    enabled: import.meta.env.PROD, // включаем только в проде
    tracesSampleRate: 0.1,
  });
}

// -------- RENDER --------

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
