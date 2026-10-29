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

/* ---------- Средний уровень, задание 12: пагинация ---------- */

const pageList = document.querySelector('#page-list');
const pageStatus = document.querySelector('#page-status');
const pageRetry = document.querySelector('#page-retry');
const pageInfo = document.querySelector('#page-info');
const pageLimitSelect = document.querySelector('#page-limit');
const pageFirst = document.querySelector('#page-first');
const pagePrev = document.querySelector('#page-prev');
const pageNext = document.querySelector('#page-next');

const pagination = { page: 1, limit: 10, total: 100, loaded: false, pendingPage: null };

function totalPages() {
  return Math.max(1, Math.ceil(pagination.total / pagination.limit));
}

function updatePager(busy) {
  pageInfo.textContent = `Страница ${pagination.page} из ${totalPages()}`;
  pageFirst.disabled = busy || pagination.page <= 1;
  pagePrev.disabled = busy || pagination.page <= 1;
  pageNext.disabled = busy || pagination.page >= totalPages();
  pageLimitSelect.disabled = busy;
}

async function loadPage(page) {
  pageRetry.hidden = true;
  pageList.replaceChildren();
  updatePager(true);
  setStatus(pageStatus, 'loading', 'Загрузка...');

  try {
    const { data: posts, response } = await request(
      `/posts?_page=${page}&_limit=${pagination.limit}`
    );
    const totalHeader = Number(response.headers.get('x-total-count'));
    if (Number.isInteger(totalHeader) && totalHeader > 0) {
      pagination.total = totalHeader;
    }
    pagination.page = page;
    pagination.pendingPage = null;
    pagination.loaded = true;

    if (posts.length === 0) {
      setStatus(pageStatus, 'empty', 'На этой странице нет данных.');
    } else {
      for (const post of posts) {
        const item = document.createElement('li');
        const num = document.createElement('span');
        num.className = 'num';
        num.textContent = `${post.id}.`;
        const title = document.createElement('span');
        title.textContent = post.title;
        item.append(num, title);
        pageList.append(item);
      }
      setStatus(pageStatus, 'success', `Загружено записей: ${posts.length}.`);
    }
  } catch (error) {
    setStatus(pageStatus, 'error', describeError(error));
    pageRetry.hidden = false;
    pagination.pendingPage = page;
  } finally {
    updatePager(false);
  }
}

pageFirst.addEventListener('click', () => loadPage(1));
pagePrev.addEventListener('click', () => loadPage(pagination.page - 1));
pageNext.addEventListener('click', () => loadPage(pagination.page + 1));
pageLimitSelect.addEventListener('change', () => {
  pagination.limit = Number(pageLimitSelect.value);
  loadPage(1);
});
pageRetry.addEventListener('click', () => {
  loadPage(pagination.pendingPage ?? pagination.page);
});

updatePager(false);
loadPage(1);

renderStats();
