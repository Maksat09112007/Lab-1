'use strict';
// Серверное хранилище сессий в памяти. В cookie уходит только случайный
// идентификатор (256 бит), все данные сессии остаются на сервере.
const crypto = require('crypto');

class SessionStore {
  constructor(ttlMs) {
    this.ttlMs = ttlMs;
    this.map = new Map();
  }
  create(data) {
    const id = crypto.randomBytes(32).toString('hex');
    this.map.set(id, { data, expiresAt: Date.now() + this.ttlMs });
    return id;
  }
  // Возвращает null (нет такой сессии) или { data, expiresAt, expired }
  get(id) {
    if (!id) return null;
    const s = this.map.get(id);
    if (!s) return null;
    return { data: s.data, expiresAt: s.expiresAt, expired: s.expiresAt <= Date.now() };
  }
  destroy(id) {
    this.map.delete(id);
  }
  sweep() {
    const now = Date.now();
    for (const [id, s] of this.map) if (s.expiresAt + 60000 < now) this.map.delete(id);
  }
}

function cookieOptions(ttlMs) {
  return {
    httpOnly: true,                                   // недоступна из JavaScript (защита от кражи при XSS)
    secure: process.env.NODE_ENV === 'production',    // только по HTTPS в рабочем режиме
    sameSite: 'strict',                               // защита от CSRF
    maxAge: ttlMs,
    path: '/'
  };
}

module.exports = { SessionStore, cookieOptions };
