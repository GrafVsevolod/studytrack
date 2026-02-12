import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMe, logout } from "../store/slices/authSlice";

const tabs = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Today", path: "/today" },
  { label: "My Goal", path: "/goal" },
  { label: "Statistics", path: "/statistics" },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const token = useAppSelector((s) => s.auth.token);

  // ✅ Дергаем /auth/me только если есть token
  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  const currentTab = tabs.findIndex((t) => location.pathname.startsWith(t.path));
  const value = currentTab === -1 ? false : currentTab;

  const handleLogout = () => {
    // ✅ logout должен чистить только auth (токен/почта),
    // persisted state (tasks/goal) НЕ трогаем
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
      }}
    >
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
            StudyTrack
          </Typography>

          <Tabs
            value={value}
            onChange={(_, next) => navigate(tabs[next].path)}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ flex: 1 }}
          >
            {tabs.map((t) => (
              <Tab key={t.path} label={t.label} />
            ))}
          </Tabs>

          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          pt: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="md">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
