'use strict';
// Вспомогательные функции для автоматических тестов.
async function start(app) {
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, close: () => new Promise((r) => server.close(r)) };
}

async function call(base, method, path, { body, cookie, headers } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(headers || {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (_) { /* не JSON */ }
  const setCookie = res.headers.get('set-cookie') || '';
  const cookieValue = setCookie ? setCookie.split(';')[0] : '';
  return { status: res.status, json, setCookie, cookie: cookieValue };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
module.exports = { start, call, sleep };
