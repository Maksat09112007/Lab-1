'use strict';
const $ = (s) => document.querySelector(s);
const guest = $('#guest'), cabinet = $('#cabinet'), statusEl = $('#status');
let expiresAt = 0, ticker = null;

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

function showGuest() {
  clearInterval(ticker);
  cabinet.hidden = true; guest.hidden = false;
  $('#groups').replaceChildren();
}

function showCabinet(p) {
  guest.hidden = true; cabinet.hidden = false;
  $('#userName').textContent = p.name;                 // textContent: данные не интерпретируются как HTML
  $('#userRole').textContent = p.role === 'teacher' ? 'преподаватель' : 'студент';
  expiresAt = p.expiresAt;
  clearInterval(ticker);
  tick(); ticker = setInterval(tick, 1000);
}

function tick() {
  const left = Math.max(0, expiresAt - Date.now());
  const m = String(Math.floor(left / 60000)).padStart(2, '0');
  const s = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
  $('#timeLeft').textContent = `${m}:${s}`;
  $('.timer').classList.toggle('low', left < 60000);
  if (left === 0) { showGuest(); say('Сессия истекла, войдите снова', 'error'); }
}

// Обновление страницы: состояние берём у сервера, а не из клиентского хранилища
async function restore() {
  const r = await api('GET', '/api/profile');
  if (r.status === 200) showCabinet(r.data); else showGuest();
}

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const login = $('#login').value.trim(), password = $('#password').value;
  if (!login || !password) return say('Заполните логин и пароль', 'error');
  const r = await api('POST', '/api/login', { login, password });
  $('#password').value = '';
  if (r.status !== 200) return say(r.data.error || 'Ошибка входа', 'error');
  say(r.data.message, 'ok');
  restore();
});

$('#loadGroups').addEventListener('click', async () => {
  const r = await api('GET', '/api/teacher/groups');
  if (r.status === 401) { showGuest(); return say(r.data.error, 'error'); }
  if (r.status === 403) return say(`403: ${r.data.error}`, 'error');
  const ul = $('#groups'); ul.replaceChildren();
  r.data.groups.forEach((g) => {
    const li = document.createElement('li');
    li.textContent = `${g.group} — ${g.subject} (${g.students} студ.)`;
    ul.appendChild(li);
  });
  say('', '');
});

$('#logout').addEventListener('click', async () => {
  await api('POST', '/api/logout');
  showGuest(); say('Вы вышли из системы', 'ok');
});

restore();
