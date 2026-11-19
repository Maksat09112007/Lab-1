'use strict';
// Вариант 13 (средний): сервис заявок — авторизация, просмотр своих заявок, обработка отказа в доступе.
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { SessionStore, cookieOptions } = require('../shared/session');
const USERS = require('./users.json');

const COOKIE = 'sid';

function createApp({ ttlMs = 15 * 60 * 1000 } = {}) {
  const app = express();
  const store = new SessionStore(ttlMs);
  setInterval(() => store.sweep(), 60000).unref();

  // Учебные данные в памяти
  const requests = [
    { id: 1, ownerId: 1, title: 'Не работает принтер в аудитории 204', description: 'Не печатает, мигает красный индикатор', status: 'в работе', createdAt: '2026-11-10' },
    { id: 2, ownerId: 1, title: 'Нужен доступ к лаборатории', description: 'Для выполнения лабораторных работ', status: 'новая', createdAt: '2026-11-15' },
    { id: 3, ownerId: 2, title: 'Замена проектора', description: 'Изображение с полосами', status: 'новая', createdAt: '2026-11-12' }
  ];
  let nextId = 4;
  const loginLog = []; // аудит попыток входа: { login, success, at }

  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  function requireAuth(req, res, next) {
    const sid = req.cookies[COOKIE];
    const s = store.get(sid);
    if (!s) return res.status(401).json({ error: 'Требуется вход', code: 'NO_SESSION' });
    if (s.expired) {
      store.destroy(sid);
      res.clearCookie(COOKIE, { path: '/' });
      return res.status(401).json({ error: 'Сессия истекла, войдите снова', code: 'SESSION_EXPIRED' });
    }
    req.session = s;
    next();
  }

  app.post('/api/login', async (req, res) => {
    const { login, password } = req.body || {};
    if (typeof login !== 'string' || typeof password !== 'string' || !login.trim() || !password) {
      return res.status(400).json({ error: 'Заполните логин и пароль' });
    }
    const user = USERS.find((u) => u.login === login.trim());
    const ok = await bcrypt.compare(password, user ? user.hash : '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali');
    loginLog.push({ login: login.trim(), success: Boolean(user && ok), at: Date.now() });
    if (loginLog.length > 500) loginLog.shift();
    if (!user || !ok) return res.status(401).json({ error: 'Неверный логин или пароль' });
    const sid = store.create({ userId: user.id, name: user.name, login: user.login });
    res.cookie(COOKIE, sid, cookieOptions(ttlMs));
    res.json({ message: 'Вход выполнен', name: user.name });
  });

  app.get('/api/profile', requireAuth, (req, res) => {
    const { name, login } = req.session.data;
    res.json({ name, login, expiresAt: req.session.expiresAt });
  });

  // Только свои заявки: фильтрация выполняется на сервере по userId из сессии
  app.get('/api/requests', requireAuth, (req, res) => {
    res.json({ requests: requests.filter((r) => r.ownerId === req.session.data.userId).map(publicView) });
  });

  app.post('/api/requests', requireAuth, (req, res) => {
    const { title, description } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 100) {
      return res.status(400).json({ error: 'Укажите тему заявки (до 100 символов)' });
    }
    const item = {
      id: nextId++, ownerId: req.session.data.userId, title: title.trim(),
      description: typeof description === 'string' ? description.trim().slice(0, 500) : '',
      status: 'новая', createdAt: new Date().toISOString().slice(0, 10)
    };
    requests.push(item);
    res.status(201).json(publicView(item));
  });

  // 404 — заявки нет, 403 — заявка чужая
  app.get('/api/requests/:id', requireAuth, (req, res) => {
    const item = requests.find((r) => r.id === Number(req.params.id));
    if (!item) return res.status(404).json({ error: 'Заявка не найдена' });
    if (item.ownerId !== req.session.data.userId) {
      return res.status(403).json({ error: 'Доступ запрещён: это чужая заявка', code: 'FORBIDDEN' });
    }
    res.json(publicView(item));
  });

  // Аудит: последние попытки входа текущего пользователя
  app.get('/api/login-history', requireAuth, (req, res) => {
    const mine = loginLog.filter((e) => e.login === req.session.data.login).slice(-10).reverse();
    res.json({ history: mine });
  });

  app.post('/api/logout', (req, res) => {
    store.destroy(req.cookies[COOKIE]);
    res.clearCookie(COOKIE, { path: '/' });
    res.json({ message: 'Выход выполнен' });
  });

  return app;
}

function publicView({ id, title, description, status, createdAt }) {
  return { id, title, description, status, createdAt };
}

module.exports = { createApp };
if (require.main === module) {
  const port = process.env.PORT || 3013;
  createApp().listen(port, () => console.log(`Вариант 13: http://localhost:${port}`));
}
