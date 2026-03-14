const statusText = document.getElementById('statusText');
const sourceText = document.getElementById('sourceText');
const updatedText = document.getElementById('updatedText');
const tickerTrack = document.getElementById('tickerTrack');
const newsList = document.getElementById('newsList');
const refreshButton = document.getElementById('refreshButton');
const toggleTickerButton = document.getElementById('toggleTickerButton');

const calcExpression = document.getElementById('calcExpression');
const calcResult = document.getElementById('calcResult');
const calcKeys = document.getElementById('calcKeys');
const clearCalcButton = document.getElementById('clearCalcButton');

const GOOGLE_NEWS_RSS = 'https://news.google.com/rss?hl=zh-TW&gl=TW&ceid=TW:zh-Hant';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const fallbackItems = [
  {
    title: 'Fallback headline: live Google News data is currently unavailable from this browser session.',
    link: 'https://news.google.com/',
    pubDate: new Date().toISOString(),
    source: 'App fallback'
  },
  {
    title: 'GitHub Pages cannot run a server-side proxy, so this app depends on public browser-accessible RSS helpers.',
    link: 'https://news.google.com/',
    pubDate: new Date().toISOString(),
    source: 'App notice'
  },
  {
    title: 'You can still use the ticker, open Google News manually, and keep the calculator fully functional offline.',
    link: 'https://news.google.com/',
    pubDate: new Date().toISOString(),
    source: 'App notice'
  }
];

const providers = [
  {
    name: 'rss2json',
    getUrl: () => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(GOOGLE_NEWS_RSS)}`,
    parse: (data) => ({
      source: 'rss2json → Google News RSS',
      items: (data.items || []).slice(0, 12).map((item) => ({
        title: item.title || 'Untitled headline',
        link: item.link || 'https://news.google.com/',
        pubDate: item.pubDate || '',
        source: item.author || item.source || 'Google News'
      }))
    })
  },
  {
    name: 'allorigins',
    getUrl: () => `https://api.allorigins.win/raw?url=${encodeURIComponent(GOOGLE_NEWS_RSS)}`,
    parse: (raw) => ({
      source: 'AllOrigins raw → Google News RSS',
      items: parseRssString(raw)
    })
  }
];

let expression = '';
let timerId;
let tickerPaused = false;
let lastItems = [...fallbackItems];

function formatDate(value) {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseRssString(xmlString) {
  const xml = new DOMParser().parseFromString(xmlString, 'application/xml');
  const parserError = xml.querySelector('parsererror');
  if (parserError) {
    throw new Error('Unable to parse RSS XML');
  }

  return Array.from(xml.querySelectorAll('item')).slice(0, 12).map((item) => ({
    title: item.querySelector('title')?.textContent?.trim() || 'Untitled headline',
    link: item.querySelector('link')?.textContent?.trim() || 'https://news.google.com/',
    pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
    source: item.querySelector('source')?.textContent?.trim() || 'Google News'
  }));
}

function renderNews(items) {
  const safeItems = items.length ? items : fallbackItems;
  lastItems = safeItems;

  const tickerText = safeItems.map((item) => item.title).join('  •  ');
  tickerTrack.textContent = tickerText;
  tickerTrack.setAttribute('title', tickerText);

  newsList.innerHTML = safeItems.map((item) => `
    <li class="news-item">
      <a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer noopener">${escapeHtml(item.title)}</a>
      <div class="news-meta">
        <span>${escapeHtml(item.source || 'Google News')}</span>
        <span>${escapeHtml(formatDate(item.pubDate))}</span>
      </div>
    </li>
  `).join('');
}

async function tryProvider(provider) {
  const response = await fetch(provider.getUrl(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`${provider.name} returned ${response.status}`);
  }

  const payload = provider.name === 'allorigins'
    ? await response.text()
    : await response.json();

  const parsed = provider.parse(payload);
  if (!parsed.items?.length) {
    throw new Error(`${provider.name} returned no headlines`);
  }

  return parsed;
}

async function fetchNews() {
  statusText.textContent = 'Refreshing…';
  sourceText.textContent = '-';

  const errors = [];
  for (const provider of providers) {
    try {
      const parsed = await tryProvider(provider);
      renderNews(parsed.items);
      statusText.textContent = 'Live';
      sourceText.textContent = parsed.source;
      updatedText.textContent = formatDate(new Date().toISOString());
      return;
    } catch (error) {
      errors.push(`${provider.name}: ${error.message}`);
    }
  }

  renderNews(lastItems.length ? lastItems : fallbackItems);
  statusText.textContent = 'Fallback';
  sourceText.textContent = 'cached/local fallback';
  updatedText.textContent = formatDate(new Date().toISOString());
  console.warn('Headline fetch failed:', errors.join(' | '));
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

toggleTickerButton.addEventListener('click', () => {
  tickerPaused = !tickerPaused;
  tickerTrack.classList.toggle('paused', tickerPaused);
  toggleTickerButton.textContent = tickerPaused ? 'Resume ticker' : 'Pause ticker';
});

updateCalculatorDisplay();
renderNews(fallbackItems);
fetchNews();
timerId = setInterval(fetchNews, REFRESH_INTERVAL_MS);

window.addEventListener('beforeunload', () => {
  clearInterval(timerId);
});
