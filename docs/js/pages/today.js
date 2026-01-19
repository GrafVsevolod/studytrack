import { getTodayTasks, toggleTaskDone } from "../store.js";

export function renderToday() {
  const tasks = getTodayTasks();

  const rows = tasks
    .map((t) => {
      return `
        <div class="task-row">
          <label class="task-left">
            <input type="checkbox" class="task-check" data-done="${t.id}" ${
        t.done ? "checked" : ""
      } />
            <span class="task-title ${t.done ? "done" : ""}">${t.title}</span>
          </label>
          <div class="task-min">${t.minutes} мин</div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="card">
      <div class="h1">Сегодняшние задачи</div>

      <div class="tasks">
        ${rows || `<div class="muted">На сегодня задач нет</div>`}
      </div>

      <div class="spacer"></div>

      <div class="row">
        <button class="btn primary" data-link="#create-task">+ Добавить задачу</button>
        <button class="btn" data-link="#dashboard">Назад</button>
      </div>
    </div>
  `;
}

export function bindTodayHandlers(root, rerender, navigate) {
  root.querySelectorAll("[data-done]").forEach((el) => {
    el.addEventListener("change", () => {
      toggleTaskDone(el.dataset.done);
      rerender();
    });
  });

  root.querySelectorAll("[data-link]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.link));
  });
}
