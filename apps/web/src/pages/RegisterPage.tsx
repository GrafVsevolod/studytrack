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
  registerUser,
  persistSession,
} from "../app/store/slices/authSlice";
import { clearAllTasks } from "../app/store/slices/tasksSlice";
import { resetGoal } from "../app/store/slices/goalSlice";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const auth = useAppSelector((s) => s.auth);
  const authError = auth.error;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // ✅ если регистрация прошла — сохраняем session в LS и редиректим
  useEffect(() => {
    if (!auth.isAuthenticated) return;
    dispatch(persistSession());
    navigate("/today", { replace: true });
  }, [auth.isAuthenticated, dispatch, navigate]);

  const emailTrimmed = email.trim();
  const nameTrimmed = name.trim();

  const emailValid = EMAIL_RE.test(emailTrimmed);
  const nameValid = nameTrimmed.length >= 2;
  const passwordValid = password.length >= 6;

  const canSubmit = emailValid && nameValid && passwordValid;

  const handleRegister = () => {
    setTouched(true);
    dispatch(clearAuthError());
    if (!canSubmit) return;

    // ✅ новый аккаунт — чистая база задач/цели
    dispatch(clearAllTasks());
    dispatch(resetGoal());

    dispatch(
      registerUser({
        email: emailTrimmed,
        password,
        displayName: nameTrimmed,
      })
    );
    // ❗️navigate тут НЕ делаем — дождёмся auth.isAuthenticated в useEffect выше
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Регистрация
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Создай аккаунт — прогресс будет сохраняться.
              </Typography>
            </Box>

            {!!authError && (
              <Typography color="error" sx={{ fontWeight: 700 }}>
                {authError}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={touched && !nameValid}
              helperText={touched && !nameValid ? "Минимум 2 символа" : " "}
            />

            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={touched && !emailValid}
              helperText={touched && !emailValid ? "Введите корректный email" : " "}
            />

            <TextField
              fullWidth
              type="password"
              label="Пароль (мин. 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={touched && !passwordValid}
              helperText={touched && !passwordValid ? "Минимум 6 символов" : " "}
            />

            <Button
              variant="contained"
              size="large"
              disabled={!canSubmit}
              onClick={handleRegister}
              sx={{ borderRadius: 2 }}
            >
              Зарегистрироваться
            </Button>

            <Button variant="text" onClick={() => navigate("/login")}>
              Уже есть аккаунт? Войти
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
