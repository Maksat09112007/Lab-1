'use strict';

const API_URL = 'https://jsonplaceholder.typicode.com';
const SEARCH_DELAY = 400;

/* ---------- Общая часть: запросы, статистика, состояния ---------- */

const stats = { count: 0, lastMs: null, aborted: 0 };

const countEl = document.querySelector('#req-count');
const timeEl = document.querySelector('#req-time');
const abortedEl = document.querySelector('#req-aborted');

function renderStats() {
  countEl.textContent = String(stats.count);
  timeEl.textContent = stats.lastMs === null ? '—' : `${stats.lastMs} мс`;
  abortedEl.textContent = String(stats.aborted);
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



renderStats();

/* ---------- Повышенный уровень, задание 19: debounce + AbortController ---------- */

const searchInput = document.querySelector('#search-input');
const searchStatus = document.querySelector('#search-status');
const searchRetry = document.querySelector('#search-retry');
const searchList = document.querySelector('#search-list');

let searchTimer = null;
let searchController = null;
let lastQuery = '';

function resetSearch() {
  if (searchController) {
    searchController.abort();
    searchController = null;
  }
  searchRetry.hidden = true;
  searchList.replaceChildren();
}

async function runSearch(query) {
  if (searchController) {
    searchController.abort(); // отмена предыдущего запроса
  }
  const controller = new AbortController();
  searchController = controller;
  lastQuery = query;
  searchRetry.hidden = true;
  searchList.replaceChildren();
  setStatus(searchStatus, 'loading', `Поиск «${query}»...`);

  try {
    const { data: posts } = await request(
      `/posts?title_like=${encodeURIComponent(query)}&_limit=10`,
      { signal: controller.signal }
    );
    if (posts.length === 0) {
      setStatus(searchStatus, 'empty', `По запросу «${query}» ничего не найдено.`);
      return;
    }
    for (const post of posts) {
      const item = document.createElement('li');
      const num = document.createElement('span');
      num.className = 'num';
      num.textContent = `${post.id}.`;
      const title = document.createElement('span');
      title.textContent = post.title;
      item.append(num, title);
      searchList.append(item);
    }
    setStatus(searchStatus, 'success', `Найдено: ${posts.length} (показано не более 10).`);
  } catch (error) {
    if (error.name === 'AbortError') {
      stats.aborted += 1; // устаревший запрос отменён, интерфейс не трогаем
      renderStats();
      return;
    }
    setStatus(searchStatus, 'error', describeError(error));
    searchRetry.hidden = false;
  } finally {
    if (searchController === controller) {
      searchController = null;
    }
  }
}

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const query = searchInput.value.trim();
  if (query === '') {
    resetSearch();
    setStatus(searchStatus, 'empty', 'Введите запрос.');
    return;
  }
  setStatus(searchStatus, 'empty', 'Ожидание окончания ввода...');
  searchTimer = setTimeout(() => runSearch(query), SEARCH_DELAY);
});

searchRetry.addEventListener('click', () => {
  if (lastQuery !== '') {
    runSearch(lastQuery);
  }
});

renderStats();
