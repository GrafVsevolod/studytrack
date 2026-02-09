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

import { useAppDispatch } from "../store/hooks";
import { resetAll } from "../store/slices/authSlice";

const tabs = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Today", path: "/today" },
  { label: "My Goal", path: "/goal" },
  { label: "Statistics", path: "/statistics" },
];

const PERSIST_KEY = "studytrack_state_v1";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentTab = tabs.findIndex((t) => location.pathname.startsWith(t.path));
  const value = currentTab === -1 ? false : currentTab;

  const handleLogout = () => {
    // ✅ чистим persisted + локальные ключи
    localStorage.removeItem(PERSIST_KEY);
    localStorage.removeItem("studytrack_token");
    localStorage.removeItem("studytrack_email");

    // ✅ сброс auth (и триггер для общего сброса, если ты это заведёшь в store)
    dispatch(resetAll());

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
