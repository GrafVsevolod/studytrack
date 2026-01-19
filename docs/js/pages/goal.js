import { getState } from "../store.js";

export function renderGoal() {
  const state = getState();
  const title = state?.goal?.title || "—";

  return `
    <div class="card">
      <div class="h1">Моя цель</div>
      <div class="block">
        <div><b>Текущая цель:</b></div>
        <div class="muted">${title}</div>
      </div>

      <div class="row">
        <button class="btn" data-link="#dashboard">Назад</button>
      </div>
    </div>
  `;
}

export function bindGoalHandlers(root, rerender, navigate) {
  root.querySelectorAll("[data-link]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.link));
  });
}
