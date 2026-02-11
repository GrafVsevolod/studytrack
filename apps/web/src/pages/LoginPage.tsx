import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import {
  clearAuthError,
  loginUser,
} from "../app/store/slices/authSlice";
import { clearAllTasks } from "../app/store/slices/tasksSlice";
import { resetGoal } from "../app/store/slices/goalSlice";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const auth = useAppSelector((s) => s.auth);
  const authError = auth.error;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // ✅ После успешного логина — редирект
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/today", { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  const emailTrimmed = email.trim();
  const emailValid = EMAIL_RE.test(emailTrimmed);
  const passwordValid = password.length >= 1;

  const canSubmit = emailValid && passwordValid;

  const handleLogin = () => {
    setTouched(true);
    dispatch(clearAuthError());
    if (!canSubmit) return;

    // ✅ логин под другого пользователя → чистим рабочие данные
    dispatch(clearAllTasks());
    dispatch(resetGoal());

    dispatch(loginUser({ email: emailTrimmed, password }));
    // ❗️ navigate НЕ делаем здесь — ждём auth.isAuthenticated в useEffect
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Вход
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Войди в свой аккаунт.
              </Typography>
            </Box>

            {!!authError && (
              <Typography color="error" sx={{ fontWeight: 700 }}>
                {authError}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={touched && !emailValid}
              helperText={
                touched && !emailValid
                  ? "Введите email в формате name@mail.com"
                  : " "
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />

            <TextField
              fullWidth
              type="password"
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={touched && !passwordValid}
              helperText={touched && !passwordValid ? "Введите пароль" : " "}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />

            <Button
              variant="contained"
              size="large"
              disabled={!canSubmit}
              onClick={handleLogin}
              sx={{ borderRadius: 2 }}
            >
              Войти
            </Button>

            <Button variant="text" onClick={() => navigate("/register")}>
              Нет аккаунта? Зарегистрироваться
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
