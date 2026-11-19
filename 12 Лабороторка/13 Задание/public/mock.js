'use strict';
// ДЕМО-РЕЖИМ: используется только когда страница открыта как файл (file://), без сервера.
// Эмулирует те же маршруты API в браузере. Настоящая проверка — в server.js (npm run start:13).
(function () {
  const TTL = 15 * 60 * 1000;
  const SKEY = 'demo_v13_session', DKEY = 'demo_v13_db';
  const USERS = [
    { id: 1, login: 'user1', password: 'User1#2026', name: 'Данияр Омаров' },
    { id: 2, login: 'user2', password: 'User2#2026', name: 'Мадина Ахметова' }
  ];
  const initDb = () => ({
    nextId: 4, log: [],
    requests: [
      { id: 1, ownerId: 1, title: 'Не работает принтер в аудитории 204', description: '', status: 'в работе', createdAt: '2026-11-10' },
      { id: 2, ownerId: 1, title: 'Нужен доступ к лаборатории', description: '', status: 'новая', createdAt: '2026-11-15' },
      { id: 3, ownerId: 2, title: 'Замена проектора', description: '', status: 'новая', createdAt: '2026-11-12' }
    ]
  });
  const read = (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } };
  const db = () => read(DKEY) || initDb();
  const saveDb = (d) => sessionStorage.setItem(DKEY, JSON.stringify(d));
  const res = (status, data) => Promise.resolve({ status, data });
  const view = ({ id, title, description, status, createdAt }) => ({ id, title, description, status, createdAt });

  function auth() {
    const s = read(SKEY);
    if (!s) return { err: res(401, { error: 'Требуется вход', code: 'NO_SESSION' }) };
    if (s.expiresAt <= Date.now()) {
      sessionStorage.removeItem(SKEY);
      return { err: res(401, { error: 'Сессия истекла, войдите снова', code: 'SESSION_EXPIRED' }) };
    }
    return { s };
  }

  window.mockApi = function (method, url, body) {
    if (url === '/api/login' && method === 'POST') {
      const { login, password } = body || {};
      if (!login || !password) return res(400, { error: 'Заполните логин и пароль' });
      const u = USERS.find((x) => x.login === login && x.password === password);
      const d = db(); d.log.push({ login, success: Boolean(u), at: Date.now() }); saveDb(d);
      if (!u) return res(401, { error: 'Неверный логин или пароль' });
      sessionStorage.setItem(SKEY, JSON.stringify({ userId: u.id, login: u.login, name: u.name, expiresAt: Date.now() + TTL }));
      return res(200, { message: 'Вход выполнен', name: u.name });
    }
    if (url === '/api/logout' && method === 'POST') { sessionStorage.removeItem(SKEY); return res(200, { message: 'Выход выполнен' }); }

    const a = auth(); if (a.err) return a.err;
    const d = db();
    if (url === '/api/profile' && method === 'GET') return res(200, { name: a.s.name, login: a.s.login, expiresAt: a.s.expiresAt });
    if (url === '/api/requests' && method === 'GET') return res(200, { requests: d.requests.filter((r) => r.ownerId === a.s.userId).map(view) });
    if (url === '/api/requests' && method === 'POST') {
      const title = body && typeof body.title === 'string' ? body.title.trim() : '';
      if (!title || title.length > 100) return res(400, { error: 'Укажите тему заявки (до 100 символов)' });
      const item = { id: d.nextId++, ownerId: a.s.userId, title, description: String((body && body.description) || '').slice(0, 500), status: 'новая', createdAt: new Date().toISOString().slice(0, 10) };
      d.requests.push(item); saveDb(d);
      return res(201, view(item));
    }
    const m = url.match(/^\/api\/requests\/(\d+)$/);
    if (m && method === 'GET') {
      const item = d.requests.find((r) => r.id === Number(m[1]));
      if (!item) return res(404, { error: 'Заявка не найдена' });
      if (item.ownerId !== a.s.userId) return res(403, { error: 'Доступ запрещён: это чужая заявка', code: 'FORBIDDEN' });
      return res(200, view(item));
    }
    if (url === '/api/login-history' && method === 'GET') {
      return res(200, { history: d.log.filter((e) => e.login === a.s.login).slice(-10).reverse() });
    }
    return res(404, { error: 'Не найдено' });
  };
})();
