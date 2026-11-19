'use strict';
const $ = (s) => document.querySelector(s);
const guest = $('#guest'), appBox = $('#app'), statusEl = $('#status');

function say(text, kind) { statusEl.textContent = text; statusEl.className = kind || ''; }

async function api(method, url, body) {
  if (location.protocol === 'file:') return window.mockApi(method, url, body); // демо без сервера
  const res = await fetch(url, {
    method, credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (_) { /* пустое тело */ }
  return { status: res.status, data };
}

function showGuest() { appBox.hidden = true; guest.hidden = false; }

// Единая обработка отказов: 401 -> экран входа, 403/404 -> сообщение
function handleDenied(r) {
  if (r.status === 401) { showGuest(); say(r.data.error || 'Требуется вход', 'error'); return true; }
  if (r.status === 403) { say(`403 — ${r.data.error}`, 'error'); return true; }
  if (r.status === 404) { say(`404 — ${r.data.error}`, 'error'); return true; }
  return false;
}

function addItem(ul, text, extra) {
  const li = document.createElement('li');
  li.textContent = text;
  if (extra) {
    const s = document.createElement('span');
    s.className = 'st'; s.textContent = ` — ${extra}`;
    li.appendChild(s);
  }
  ul.appendChild(li);
}

async function loadAll() {
  const p = await api('GET', '/api/profile');
  if (p.status !== 200) return showGuest();
  guest.hidden = true; appBox.hidden = false;
  $('#userName').textContent = p.data.name;

  const r = await api('GET', '/api/requests');
  if (handleDenied(r)) return;
  const list = $('#list'); list.replaceChildren();
  if (!r.data.requests.length) addItem(list, 'Заявок пока нет');
  r.data.requests.forEach((x) => addItem(list, `№${x.id} ${x.title}`, `${x.status}, ${x.createdAt}`));

  const h = await api('GET', '/api/login-history');
  const hl = $('#history'); hl.replaceChildren();
  if (h.status === 200) {
    h.data.history.forEach((e) => addItem(hl, new Date(e.at).toLocaleString('ru-RU'), e.success ? 'успешно' : 'неудачно'));
  }
}

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const login = $('#login').value.trim(), password = $('#password').value;
  if (!login || !password) return say('Заполните логин и пароль', 'error');
  const r = await api('POST', '/api/login', { login, password });
  $('#password').value = '';
  if (r.status !== 200) return say(r.data.error || 'Ошибка входа', 'error');
  say(r.data.message, 'ok');
  loadAll();
});

$('#newForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = $('#title').value.trim();
  if (!title) return say('Укажите тему заявки', 'error');
  const r = await api('POST', '/api/requests', { title, description: $('#desc').value });
  if (handleDenied(r)) return;
  if (r.status !== 201) return say(r.data.error || 'Ошибка', 'error');
  $('#title').value = ''; $('#desc').value = '';
  say(`Заявка №${r.data.id} создана`, 'ok');
  loadAll();
});

$('#openForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#reqId').value;
  if (!id) return say('Введите номер заявки', 'error');
  const r = await api('GET', `/api/requests/${encodeURIComponent(id)}`);
  const d = $('#detail');
  if (handleDenied(r)) { d.textContent = ''; return; }
  d.textContent = `№${r.data.id}: ${r.data.title} (${r.data.status})`;
  say('', '');
});

$('#logout').addEventListener('click', async () => {
  if (!confirm('Выйти из системы?')) return;
  await api('POST', '/api/logout');
  showGuest(); say('Вы вышли из системы', 'ok');
});

loadAll();
