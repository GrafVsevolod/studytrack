import { useMemo, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useAppSelector } from "../app/store/hooks";
import type { Task } from "../entities/task/types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

function lastNDays(n: number) {
  const res: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    res.push(ymd(x));
  }
  return res;
}

function prettyDayLabel(day: string) {
  return `${day.slice(5, 7)}/${day.slice(8, 10)}`;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function StatsPage() {
  const tasks = useAppSelector((s) => s.tasks.items) as Task[];

  const { total, done, active, progress, linkedToGoal } = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const active = total - done;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    const linkedToGoal = tasks.filter((t) => t.goalId !== null).length;

    return { total, done, active, progress, linkedToGoal };
  }, [tasks]);

  // ======== series (для bestDay по задачам) ========
  const series = useMemo(() => {
    const days = lastNDays(7);
    const doneByDay = new Map<string, number>();
    days.forEach((d) => doneByDay.set(d, 0));

    tasks.forEach((t) => {
      if (t.day && doneByDay.has(t.day) && t.done) {
        doneByDay.set(t.day, (doneByDay.get(t.day) || 0) + 1);
      }
    });

    return days.map((d) => ({
      day: d,
      done: doneByDay.get(d) || 0,
    }));
  }, [tasks]);

  // ======== B5 minutes stats (ТЕПЕРЬ ИСПОЛЬЗУЕМ В UI) ========
  const minuteStats = useMemo(() => {
    const totalPlannedMinutes = tasks.reduce(
      (sum, t) => sum + (t.plannedMinutes ?? 0),
      0
    );

    const totalDoneMinutes = tasks
      .filter((t) => t.done)
      .reduce((sum, t) => sum + (t.plannedMinutes ?? 0), 0);

    const percentMinutes =
      totalPlannedMinutes === 0
        ? 0
        : Math.round((totalDoneMinutes / totalPlannedMinutes) * 100);

    const bestDay =
      series.length > 0
        ? series.reduce((best, cur) =>
            cur.done > best.done ? cur : best
          )
        : null;

    return {
      totalPlannedMinutes,
      totalDoneMinutes,
      percentMinutes,
      bestDay,
    };
  }, [tasks, series]);

  // ======== B5 minuteSeries (план/факт минут) ========
  const minuteSeries = useMemo(() => {
    const days = lastNDays(7);

    const plannedMap = new Map<string, number>();
    const doneMap = new Map<string, number>();

    days.forEach((d) => {
      plannedMap.set(d, 0);
      doneMap.set(d, 0);
    });

    tasks.forEach((t) => {
      if (t.day && plannedMap.has(t.day)) {
        plannedMap.set(
          t.day,
          (plannedMap.get(t.day) || 0) + (t.plannedMinutes ?? 0)
        );

        if (t.done) {
          doneMap.set(
            t.day,
            (doneMap.get(t.day) || 0) + (t.plannedMinutes ?? 0)
          );
        }
      }
    });

    return days.map((d) => ({
      day: d,
      planned: plannedMap.get(d) || 0,
      done: doneMap.get(d) || 0,
    }));
  }, [tasks]);

  // ======== B4 — НОВЫЕ ВЫЧИСЛЕНИЯ ========
  const advancedMetrics = useMemo(() => {
    const totalPlannedMinutes = tasks.reduce(
      (sum, t) => sum + (t.plannedMinutes ?? 0),
      0
    );

    const totalActualMinutes = tasks.reduce(
      (sum, t) => sum + (t.actualMinutes ?? 0),
      0
    );

    const efficiency =
      totalPlannedMinutes === 0
        ? 0
        : Math.round((totalActualMinutes / totalPlannedMinutes) * 100);

    const overrunCount = tasks.filter(
      (t) => (t.actualMinutes ?? 0) > (t.plannedMinutes ?? 0)
    ).length;

    const bestTask =
      tasks.length > 0
        ? tasks.reduce((best, cur) =>
            (cur.actualMinutes ?? 0) > (best.actualMinutes ?? 0)
              ? cur
              : best
          )
        : null;

    return {
      totalPlannedMinutes,
      totalActualMinutes,
      efficiency,
      overrunCount,
      bestTask,
    };
  }, [tasks]);

  // ======== CANVAS ========
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 900;
    const height = 220;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padding = { left: 56, right: 16, top: 18, bottom: 44 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    const maxVal = Math.max(
      1,
      ...minuteSeries.map((p) => Math.max(p.planned, p.done))
    );

    const bestDayByDone =
      minuteSeries.length > 0
        ? minuteSeries.reduce((best, cur) =>
            cur.done > best.done ? cur : best
          ).day
        : null;

    const clear = () => {
      ctx.clearRect(0, 0, width, height);
    };

    const drawGridAndAxis = () => {
      ctx.font = "12px system-ui";
      ctx.fillStyle = "#6b7280";
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 1;

      const ticks = [0, Math.round(maxVal / 2), maxVal];

      ticks.forEach((v) => {
        const y = padding.top + plotH - (v / maxVal) * plotH;

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + plotW, y);
        ctx.stroke();

        const label = `${v}`;
        const tw = ctx.measureText(label).width;
        ctx.fillText(label, padding.left - 10 - tw, y + 4);
      });
    };

    const drawBars = (k: number) => {
      const n = minuteSeries.length;
      const gap = 12;
      const groupW = (plotW - gap * (n - 1)) / n;
      const barW = groupW / 2 - 3;

      minuteSeries.forEach((p, i) => {
        const baseX = padding.left + i * (groupW + gap);

        if (bestDayByDone && p.day === bestDayByDone) {
          ctx.save();
          ctx.strokeStyle = "rgba(25,118,210,0.55)";
          ctx.lineWidth = 1;
          ctx.strokeRect(baseX - 4, padding.top, groupW + 8, plotH);
          ctx.restore();
        }

        const plannedH = (p.planned / maxVal) * plotH * k;
        const plannedY = padding.top + plotH - plannedH;
        ctx.fillStyle = "#bdbdbd";
        ctx.fillRect(baseX, plannedY, barW, plannedH);

        const doneH = (p.done / maxVal) * plotH * k;
        const doneY = padding.top + plotH - doneH;
        ctx.fillStyle =
          bestDayByDone && p.day === bestDayByDone ? "#1565c0" : "#1976d2";
        ctx.fillRect(baseX + barW + 6, doneY, barW, doneH);

        ctx.fillStyle = "#3b82f6";
        ctx.font = "12px system-ui";
        const label = prettyDayLabel(p.day);
        const tw = ctx.measureText(label).width;
        ctx.fillText(
          label,
          baseX + groupW / 2 - tw / 2,
          padding.top + plotH + 26
        );
      });
    };

    const draw = (k: number) => {
      clear();
      drawGridAndAxis();
      drawBars(k);
    };

    const start = performance.now();
    const duration = 520;

    const tick = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1);
      const k = easeOutCubic(t);
      draw(k);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [minuteSeries]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      <Stack spacing={2.5}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              Statistics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Статистика по задачам “Today”.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`${done}/${total}`} variant="outlined" />
            <Chip label={`${clamp(progress, 0, 100)}%`} />
            <Chip label={`Активных: ${active}`} variant="outlined" />
            <Chip
              label={`Связано: ${linkedToGoal}`}
              variant={linkedToGoal > 0 ? "filled" : "outlined"}
            />
          </Stack>
        </Stack>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Прогресс
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={clamp(progress, 0, 100)}
                />
              </Box>

              {/* ======= ИСПОЛЬЗУЕМ minuteStats ======= */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    План vs Факт (минуты)
                  </Typography>

                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                    {minuteStats.totalDoneMinutes} /{" "}
                    {minuteStats.totalPlannedMinutes} мин
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Выполнение по минутам: {minuteStats.percentMinutes}%
                  </Typography>

                  {minuteStats.bestDay && (
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
                      ⭐ Лучший день по задачам:{" "}
                      {prettyDayLabel(minuteStats.bestDay.day)} —{" "}
                      {minuteStats.bestDay.done} задач
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* ======= B4 ДАШБОРД ======= */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Эффективность по времени
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                    {advancedMetrics.totalActualMinutes} /{" "}
                    {advancedMetrics.totalPlannedMinutes} мин
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Эффективность: {advancedMetrics.efficiency}%
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Переработано задач: {advancedMetrics.overrunCount}
                  </Typography>

                  {advancedMetrics.bestTask && (
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
                      🔥 Лучшая задача недели:{" "}
                      {advancedMetrics.bestTask.title} —{" "}
                      {advancedMetrics.bestTask.actualMinutes} мин
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* ======= CANVAS ======= */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    Выполнено за 7 дней (Canvas)
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Легенда: ◼️ План • 🟦 Факт — график построен через Canvas API.
                  </Typography>

                  <Box sx={{ width: "100%", overflowX: "auto", mt: 1 }}>
                    <canvas ref={canvasRef} />
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Подсветка рамкой — лучший день по факту минут. Анимация включена.
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
