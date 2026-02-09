import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material";

import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import {
  setGoalTitle,
  setTargetMinutes,
  resetGoal,
} from "../app/store/slices/goalSlice";
import type { Task } from "../entities/task/types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function GoalPage() {
  const dispatch = useAppDispatch();

  const goal = useAppSelector((s) => s.goal);
  const tasks = useAppSelector((s) => s.tasks.items) as Task[];

  const [title, setTitle] = useState(goal.title ?? "Моя цель");
  const [target, setTarget] = useState(String(goal.targetMinutes ?? 0));

  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setTitle(goal.title ?? "Моя цель");
    setTarget(String(goal.targetMinutes ?? 0));
  }, [goal.title, goal.targetMinutes]);

  const goalId = goal.id ?? "main";

  const metrics = useMemo(() => {
    const linked = tasks.filter((t) => t.goalId === goalId);

    const linkedCount = linked.length;

    const plannedLinkedMinutes = linked.reduce(
      (sum, t) => sum + (t.plannedMinutes ?? 0),
      0
    );

    const doneLinkedMinutes = linked
      .filter((t) => t.done)
      .reduce((sum, t) => sum + (t.plannedMinutes ?? 0), 0);

    const targetMinutes = Number(goal.targetMinutes ?? 0);

    const progress =
      targetMinutes <= 0
        ? 0
        : Math.round((doneLinkedMinutes / targetMinutes) * 100);

    return {
      linkedCount,
      plannedLinkedMinutes,
      doneLinkedMinutes,
      targetMinutes,
      progress: clamp(progress, 0, 100),
    };
  }, [tasks, goalId, goal.targetMinutes]);

  // ======== A4.2 новые вычисления ========
  const remainingMinutes = Math.max(
    0,
    metrics.targetMinutes - metrics.doneLinkedMinutes
  );

  const goalReady = metrics.targetMinutes > 0;
  const isComplete =
    goalReady && metrics.doneLinkedMinutes >= metrics.targetMinutes;

  // 🔥 A4.2 — почти выполнено (≤ 20%)
  const isAlmostDone =
    goalReady &&
    !isComplete &&
    remainingMinutes <=
      Math.max(1, Math.round(metrics.targetMinutes * 0.2));

  const progressLabel = !goalReady
    ? "Задай цель, чтобы считать прогресс"
    : isComplete
    ? "Цель выполнена 🎉"
    : `Осталось: ${remainingMinutes} мин`;
  // =======================================

  const parsedTarget = Number(target);
  const targetValid =
    Number.isFinite(parsedTarget) && parsedTarget >= 0;

  const titleTrimmed = (title ?? "").trim();
  const titleValid = titleTrimmed.length > 0;

  const dirty =
    titleTrimmed !== (goal.title ?? "").trim() ||
    (target ?? "") !== String(goal.targetMinutes ?? 0);

  const canSave = dirty && titleValid && targetValid;

  const onSave = () => {
    const nextTitle = titleTrimmed;
    const nextTarget = targetValid
      ? Math.round(parsedTarget)
      : 0;

    if (!nextTitle) return;

    dispatch(setGoalTitle(nextTitle));
    dispatch(setTargetMinutes(nextTarget));
  };

  const onFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (canSave) onSave();
  };

  const onResetAsk = () => setConfirmOpen(true);
  const onResetCancel = () => setConfirmOpen(false);
  const onResetConfirm = () => {
    dispatch(resetGoal());
    setConfirmOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        py: { xs: 3, sm: 5 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 900, letterSpacing: -0.7 }}
              >
                My Goal
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Настрой цель и смотри прогресс по задачам,
                привязанным к цели.
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="flex-end"
            >
              <Chip
                label={`Цель: ${metrics.targetMinutes} мин`}
                variant="outlined"
                sx={{ fontWeight: 800, borderRadius: 2 }}
              />

              <Chip
                label={`${metrics.progress}%`}
                color={isComplete ? "success" : "default"}
                sx={{ fontWeight: 900, borderRadius: 2 }}
              />
            </Stack>
          </Stack>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={2.2}>
                {/* Progress */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 900, mb: 1 }}
                  >
                    Прогресс цели (минуты)
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={metrics.progress}
                  />

                  {/* ====== A4.2 — подпись с огоньком ====== */}
                  <Typography
                    variant="caption"
                    color={
                      isComplete
                        ? "success.main"
                        : isAlmostDone
                        ? "warning.main"
                        : "text.secondary"
                    }
                    sx={{
                      mt: 1,
                      display: "block",
                      fontWeight: 700,
                      transition: "color 200ms ease",
                    }}
                  >
                    {isAlmostDone
                      ? `🔥 ${progressLabel}`
                      : progressLabel}
                  </Typography>
                  {/* ====================================== */}

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mt: 1 }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Выполнено:{" "}
                      {metrics.doneLinkedMinutes} мин
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      План: {metrics.targetMinutes} мин
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                {/* Form */}
                <Stack spacing={1.5} onKeyDown={onFormKeyDown}>
                  <TextField
                    fullWidth
                    label="Название цели"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    error={!titleValid}
                    helperText={
                      !titleValid
                        ? "Название не должно быть пустым"
                        : " "
                    }
                  />

                  <TextField
                    fullWidth
                    label="Цель в минутах (на период)"
                    value={target}
                    onChange={(e) =>
                      setTarget(e.target.value)
                    }
                    inputMode="numeric"
                    error={!targetValid}
                    helperText={
                      !targetValid
                        ? "Введите число ≥ 0"
                        : " "
                    }
                  />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      disabled={!canSave}
                      onClick={onSave}
                      sx={{ borderRadius: 2, flex: 1 }}
                    >
                      Сохранить
                    </Button>

                    <Tooltip title="Сбросит название и минуты цели к дефолту">
                      <span style={{ flex: 1 }}>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={onResetAsk}
                          sx={{
                            borderRadius: 2,
                            width: "100%",
                          }}
                        >
                          Сбросить
                        </Button>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>

                <Divider />

                {/* Stats cards */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                >
                  <Card
                    variant="outlined"
                    sx={{ flex: 1, borderRadius: 2 }}
                  >
                    <CardContent>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Привязано задач
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 900 }}
                      >
                        {metrics.linkedCount}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{ flex: 1, borderRadius: 2 }}
                  >
                    <CardContent>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Выполнено (из привязанных)
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 900 }}
                      >
                        {metrics.doneLinkedMinutes}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{ flex: 1, borderRadius: 2 }}
                  >
                    <CardContent>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Минут запланировано
                        (привязанные)
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 900 }}
                      >
                        {
                          metrics.plannedLinkedMinutes
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Чтобы прогресс рос — на /today выбери цель
                  в селекте «Привязать к цели» и отмечай done.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Confirm Reset Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={onResetCancel}
        >
          <DialogTitle>
            Сбросить цель?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Это вернёт название и минуты цели к
              значениям по умолчанию. Задачи не
              удалятся.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onResetCancel}>
              Отмена
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={onResetConfirm}
            >
              Сбросить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
