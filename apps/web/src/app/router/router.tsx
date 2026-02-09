import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { LoginPage } from "../../pages/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { TodayPage } from "../../pages/TodayPage";
import { GoalPage } from "../../pages/GoalPage";
import { StatsPage } from "../../pages/StatsPage";

import { AppLayout } from "../layout/AppLayout";
import { useAppSelector } from "../store/hooks";

function Protected({ children }: { children: React.ReactNode }) {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated);
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    path: "/",
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "today", element: <TodayPage /> },
      { path: "goal", element: <GoalPage /> },

      // ✅ основной
      { path: "stats", element: <StatsPage /> },

      // ✅ алиас, если где-то осталась старая ссылка
      { path: "statistics", element: <Navigate to="/stats" replace /> },

      { index: true, element: <Navigate to="/dashboard" replace /> },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
