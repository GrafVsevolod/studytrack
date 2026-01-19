import { getState } from "../store.js";

function isSameDayISO(a, b) {
  return a === b;
}

// ожидаем, что task.date может быть "today" или "YYYY-MM-DD"
// сделаем нормализацию
function normalizeDate(d) {
  if (!d) return null;
  if (d === "today") {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }
  return d;
}

export function renderStatistics() {
  const state = getState();
  const tasks = (state?.tasks || []).map((t) => ({ ...t, date: normalizeDate(t.date) }));

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  // последние 7 дней включая сегодня
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const rows = days
    .map((day) => {
      const dayTasks = tasks.filter((t) => isSameDayISO(t.date, day));
      const total = dayTasks.length;
      const done = dayTasks.filter((t) => t.done).length;

      const label = day === todayISO ? `${day} (сегодня)` : day;

      return `
        <div class="stat-row">
          <div class="stat-day">${label}</div>
          <div class="stat-val">${done} / ${total}</div>
        </div>
      `;
    })
    .join("");

  const totalAll = tasks.length;
  const doneAll = tasks.filter((t) => t.done).length;

  return `
    <div class="card">
      <div class="h1">Statistics</div>

      <div class="block">
        <div><b>Всего выполнено задач:</b></div>
        <div>${doneAll} / ${totalAll}</div>
      </div>

      <div class="block">
        <div><b>Последние 7 дней:</b></div>
        <div class="stats">${rows}</div>
      </div>

      <div class="row">
        <button class="btn" data-link="#dashboard">Назад</button>
      </div>
    </div>
  `;
}

export function bindStatisticsHandlers(root, rerender, navigate) {
  root.querySelectorAll("[data-link]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.link));
  });
}
