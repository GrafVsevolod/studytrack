const STORAGE_KEY = "studytrack_state";

// дефолтное состояние (если в localStorage пусто / сломано)
const DEFAULT_STATE = {
  user: { name: "Demo" },
  goal: { id: 1, title: "Подготовиться к экзамену по Web" },
  tasks: [
    { id: 1, title: "Пройти лекцию 3", minutes: 60, done: false, date: "today", goalId: 1 },
    { id: 2, title: "Сделать конспект", minutes: 30, done: false, date: "today", goalId: 1 },
    { id: 3, title: "Решить 5 задач", minutes: 60, done: false, date: "today", goalId: 1 },
    { id: 4, title: "Доделать G4", minutes: 90, done: false, date: "today", goalId: 1 },
  ],
};

let state = loadState();

// --- helpers ---
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);

    const parsed = JSON.parse(raw);

    // минимальная валидация, чтобы не падать
    if (!parsed || typeof parsed !== "object") return structuredClone(DEFAULT_STATE);
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) return structuredClone(DEFAULT_STATE);
    if (!parsed.goal || typeof parsed.goal !== "object") return structuredClone(DEFAULT_STATE);

    return parsed;
  } catch (e) {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- API (только то, что вы используете) ---
export function getState() {
  return state;
}

export function getTodayTasks() {
  return state.tasks.filter((t) => t.date === "today");
}

export function toggleTaskDone(id) {
  const task = state.tasks.find((t) => t.id === Number(id));
  if (!task) return;

  task.done = !task.done;
  saveState();
}

export function addTask({ title, minutes, date = "today", goalId = 1 }) {
  const newId = state.tasks.length ? Math.max(...state.tasks.map((t) => t.id)) + 1 : 1;

  state.tasks.push({
    id: newId,
    title: String(title || "").trim() || "Новая задача",
    minutes: Number(minutes) || 30,
    done: false,
    date,
    goalId,
  });

  saveState();
}
