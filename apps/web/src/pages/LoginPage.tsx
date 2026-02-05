import { Container, Typography, Box, TextField, Button, Link } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = () => {
    // временно — позже заменим на API + Redux
    localStorage.setItem("studytrack_token", "demo-token");
    localStorage.setItem("studytrack_user", JSON.stringify({ email }));
    nav("/dashboard");
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Box sx={{ p: 3, boxShadow: 1, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          StudyTrack — Вход
        </Typography>

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Пароль"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={onLogin} disabled={!email || !password}>
          Войти
        </Button>

        <Box sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/register">
            Нет аккаунта? Зарегистрироваться
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
