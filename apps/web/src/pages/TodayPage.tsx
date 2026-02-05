import { Container, Typography, Box, Button } from "@mui/material";

export function TodayPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4">Сегодня</Typography>

      <Box sx={{ mt: 2 }}>
        <Typography>Список задач на сегодня появится здесь.</Typography>
      </Box>

      <Button variant="contained" sx={{ mt: 3 }}>
        Добавить задачу
      </Button>
    </Container>
  );
}
