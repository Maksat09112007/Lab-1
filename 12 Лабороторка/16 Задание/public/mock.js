'use strict';
// ДЕМО-РЕЖИМ: используется только когда страница открыта как файл (file://), без сервера.
// Эмулирует те же маршруты API в браузере (JWT здесь не создаётся).
// Настоящая проверка JWT — в server.js (npm run start:16).
(function () {
  const TTL = 15 * 60 * 1000, MAX_FAIL = 5, LOCK = 60 * 1000;
  const SKEY = 'demo_v16_session', DKEY = 'demo_v16_db';
  const initDb = () => ({
    audit: [], failures: {},
    users: [
      { id: 1, login: 'admin', password: 'Admin#2026', name: 'Администратор', role: 'admin' },
      { id: 2, login: 'manager', password: 'Manag#2026', name: 'Серик Манагер', role: 'manager' },
      { id: 3, login: 'user', password: 'Users#2026', name: 'Алия Пользователь', role: 'user' }
    ]
  });
  const read = (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } };
  const db = () => read(DKEY) || initDb();
  const saveDb = (d) => sessionStorage.setItem(DKEY, JSON.stringify(d));
  const res = (status, data) => Promise.resolve({ status, data });
  const log = (d, event, login, extra) => d.audit.push(Object.assign({ id: d.audit.length + 1, at: Date.now(), event, login }, extra || {}));
  const forbidden = () => res(403, { error: 'Недостаточно прав', code: 'FORBIDDEN' });

  window.mockApi = function (method, url, body) {
    const d = db();
    if (url === '/api/login' && method === 'POST') {
      const { login, password } = body || {};
      if (!login || !password) return res(400, { error: 'Заполните логин и пароль' });
      const f = d.failures[login];
      if (f && f.lockedUntil > Date.now()) {
        log(d, 'login_blocked', login); saveDb(d);
        return res(429, { error: `Слишком много попыток. Повторите через ${Math.ceil((f.lockedUntil - Date.now()) / 1000)} с`, code: 'LOCKED' });
      }
      const u = d.users.find((x) => x.login === login && x.password === password);
      if (!u) {
        const c = d.failures[login] || { count: 0, lockedUntil: 0 };
        c.count += 1;
        if (c.count >= MAX_FAIL) { c.lockedUntil = Date.now() + LOCK; c.count = 0; }
        d.failures[login] = c; log(d, 'login_failed', login); saveDb(d);
        return res(401, { error: 'Неверный логин или пароль' });
      }
      delete d.failures[login]; log(d, 'login_success', u.login); saveDb(d);
      sessionStorage.setItem(SKEY, JSON.stringify({ userId: u.id, expiresAt: Date.now() + TTL }));
      return res(200, { message: 'Вход выполнен' });
    }
    if (url === '/api/logout' && method === 'POST') {
      const s = read(SKEY);
      if (s) { const u = d.users.find((x) => x.id === s.userId); log(d, 'logout', u ? u.login : 'unknown'); saveDb(d); }
      sessionStorage.removeItem(SKEY);
      return res(200, { message: 'Выход выполнен' });
    }

    const s = read(SKEY);
    if (!s) return res(401, { error: 'Требуется вход', code: 'NO_TOKEN' });
    if (s.expiresAt <= Date.now()) { sessionStorage.removeItem(SKEY); return res(401, { error: 'Срок действия токена истёк, войдите снова', code: 'TOKEN_EXPIRED' }); }
    const me = d.users.find((x) => x.id === s.userId);
    if (!me) return res(401, { error: 'Пользователь не найден', code: 'TOKEN_INVALID' });

    if (url === '/api/me' && method === 'GET') return res(200, { id: me.id, login: me.login, name: me.name, role: me.role, expiresAt: s.expiresAt });
    if (url === '/api/reports' && method === 'GET') {
      if (!['manager', 'admin'].includes(me.role)) return forbidden();
      return res(200, { report: { activeUsers: d.users.length, managers: d.users.filter((u) => u.role === 'manager').length } });
    }
    if (url === '/api/users' && method === 'GET') {
      if (me.role !== 'admin') return forbidden();
      return res(200, { users: d.users.map((u) => ({ id: u.id, login: u.login, name: u.name, role: u.role })) });
    }
    if (url === '/api/audit' && method === 'GET') {
      if (me.role !== 'admin') return forbidden();
      return res(200, { events: d.audit.slice(-50).reverse() });
    }
    const m = url.match(/^\/api\/users\/(\d+)\/role$/);
    if (m && method === 'PATCH') {
      if (me.role !== 'admin') return forbidden();
      const t = d.users.find((x) => x.id === Number(m[1]));
      if (!t) return res(404, { error: 'Пользователь не найден' });
      const role = body && body.role;
      if (!['user', 'manager', 'admin'].includes(role)) return res(400, { error: 'Недопустимая роль' });
      if (t.id === me.id) return res(400, { error: 'Нельзя менять собственную роль' });
      const old = t.role; t.role = role; log(d, 'role_changed', me.login, { target: t.login, from: old, to: role }); saveDb(d);
      return res(200, { id: t.id, login: t.login, role: t.role });
    }
    return res(404, { error: 'Не найдено' });
  };
})();
