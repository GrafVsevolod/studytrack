import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, findUserById, insertUser } from "../db";

export const authRouter = Router();

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

function signToken(payload: { userId: number; email: string }) {
  const secret = process.env.JWT_SECRET || "change_me";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET || "change_me";
  return jwt.verify(token, secret) as { userId: number; email: string };
}

authRouter.post("/register", (req, res) => {
  const email = normEmail(String(req.body?.email ?? ""));
  const password = String(req.body?.password ?? "");
  const displayName = String(req.body?.displayName ?? "").trim();

  if (!email) return res.status(400).json({ error: "Email обязателен" });
  if (!email.includes("@")) return res.status(400).json({ error: "Некорректный email" });
  if (displayName.length < 2)
    return res.status(400).json({ error: "Имя должно быть минимум 2 символа" });
  if (password.length < 6)
    return res.status(400).json({ error: "Пароль должен быть минимум 6 символов" });

  const existing = findUserByEmail(email);
  if (existing) return res.status(409).json({ error: "Пользователь уже существует" });

  const registeredAt = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(password, 10);

  const { id } = insertUser({ email, displayName, passwordHash, registeredAt });

  const token = signToken({ userId: id, email });

  return res.status(201).json({
    token,
    user: { id, email, displayName, registeredAt },
  });
});

authRouter.post("/login", (req, res) => {
  const email = normEmail(String(req.body?.email ?? ""));
  const password = String(req.body?.password ?? "");

  if (!email) return res.status(400).json({ error: "Email обязателен" });
  if (!password) return res.status(400).json({ error: "Пароль обязателен" });

  const u = findUserByEmail(email);
  if (!u) return res.status(404).json({ error: "Пользователь не найден" });

  const ok = bcrypt.compareSync(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: "Неверный пароль" });

  const token = signToken({ userId: u.id, email: u.email });

  return res.json({
    token,
    user: { id: u.id, email: u.email, displayName: u.displayName, registeredAt: u.registeredAt },
  });
});

authRouter.get("/me", (req, res) => {
  const header = String(req.headers.authorization ?? "");
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) return res.status(401).json({ error: "Нет токена" });

  try {
    const payload = verifyToken(token);
    const u = findUserById(payload.userId);
    if (!u) return res.status(404).json({ error: "Пользователь не найден" });

    return res.json({
      user: { id: u.id, email: u.email, displayName: u.displayName, registeredAt: u.registeredAt },
    });
  } catch {
    return res.status(401).json({ error: "Невалидный токен" });
  }
});
