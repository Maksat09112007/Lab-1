'use strict';
// Вариант 16 (повышенный): система управления пользователями — роли, защищённые API,
// журнал событий входа/выхода. Токен: короткоживущий JWT (HS256) в cookie HttpOnly.
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SEED = require('./users.json');

const COOKIE = 'access_token';
const ISSUER = 'lab12-user-management';
const AUDIENCE = 'lab12-web-client';
const ROLES = ['user', 'manager', 'admin'];
const DUMMY_HASH = '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali';

function createApp({
  jwtTtlSec = 15 * 60,
  // секрет не хранится в коде: берётся из окружения либо генерируется при каждом запуске
  secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  maxFailures = 5,
  lockMs = 60 * 1000
} = {}) {
  const app = express();
  const users = SEED.map((u) => ({ ...u }));
  const audit = [];                 // журнал событий
  const revoked = new Set();        // jti токенов, завершённых выходом
  const failures = new Map();       // login -> { count, lockedUntil }

  const log = (event, login, extra = {}) => {
    audit.push({ id: audit.length + 1, at: Date.now(), event, login, ...extra });
    if (audit.length > 1000) audit.shift();
  };

  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  // --- Проверка JWT на сервере: подпись, алгоритм, срок, issuer, audience, отзыв ---
  function authenticate(req, res, next) {
    const token = req.cookies[COOKIE];
    if (!token) return res.status(401).json({ error: 'Требуется вход', code: 'NO_TOKEN' });
    let payload;
    try {
      payload = jwt.verify(token, secret, { algorithms: ['HS256'], issuer: ISSUER, audience: AUDIENCE });
    } catch (e) {
      res.clearCookie(COOKIE, { path: '/' });
      const expired = e.name === 'TokenExpiredError';
      return res.status(401).json({
        error: expired ? 'Срок действия токена истёк, войдите снова' : 'Недействительный токен',
        code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
      });
    }
    if (revoked.has(payload.jti)) return res.status(401).json({ error: 'Токен отозван (выход выполнен)', code: 'TOKEN_REVOKED' });
    // права берём из серверных данных, а не из токена: смена роли действует сразу
    const user = users.find((u) => u.id === Number(payload.sub));
    if (!user) return res.status(401).json({ error: 'Пользователь не найден', code: 'TOKEN_INVALID' });
    req.user = user; req.token = payload;
    next();
  }
  const requireRole = (...allowed) => (req, res, next) =>
    allowed.includes(req.user.role)
      ? next()
      : res.status(403).json({ error: 'Недостаточно прав', code: 'FORBIDDEN' });

  // --- Вход ---
  app.post('/api/login', async (req, res) => {
    const { login, password } = req.body || {};
    if (typeof login !== 'string' || typeof password !== 'string' || !login.trim() || !password) {
      return res.status(400).json({ error: 'Заполните логин и пароль' });
    }
    const name = login.trim();
    const f = failures.get(name);
    if (f && f.lockedUntil > Date.now()) {
      log('login_blocked', name);
      const sec = Math.ceil((f.lockedUntil - Date.now()) / 1000);
      res.set('Retry-After', String(sec));
      return res.status(429).json({ error: `Слишком много попыток. Повторите через ${sec} с`, code: 'LOCKED' });
    }
    const user = users.find((u) => u.login === name);
    const ok = await bcrypt.compare(password, user ? user.hash : DUMMY_HASH);
    if (!user || !ok) {
      const cur = failures.get(name) || { count: 0, lockedUntil: 0 };
      cur.count += 1;
      if (cur.count >= maxFailures) { cur.lockedUntil = Date.now() + lockMs; cur.count = 0; }
      failures.set(name, cur);
      log('login_failed', name);
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    failures.delete(name);
    const jti = crypto.randomUUID();
    const token = jwt.sign({ role: user.role }, secret, {
      algorithm: 'HS256', expiresIn: jwtTtlSec, issuer: ISSUER, audience: AUDIENCE, subject: String(user.id), jwtid: jti
    });
    res.cookie(COOKIE, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
      maxAge: jwtTtlSec * 1000, path: '/'
    });
    log('login_success', user.login);
    res.json({ message: 'Вход выполнен' });
  });

  app.get('/api/me', authenticate, (req, res) => {
    const { id, login, name, role } = req.user;
    res.json({ id, login, name, role, expiresAt: req.token.exp * 1000 });
  });

  // --- Защищённые API ---
  app.get('/api/reports', authenticate, requireRole('manager', 'admin'), (req, res) => {
    res.json({ report: { activeUsers: users.length, managers: users.filter((u) => u.role === 'manager').length } });
  });

  app.get('/api/users', authenticate, requireRole('admin'), (req, res) => {
    res.json({ users: users.map(({ id, login, name, role }) => ({ id, login, name, role })) });
  });

  app.patch('/api/users/:id/role', authenticate, requireRole('admin'), (req, res) => {
    const target = users.find((u) => u.id === Number(req.params.id));
    if (!target) return res.status(404).json({ error: 'Пользователь не найден' });
    const { role } = req.body || {};
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Недопустимая роль' });
    if (target.id === req.user.id) return res.status(400).json({ error: 'Нельзя менять собственную роль' });
    const old = target.role;
    target.role = role;
    log('role_changed', req.user.login, { target: target.login, from: old, to: role });
    res.json({ id: target.id, login: target.login, role: target.role });
  });

  app.get('/api/audit', authenticate, requireRole('admin'), (req, res) => {
    res.json({ events: audit.slice(-50).reverse() });
  });

  // --- Выход: JWT самостоятельно не «отзывается», поэтому jti вносится в список отозванных ---
  app.post('/api/logout', (req, res) => {
    const token = req.cookies[COOKIE];
    if (token) {
      try {
        const p = jwt.verify(token, secret, { algorithms: ['HS256'], issuer: ISSUER, audience: AUDIENCE, ignoreExpiration: true });
        revoked.add(p.jti);
        const u = users.find((x) => x.id === Number(p.sub));
        log('logout', u ? u.login : 'unknown');
      } catch (_) { /* невалидный токен — отзывать нечего */ }
    }
    res.clearCookie(COOKIE, { path: '/' });
    res.json({ message: 'Выход выполнен' });
  });

  app.locals.secret = secret; // нужно только тестам, чтобы подделать токен
  return app;
}

module.exports = { createApp, ISSUER, AUDIENCE };
if (require.main === module) {
  const port = process.env.PORT || 3016;
  createApp().listen(port, () => console.log(`Вариант 16: http://localhost:${port}`));
}
