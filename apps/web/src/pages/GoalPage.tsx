import { Container, Typography, TextField, Button, Box } from "@mui/material";

export function GoalPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4">Моя цель</Typography>

      <Box sx={{ mt: 2 }}>
        <TextField fullWidth label="Моя цель на месяц" />
      </Box>

      <Button variant="contained" sx={{ mt: 2 }}>
        Сохранить цель
      </Button>
    </Container>
  );
}
