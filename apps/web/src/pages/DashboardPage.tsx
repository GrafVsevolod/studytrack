import { Container, Typography, Stack, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function DashboardPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4">Dashboard</Typography>
      <Typography color="text.secondary">
        Главная панель StudyTrack
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button component={RouterLink} to="/today" variant="contained">
          Сегодня
        </Button>
        <Button component={RouterLink} to="/goal" variant="outlined">
          Моя цель
        </Button>
        <Button component={RouterLink} to="/statistics" variant="outlined">
          Статистика
        </Button>
      </Stack>
    </Container>
  );
}
