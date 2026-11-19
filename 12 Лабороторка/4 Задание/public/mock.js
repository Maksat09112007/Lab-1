'use strict';
// ДЕМО-РЕЖИМ: используется только когда страница открыта как файл (file://), без сервера.
// Эмулирует те же маршруты API в браузере. Настоящая проверка — в server.js (npm run start:4).
(function () {
  const TTL = 15 * 60 * 1000;
  const KEY = 'demo_v4_session';
  const USERS = [
    { login: 'teacher1', password: 'Teach#2026', name: 'Айгерим Сериккызы', role: 'teacher' },
    { login: 'student1', password: 'Stud#2026', name: 'Ержан Нуров', role: 'student' }
  ];
  const GROUPS = [
    { group: 'ИС25-21', subject: 'Базы данных', students: 24 },
    { group: 'ИС25-22', subject: 'Технология программирования', students: 22 }
  ];
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; } };
  const res = (status, data) => Promise.resolve({ status, data });

  function auth() {
    const s = load();
    if (!s) return { err: res(401, { error: 'Требуется вход', code: 'NO_SESSION' }) };
    if (s.expiresAt <= Date.now()) {
      sessionStorage.removeItem(KEY);
      return { err: res(401, { error: 'Сессия истекла, войдите снова', code: 'SESSION_EXPIRED' }) };
    }
    return { s };
  }

  window.mockApi = function (method, url, body) {
    if (url === '/api/login' && method === 'POST') {
      const { login, password } = body || {};
      if (!login || !password) return res(400, { error: 'Заполните логин и пароль' });
      const u = USERS.find((x) => x.login === login && x.password === password);
      if (!u) return res(401, { error: 'Неверный логин или пароль' });
      sessionStorage.setItem(KEY, JSON.stringify({ login: u.login, name: u.name, role: u.role, expiresAt: Date.now() + TTL }));
      return res(200, { message: 'Вход выполнен', name: u.name, role: u.role });
    }
    if (url === '/api/profile' && method === 'GET') {
      const a = auth(); if (a.err) return a.err;
      return res(200, { name: a.s.name, role: a.s.role, login: a.s.login, expiresAt: a.s.expiresAt });
    }
    if (url === '/api/teacher/groups' && method === 'GET') {
      const a = auth(); if (a.err) return a.err;
      if (a.s.role !== 'teacher') return res(403, { error: 'Недостаточно прав для этого раздела', code: 'FORBIDDEN' });
      return res(200, { groups: GROUPS });
    }
    if (url === '/api/logout' && method === 'POST') {
      sessionStorage.removeItem(KEY);
      return res(200, { message: 'Выход выполнен' });
    }
    return res(404, { error: 'Не найдено' });
  };
})();
