import { addTask } from "../store.js";

export function renderCreateTask() {
  return `
    <div class="card">
      <div class="h1">Создать задачу</div>

      <div class="grid">
        <input class="input" id="taskTitle" placeholder="Название задачи" />
        <input class="input" id="taskMinutes" type="number" placeholder="Минуты (например 30)" />
      </div>

      <div class="spacer"></div>

      <div class="row">
        <button class="btn primary" id="saveTask">Сохранить</button>
        <button class="btn" data-link="#today">Отмена</button>
      </div>

      <div class="muted" id="msg" style="margin-top:10px;"></div>
    </div>
  `;
}

export function bindCreateTaskHandlers(root, rerender, navigate) {
  root.querySelector("[data-link]").addEventListener("click", () => {
    navigate("#today");
  });

  root.querySelector("#saveTask").addEventListener("click", () => {
    const title = root.querySelector("#taskTitle").value.trim();
    const minutesRaw = root.querySelector("#taskMinutes").value.trim();
    const minutes = Number(minutesRaw);

    if (!title) {
      root.querySelector("#msg").textContent = "Введите название задачи";
      return;
    }

    if (!Number.isFinite(minutes) || minutes <= 0) {
      root.querySelector("#msg").textContent = "Введите минуты (число > 0)";
      return;
    }

    addTask({
      title,
      minutes,
      date: "today",
    });

    navigate("#today");
    rerender();
  });
}
