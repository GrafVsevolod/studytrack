import { getTodayTasks } from "../store.js";

export function renderDashboard() {
  const tasks = getTodayTasks();
  const done = tasks.filter((t) => t.done).length;

  return `
    <div class="card">
      <div class="h1">Dashboard</div>

      <div class="block">
        <div><b>Сегодня выполнено:</b></div>
        <div>${done} / ${tasks.length || 0}</div>
      </div>

      <div class="row">
        <button class="btn primary" data-link="#today">Сегодняшние задачи</button>
        <button class="btn" data-link="#goal">Моя цель</button>
      </div>
    </div>
  `;
}

export function bindDashboardHandlers(root, rerender, navigate) {
  root.querySelectorAll("[data-link]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.link));
  });
}
