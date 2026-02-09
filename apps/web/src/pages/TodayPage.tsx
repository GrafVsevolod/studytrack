import { useMemo, useRef, useState, useEffect } from "react";   // ✅ ШАГ 1
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  MenuItem,
  Slider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import {
  addTask,
  toggleTaskDone,
  removeTask,
  linkGoal,
  setPlannedMinutes,
  startTimer,
  stopTimer,
} from "../app/store/slices/tasksSlice";
import type { Task } from "../entities/task/types";

type Filter = "all" | "active" | "done";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function TodayPage() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items) as Task[];

  const goal = useAppSelector((state) => state.goal);
  const goalTitle = goal?.title ?? "Моя цель";
  const goalId = goal?.id ?? "main";

  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const inputRef = useRef<HTMLInputElement | null>(null);

  // =======================
  // ✅ ШАГ 2 — СЧЁТЧИК ВРЕМЕНИ
  // =======================
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  // =======================

  const doneCount = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);
  const totalCount = tasks.length;
  const progress =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const visibleTasks = useMemo(() => {
    switch (filter) {
      case "active":
        return tasks.filter((t) => !t.done);
      case "done":
        return tasks.filter((t) => t.done);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const canAdd = text.trim().length > 0;

  const handleAdd = () => {
    const value = text.trim();
    if (!value) return;
    dispatch(addTask(value));
    setText("");
    inputRef.current?.focus();
  };

  const setMinutes = (taskId: string, minutes: number) => {
    dispatch(
      setPlannedMinutes({
        taskId,
        minutes: Math.max(0, Math.round(minutes)),
      })
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      <Stack spacing={2.5}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Сегодня
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Отмечай выполненное — прогресс сохраняется.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Chip
              label={`${doneCount}/${totalCount}`}
              variant="outlined"
              sx={{ fontWeight: 700, borderRadius: 2 }}
            />
            <Chip
              label={`${clamp(progress, 0, 100)}%`}
              sx={{ fontWeight: 800, borderRadius: 2 }}
            />
          </Stack>
        </Stack>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              {/* Progress bar */}
              <Box>
                <LinearProgress variant="determinate" value={clamp(progress, 0, 100)} />
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Прогресс дня
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doneCount === totalCount && totalCount > 0
                      ? "Красавчик 😎"
                      : "Двигаемся 💪"}
                  </Typography>
                </Stack>
              </Box>

              {/* Input */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  fullWidth
                  label="Новая задача"
                  value={text}
                  inputRef={inputRef}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                  }}
                />

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  disabled={!canAdd}
                  onClick={handleAdd}
                  sx={{ px: 3, borderRadius: 2 }}
                >
                  Добавить
                </Button>
              </Stack>

              <Divider />

              {/* List */}
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                {visibleTasks.length === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Пока пусто ✨
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Добавь первую задачу сверху — и погнали.
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {visibleTasks.map((task, idx) => {
                      const isLast = idx === visibleTasks.length - 1;
                      const minutes = Math.max(0, Math.round(task.plannedMinutes ?? 0));
                      const isLong = minutes >= 60;
                      const isRunning = !!task.timerStartedAt;

                      return (
                        <Box key={task.id}>
                          <ListItem
                            sx={{
                              py: 1.25,
                              px: 2,
                              gap: 1,
                              opacity: task.done ? 0.7 : 1,
                              alignItems: "flex-start",
                              ...(isLong
                                ? { bgcolor: "rgba(255, 152, 0, 0.06)" }
                                : {}),
                            }}
                            secondaryAction={
                              <Tooltip title="Удалить">
                                <IconButton
                                  edge="end"
                                  onClick={() => dispatch(removeTask(task.id))}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <Checkbox
                              checked={task.done}
                              onChange={() => dispatch(toggleTaskDone(task.id))}
                              sx={{ mt: 0.5 }}
                            />

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <ListItemText
                                    primary={
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{ minWidth: 0 }}
                                      >
                                        <Typography
                                          sx={{
                                            fontWeight: 700,
                                            textDecoration: task.done
                                              ? "line-through"
                                              : "none",
                                            minWidth: 0,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {task.title}
                                        </Typography>

                                        {isLong && (
                                          <Chip
                                            size="small"
                                            label="Долго"
                                            color="warning"
                                            sx={{ fontWeight: 800, borderRadius: 2 }}
                                          />
                                        )}
                                      </Stack>
                                    }
                                    secondary={
                                      <Typography variant="caption" color="text.secondary">
                                        {task.done ? "Выполнено" : "В процессе"}
                                      </Typography>
                                    }
                                  />
                                </Box>

                                {/* PLAY / PAUSE */}
                                <Tooltip title={isRunning ? "Пауза" : "Запустить таймер"}>
                                  <IconButton
                                    size="small"
                                    color={isRunning ? "primary" : "default"}
                                    onClick={() =>
                                      isRunning
                                        ? dispatch(stopTimer(task.id))
                                        : dispatch(startTimer(task.id))
                                    }
                                  >
                                    {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                                  </IconButton>
                                </Tooltip>

                                <TextField
                                  size="small"
                                  type="number"
                                  label="мин"
                                  value={minutes}
                                  onChange={(e) => {
                                    const v = Math.max(0, Number(e.target.value || 0));
                                    setMinutes(task.id, v);
                                  }}
                                  sx={{ width: 92 }}
                                />
                              </Stack>

                              {/* ========================= */}
                              {/* ✅ ШАГ 3 — ДИНАМИЧЕСКИЙ ФАКТ/ПЛАН */}
                              {/* ========================= */}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mt: 0.5, display: "block" }}
                              >
                                {(() => {
                                  const actual = task.actualMinutes ?? 0;

                                  let displayActual = actual;
                                  if (task.timerStartedAt) {
                                    const diff = Math.max(
                                      0,
                                      now - Date.parse(task.timerStartedAt)
                                    );
                                    displayActual += Math.floor(diff / 60000);
                                  }

                                  const mm = String(displayActual).padStart(2, "0");
                                  return `Факт: ${mm} мин / План: ${minutes} мин`;
                                })()}
                              </Typography>
                              {/* ========================= */}

                              <Box sx={{ mt: 1.25 }}>
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1.5}
                                  alignItems={{ xs: "stretch", sm: "center" }}
                                >
                                  <Box sx={{ flex: 1, px: 1 }}>
                                    <Slider
                                      value={clamp(minutes, 0, 180)}
                                      min={0}
                                      max={180}
                                      step={5}
                                      onChange={(_, v) => {
                                        const next =
                                          typeof v === "number" ? v : v[0] ?? 0;
                                        setMinutes(task.id, next);
                                      }}
                                      valueLabelDisplay="auto"
                                      valueLabelFormat={(v) => `${v} мин`}
                                    />
                                  </Box>

                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    {[15, 25, 50, 90].map((m) => (
                                      <Button
                                        key={m}
                                        size="small"
                                        variant={minutes === m ? "contained" : "outlined"}
                                        onClick={() => setMinutes(task.id, m)}
                                        sx={{ borderRadius: 2, minWidth: 52 }}
                                      >
                                        {m}
                                      </Button>
                                    ))}
                                  </Stack>
                                </Stack>
                              </Box>

                              <Box sx={{ mt: 1 }}>
                                <TextField
                                  select
                                  size="small"
                                  label="Привязать к цели"
                                  value={task.goalId ?? ""}
                                  onChange={(e) => {
                                    const next = e.target.value || null;
                                    dispatch(
                                      linkGoal({
                                        taskId: task.id,
                                        goalId: next,
                                      })
                                    );
                                  }}
                                  sx={{ maxWidth: 320 }}
                                >
                                  <MenuItem value="">Без цели</MenuItem>
                                  <MenuItem value={goalId}>{goalTitle}</MenuItem>
                                </TextField>
                              </Box>
                            </Box>
                          </ListItem>

                          {!isLast && <Divider />}
                        </Box>
                      );
                    })}
                  </List>
                )}
              </Paper>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
