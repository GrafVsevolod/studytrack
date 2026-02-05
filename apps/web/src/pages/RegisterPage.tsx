import { Container, Typography, Box, TextField, Button, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function RegisterPage() {
  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Box sx={{ p: 3, boxShadow: 1, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Регистрация
        </Typography>

        <TextField fullWidth label="Email" margin="normal" />
        <TextField fullWidth label="Пароль" type="password" margin="normal" />

        <Button fullWidth variant="contained" sx={{ mt: 2 }}>
          Создать аккаунт
        </Button>

        <Box sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/login">
            Уже есть аккаунт? Войти
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
