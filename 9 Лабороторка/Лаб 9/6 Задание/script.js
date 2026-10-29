'use strict';

const API_URL = 'https://jsonplaceholder.typicode.com';

/* ---------- Общая часть: запросы, статистика, состояния ---------- */

const stats = { count: 0, lastMs: null };

const countEl = document.querySelector('#req-count');
const timeEl = document.querySelector('#req-time');

function renderStats() {
  countEl.textContent = String(stats.count);
  timeEl.textContent = stats.lastMs === null ? '—' : `${stats.lastMs} мс`;
}

// Единая функция запроса: считает запросы, замеряет время, проверяет response.ok
async function request(path, options = {}) {
  stats.count += 1;
  renderStats();
  const started = performance.now();
  const response = await fetch(API_URL + path, options);
  stats.lastMs = Math.round(performance.now() - started);
  renderStats();
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  return { data, response };
}

// state: loading | success | error | empty
function setStatus(element, state, text) {
  element.dataset.state = state;
  element.textContent = text;
}

function describeError(error) {
  if (error.status === 404) {
    return 'Данные не найдены (HTTP 404).';
  }
  if (error.status) {
    return `Сервер вернул ошибку: ${error.message}.`;
  }
  return 'Не удалось связаться с сервером. Проверьте подключение к сети.';
}

/* ---------- Базовый уровень, задание 6: публикация по ID ---------- */

const postForm = document.querySelector('#post-form');
const postIdInput = document.querySelector('#post-id');
const postSubmit = document.querySelector('#post-submit');
const postStatus = document.querySelector('#post-status');
const postRetry = document.querySelector('#post-retry');
const postCard = document.querySelector('#post-card');
const postTitle = document.querySelector('#post-title');
const postBody = document.querySelector('#post-body');
const postMetaId = document.querySelector('#post-meta-id');
const postMetaUser = document.querySelector('#post-meta-user');

let lastPostId = null;

async function loadPost(id) {
  lastPostId = id;
  postSubmit.disabled = true;
  postRetry.hidden = true;
  postCard.hidden = true;
  setStatus(postStatus, 'loading', 'Загрузка...');

  try {
    const { data: post } = await request(`/posts/${id}`);
    postTitle.textContent = post.title ?? '(без заголовка)';
    postBody.textContent = post.body ?? '(текст отсутствует)';
    postMetaId.textContent = String(post.id ?? id);
    postMetaUser.textContent = String(post.userId ?? '—');
    postCard.hidden = false;
    setStatus(postStatus, 'success', 'Публикация загружена.');
  } catch (error) {
    if (error.status === 404) {
      setStatus(postStatus, 'empty', `Публикация с ID ${id} не найдена (HTTP 404).`);
    } else {
      setStatus(postStatus, 'error', describeError(error));
    }
    postRetry.hidden = false;
  } finally {
    postSubmit.disabled = false;
  }
}

postForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const raw = postIdInput.value.trim();
  const id = Number(raw);
  postCard.hidden = true;
  postRetry.hidden = true;
  if (raw === '' || !Number.isInteger(id) || id < 1) {
    setStatus(postStatus, 'error', 'Введите целое число больше нуля.');
    return;
  }
  loadPost(id);
});

postRetry.addEventListener('click', () => {
  if (lastPostId !== null) {
    loadPost(lastPostId);
  }
});

renderStats();
