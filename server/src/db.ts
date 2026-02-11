import Database from "better-sqlite3";

const dbPath = process.env.DB_PATH || "./data.sqlite";
export const db = new Database(dbPath);

// users: минимальная таблица для auth
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    displayName TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    registeredAt TEXT NOT NULL
  );
`);

export type DbUser = {
  id: number;
  email: string;
  displayName: string;
  passwordHash: string;
  registeredAt: string;
};

export function findUserByEmail(email: string): DbUser | undefined {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email) as DbUser | undefined;
}

export function findUserById(id: number): DbUser | undefined {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id) as DbUser | undefined;
}

export function insertUser(input: {
  email: string;
  displayName: string;
  passwordHash: string;
  registeredAt: string;
}): { id: number } {
  const stmt = db.prepare(
    "INSERT INTO users (email, displayName, passwordHash, registeredAt) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(
    input.email,
    input.displayName,
    input.passwordHash,
    input.registeredAt
  );
  return { id: Number(info.lastInsertRowid) };
}
