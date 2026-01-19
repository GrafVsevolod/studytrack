import { renderDashboard, bindDashboardHandlers } from "./pages/dashboard.js";
import { renderToday, bindTodayHandlers } from "./pages/today.js";
import { renderCreateTask, bindCreateTaskHandlers } from "./pages/createTask.js";
import { renderGoal, bindGoalHandlers } from "./pages/goal.js";
import { getState } from "./store.js";
import { renderStatistics, bindStatisticsHandlers } from "./pages/statistics.js"; 


const main = document.getElementById("main");
const topbar = document.getElementById("topbar");

topbar.hidden = false;

topbar.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-nav]");
  if (!btn) return;

  const nav = btn.dataset.nav;

  if (nav === "logout") {
    // “logout” для прототипа = очистка localStorage и возврат на dashboard
    localStorage.removeItem("studytrack_state");
    location.hash = "#dashboard";
    render();
    return;
  }

  if (nav === "dashboard") location.hash = "#dashboard";
  if (nav === "statistics") location.hash = "#statistics";
});

function navigate(hash) {
  location.hash = hash;
}

function render() {
  // debug — можно потом убрать
  console.log("STATE:", getState());

  const hash = location.hash || "#dashboard";

  if (hash === "#today") {
    main.innerHTML = renderToday();
    bindTodayHandlers(main, render, navigate);
    return;
  }

  if (hash === "#create-task") {
    main.innerHTML = renderCreateTask();
    bindCreateTaskHandlers(main, render, navigate);
    return;
  }

  if (hash === "#goal") {
    main.innerHTML = renderGoal();
    bindGoalHandlers(main, render, navigate);
    return;
  }

  if (hash === "#statistics") {
    main.innerHTML = renderStatistics();
    bindStatisticsHandlers(main, render, navigate);
    return;
  }

  // default
  main.innerHTML = renderDashboard();
  bindDashboardHandlers(main, render, navigate);
}

window.addEventListener("hashchange", render);
render();
