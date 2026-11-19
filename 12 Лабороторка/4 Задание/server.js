'use strict';
// Вариант 4 (базовый): вход в кабинет преподавателя, отображение имени и роли после проверки.
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { SessionStore, cookieOptions } = require('../shared/session');
const USERS = require('./users.json');

const COOKIE = 'sid';
const GROUPS = [
  { group: 'ИС25-21', subject: 'Базы данных', students: 24 },
  { group: 'ИС25-22', subject: 'Технология программирования', students: 22 }
];

function createApp({ ttlMs = 15 * 60 * 1000 } = {}) {
  const app = express();
  const store = new SessionStore(ttlMs);
  setInterval(() => store.sweep(), 60000).unref();

  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  // Проверка сессии на сервере: 401 — не вошёл / сессия истекла
  function requireAuth(req, res, next) {
    const s = store.get(req.cookies[COOKIE]);
    if (!s) return res.status(401).json({ error: 'Требуется вход', code: 'NO_SESSION' });
    if (s.expired) {
      store.destroy(req.cookies[COOKIE]);
      res.clearCookie(COOKIE, { path: '/' });
      return res.status(401).json({ error: 'Сессия истекла, войдите снова', code: 'SESSION_EXPIRED' });
    }
    req.session = s;
    req.sid = req.cookies[COOKIE];
    next();
  }
  // 403 — вошёл, но роль не подходит
  const requireRole = (role) => (req, res, next) =>
    req.session.data.role === role
      ? next()
      : res.status(403).json({ error: 'Недостаточно прав для этого раздела', code: 'FORBIDDEN' });

  app.post('/api/login', async (req, res) => {
    const { login, password } = req.body || {};
    if (typeof login !== 'string' || typeof password !== 'string' || !login.trim() || !password) {
      return res.status(400).json({ error: 'Заполните логин и пароль' });
    }
    const user = USERS.find((u) => u.login === login.trim());
    // сравнение выполняется всегда, чтобы время ответа не выдавало существование логина
    const ok = await bcrypt.compare(password, user ? user.hash : '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali');
    if (!user || !ok) return res.status(401).json({ error: 'Неверный логин или пароль' });
    const sid = store.create({ userId: user.id, role: user.role, name: user.name, login: user.login });
    res.cookie(COOKIE, sid, cookieOptions(ttlMs));
    res.json({ message: 'Вход выполнен', name: user.name, role: user.role });
  });

  app.get('/api/profile', requireAuth, (req, res) => {
    const { name, role, login } = req.session.data;
    res.json({ name, role, login, expiresAt: req.session.expiresAt });
  });

  app.get('/api/teacher/groups', requireAuth, requireRole('teacher'), (req, res) => {
    res.json({ groups: GROUPS });
  });

  app.post('/api/logout', (req, res) => {
    store.destroy(req.cookies[COOKIE]);
    res.clearCookie(COOKIE, { path: '/' });
    res.json({ message: 'Выход выполнен' });
  });

  return app;
}

module.exports = { createApp };
if (require.main === module) {
  const port = process.env.PORT || 3004;
  createApp().listen(port, () => console.log(`Вариант 4: http://localhost:${port}`));
}
