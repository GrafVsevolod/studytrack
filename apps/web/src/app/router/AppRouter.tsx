import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../../pages/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { TodayPage } from "../../pages/TodayPage";
import { GoalPage } from "../../pages/GoalPage";
import { StatsPage } from "../../pages/StatsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/today" element={<TodayPage />} />
      <Route path="/goal" element={<GoalPage />} />
      <Route path="/stats" element={<StatsPage />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
