import { RouterProvider } from "react-router-dom";
import { router } from "./app/router/router";
import * as Sentry from "@sentry/react";

const isDev = import.meta.env.DEV;

export default function App() {
  return (
    <div>
      {isDev && (
        <>
          {/* -------- Sentry тест -------- */}
          <button
            style={{
              position: "fixed",
              top: 10,
              left: 10,
              zIndex: 999999,
              pointerEvents: "auto",
              background: "#ff4d4f",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => {
              Sentry.captureException(
                new Error("🔥 Test crash for Sentry (controlled)")
              );

              setTimeout(() => {
                throw new Error("🔥 Hard crash for Sentry");
              }, 0);
            }}
          >
            Crash (Sentry)
          </button>

          {/* -------- Web API: Clipboard + Notifications -------- */}
          <button
            style={{
              position: "fixed",
              top: 50,
              left: 10,
              zIndex: 999999,
              background: "#1677ff",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={async () => {
              // Clipboard API
              await navigator.clipboard.writeText(
                "StudyTrack — лучший трекер задач 🚀"
              );

              // Notifications API
              if ("Notification" in window) {
                const permission =
                  await Notification.requestPermission();
                if (permission === "granted") {
                  new Notification("Скопировано!", {
                    body: "Текст сохранён в буфер обмена",
                  });
                }
              }
            }}
          >
            Copy + Notify
          </button>
        </>
      )}

      <RouterProvider router={router} />
    </div>
  );
}
