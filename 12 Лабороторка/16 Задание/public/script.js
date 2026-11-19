'use strict';
const $ = (s) => document.querySelector(s);
const guest = $('#guest'), appBox = $('#app'), statusEl = $('#status');
const ROLE_RU = { user: 'пользователь', manager: 'менеджер', admin: 'администратор' };
let me = null, ticker = null;

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

function clearViews() {
  $('#report').textContent = '';
  ['#usersTable', '#auditTable'].forEach((s) => { $(s).hidden = true; $(s + ' tbody').replaceChildren(); });
}

function showGuest() { clearInterval(ticker); me = null; appBox.hidden = true; guest.hidden = false; clearViews(); }

function denied(r) {
  if (r.status === 401) { showGuest(); say(r.data.error || 'Требуется вход', 'error'); return true; }
  if (r.status === 403) { say(`403 — ${r.data.error}`, 'error'); return true; }
  if (r.status === 429) { say(r.data.error, 'error'); return true; }
  return false;
}

function cell(tr, text) { const td = document.createElement('td'); td.textContent = text; tr.appendChild(td); return td; }

function tick() {
  const left = Math.max(0, me.expiresAt - Date.now());
  $('#timeLeft').textContent = `${String(Math.floor(left / 60000)).padStart(2, '0')}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`;
  $('.timer').classList.toggle('low', left < 60000);
  if (left === 0) { showGuest(); say('Токен истёк, войдите снова', 'error'); }
}

async function restore() {
  const r = await api('GET', '/api/me');
  if (r.status !== 200) return showGuest();
  me = r.data;
  guest.hidden = true; appBox.hidden = false;
  $('#userName').textContent = me.name;
  $('#userRole').textContent = ROLE_RU[me.role] || me.role;
  clearInterval(ticker); tick(); ticker = setInterval(tick, 1000);
}

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const login = $('#login').value.trim(), password = $('#password').value;
  if (!login || !password) return say('Заполните логин и пароль', 'error');
  const r = await api('POST', '/api/login', { login, password });
  $('#password').value = '';
  if (r.status !== 200) return say(r.data.error || 'Ошибка входа', 'error');
  say(r.data.message, 'ok'); restore();
});

$('#btnReport').addEventListener('click', async () => {
  clearViews();
  const r = await api('GET', '/api/reports');
  if (denied(r)) return;
  $('#report').textContent = `Пользователей: ${r.data.report.activeUsers}, менеджеров: ${r.data.report.managers}`;
  say('', '');
});

$('#btnUsers').addEventListener('click', async () => {
  clearViews();
  const r = await api('GET', '/api/users');
  if (denied(r)) return;
  const body = $('#usersTable tbody');
  r.data.users.forEach((u) => {
    const tr = document.createElement('tr');
    cell(tr, u.login); cell(tr, u.name);
    const td = document.createElement('td');
    const sel = document.createElement('select');
    ['user', 'manager', 'admin'].forEach((role) => {
      const o = document.createElement('option'); o.value = role; o.textContent = ROLE_RU[role]; sel.appendChild(o);
    });
    sel.value = u.role; sel.disabled = u.id === me.id;
    sel.addEventListener('change', async () => {
      const rr = await api('PATCH', `/api/users/${u.id}/role`, { role: sel.value });
      if (denied(rr)) return;
      if (rr.status !== 200) { say(rr.data.error, 'error'); sel.value = u.role; return; }
      u.role = rr.data.role; say(`Роль «${u.login}» изменена`, 'ok');
    });
    td.appendChild(sel); tr.appendChild(td); body.appendChild(tr);
  });
  $('#usersTable').hidden = false; say('', '');
});

$('#btnAudit').addEventListener('click', async () => {
  clearViews();
  const r = await api('GET', '/api/audit');
  if (denied(r)) return;
  const body = $('#auditTable tbody');
  r.data.events.forEach((ev) => {
    const tr = document.createElement('tr');
    cell(tr, new Date(ev.at).toLocaleString('ru-RU')); cell(tr, ev.event); cell(tr, ev.login);
    cell(tr, ev.target ? `${ev.target}: ${ev.from} → ${ev.to}` : '');
    body.appendChild(tr);
  });
  $('#auditTable').hidden = false; say('', '');
});

$('#logout').addEventListener('click', async () => {
  await api('POST', '/api/logout');
  showGuest(); say('Вы вышли из системы', 'ok');
});

restore();
