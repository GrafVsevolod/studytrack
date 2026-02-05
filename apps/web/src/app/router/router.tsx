import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../../pages/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { TodayPage } from "../../pages/TodayPage";
import { GoalPage } from "../../pages/GoalPage";
import { StatsPage } from "../../pages/StatsPage";

/**
 * Пока без настоящей авторизации.
 * Потом заменим на селектор из Redux authSlice.
 */
const isAuthed = () => {
  return Boolean(localStorage.getItem("studytrack_token"));
};

function Protected({ children }: { children: React.ReactNode }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    path: "/dashboard",
    element: (
      <Protected>
        <DashboardPage />
      </Protected>
    ),
  },
  {
    path: "/today",
    element: (
      <Protected>
        <TodayPage />
      </Protected>
    ),
  },
  {
    path: "/goal",
    element: (
      <Protected>
        <GoalPage />
      </Protected>
    ),
  },
  {
    path: "/stats",
    element: (
      <Protected>
        <StatsPage />
      </Protected>
    ),
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
