import { Container, Typography, Box } from "@mui/material";

export function StatsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4">Статистика</Typography>

      <Box sx={{ mt: 2 }}>
        <Typography>
          Здесь позже появится:
        </Typography>
        <ul>
          <li>График выполненных задач</li>
          <li>Процент выполнения</li>
          <li>Серия дней (streak)</li>
        </ul>
      </Box>
    </Container>
  );
}
