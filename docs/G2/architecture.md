# G2.1 — Архитектура приложения StudyTrack

## 1. Цели архитектуры
- Разделение на модули (auth, goals, tasks, stats)
- Предсказуемый state (Redux Toolkit)
- Не блокировать UI (Web Worker)
- Визуализация статистики (Canvas API)
- Наблюдаемость: аналитика + ошибки (GA/Метрика + Sentry)

---

## 2. Технологии

### Frontend
- React + TypeScript
- Redux Toolkit
- Vite
- MUI (Material UI)
- ESLint + Prettier (+ Stylelint)

### Testing (план)
- Jest + React Testing Library (unit/integration)
- Cypress (e2e)

### Backend (минимально)
- Node.js + Express
- REST API для целей/задач/авторизации
- DB: SQLite/PostgreSQL (не оценивается, но используется)

### Observability
- Analytics: Google Analytics / Yandex Metrika
- Sentry: frontend + backend

---

## 3. Модули фронтенда

### Страницы (routes)
- /login
- /dashboard
- /statistics

### Feature-модули
- auth: логин/логаут, пользователь
- goals: CRUD целей, прогресс
- tasks: CRUD задач, отметка выполнено
- stats: агрегаты и визуализация

---

## 4. Предлагаемая структура проекта

frontend/
- src/
  - app/ (store, router)
  - pages/ (LoginPage, DashboardPage, StatisticsPage)
  - features/
    - auth/
    - goals/
    - tasks/
    - stats/
  - shared/
    - ui/
    - api/
    - lib/
  - workers/
    - stats.worker.ts

backend/
- src/
  - routes/
  - services/
  - db/

---

## 5. Redux Store (slices)

- authSlice:
  - user, isAuthenticated, token, status
- goalsSlice:
  - goals[], status, error
- tasksSlice:
  - tasks[], status, error
- statsSlice:
  - aggregates (hoursByDay, totalHours, streak, completedTasks), status

Thunks:
- fetchGoals, createGoal, updateGoal, deleteGoal
- fetchTasks, createTask, updateTask, deleteTask, completeTask
- recalcStats (через worker)

---

## 6. Модели данных

Goal:
- id: string
- title: string
- type: "study" | "habit"
- weeklyTargetHours: number
- createdAt: string

Task:
- id: string
- goalId: string
- title: string
- date: string (YYYY-MM-DD)
- plannedMinutes: number
- completed: boolean
- createdAt: string

StatsAggregate (worker output):
- hoursByDay: { [date: string]: number }
- totalHours: number
- streakDays: number
- completedTasks: number

---

## 7. REST API (контракт)

Auth:
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me

Goals:
- GET    /api/goals
- POST   /api/goals
- PATCH  /api/goals/:id
- DELETE /api/goals/:id

Tasks:
- GET    /api/tasks
- POST   /api/tasks
- PATCH  /api/tasks/:id
- DELETE /api/tasks/:id
- POST   /api/tasks/:id/complete

---

## 8. Поток данных (end-to-end)
1) UI (React) → dispatch actions
2) Redux → thunks → HTTP → backend
3) backend → DB → JSON → Redux
4) Redux → UI
5) Redux → Web Worker → агрегаты → Redux
6) Statistics UI рисует графики и heatmap через Canvas API

---

## 9. Web Worker
- принимает задачи/цели
- считает hoursByDay, totalHours, streakDays, completedTasks
- возвращает агрегаты в основной поток

---

## 10. Canvas API
- компонент HeatmapCanvas рисует сетку дней и интенсивность по hoursByDay

---

## 11. Аналитика
События:
- goal_created
- task_created
- task_completed
- view_statistics

---

## 12. Sentry
- Frontend: capture exceptions
- Backend: middleware ошибок → отправка в Sentry
