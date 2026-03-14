const statusText = document.getElementById('statusText');
const sourceText = document.getElementById('sourceText');
const updatedText = document.getElementById('updatedText');
const tickerTrack = document.getElementById('tickerTrack');
const newsList = document.getElementById('newsList');
const refreshButton = document.getElementById('refreshButton');

const calcExpression = document.getElementById('calcExpression');
const calcResult = document.getElementById('calcResult');
const calcKeys = document.getElementById('calcKeys');
const clearCalcButton = document.getElementById('clearCalcButton');

let expression = '';
let timerId;

function formatDate(value) {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function renderNews(items) {
  tickerTrack.textContent = items.map((item) => item.title).join('  •  ');

  newsList.innerHTML = items.map((item) => `
    <li class="news-item">
      <a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a>
      <div class="news-meta">
        <span>${item.source || 'Google News'}</span>
        <span>${formatDate(item.pubDate)}</span>
      </div>
    </li>
  `).join('');
}

async function fetchNews() {
  statusText.textContent = 'Refreshing…';
  try {
    const response = await fetch('/api/news', { cache: 'no-store' });
    const data = await response.json();

    renderNews(data.items || []);
    statusText.textContent = data.error ? 'Using cached/fallback data' : 'Live';
    sourceText.textContent = data.source || '-';
    updatedText.textContent = formatDate(data.fetchedAt);
  } catch (error) {
    statusText.textContent = 'Offline / failed';
    sourceText.textContent = 'unavailable';
    updatedText.textContent = '-';
    tickerTrack.textContent = 'Unable to load headlines right now.';
    newsList.innerHTML = '<li class="placeholder">Unable to fetch headlines. Check that the server is running.</li>';
  }
}

function safeEvaluate(rawExpression) {
  if (!rawExpression.trim()) return '0';
  if (!/^[0-9+\-*/().\s]+$/.test(rawExpression)) {
    throw new Error('Unsupported input');
  }

  const result = Function(`"use strict"; return (${rawExpression})`)();
  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('Invalid math result');
  }

  return Number(result.toFixed(10)).toString();
}

function updateCalculatorDisplay() {
  calcExpression.textContent = expression || '0';
  try {
    calcResult.textContent = safeEvaluate(expression);
  } catch {
    calcResult.textContent = expression ? 'Error' : '0';
  }
}

function onCalcInput(action, value) {
  if (action === 'clear') {
    expression = '';
  } else if (action === 'delete') {
    expression = expression.slice(0, -1);
  } else if (action === 'equals') {
    try {
      expression = safeEvaluate(expression);
    } catch {
      expression = '';
      calcResult.textContent = 'Error';
    }
  } else if (value) {
    expression += value;
  }

  updateCalculatorDisplay();
}

calcKeys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  onCalcInput(button.dataset.action, button.dataset.value);
});

clearCalcButton.addEventListener('click', () => {
  expression = '';
  updateCalculatorDisplay();
});

window.addEventListener('keydown', (event) => {
  const allowed = '0123456789+-*/().';
  if (allowed.includes(event.key)) {
    expression += event.key;
    updateCalculatorDisplay();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    onCalcInput('equals');
  } else if (event.key === 'Backspace') {
    expression = expression.slice(0, -1);
    updateCalculatorDisplay();
  } else if (event.key === 'Escape') {
    expression = '';
    updateCalculatorDisplay();
  }
});

refreshButton.addEventListener('click', fetchNews);

updateCalculatorDisplay();
fetchNews();
timerId = setInterval(fetchNews, 5000);

window.addEventListener('beforeunload', () => {
  clearInterval(timerId);
});
