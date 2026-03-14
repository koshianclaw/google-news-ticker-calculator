const express = require('express');
const Parser = require('rss-parser');
const path = require('path');

const app = express();
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GoogleNewsTickerCalculator/1.0)'
  }
});

const PORT = process.env.PORT || 3000;
const GOOGLE_NEWS_RSS = process.env.GOOGLE_NEWS_RSS || 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';
const FETCH_INTERVAL_MS = 5000;
const CACHE_TTL_MS = 4000;

let cache = {
  fetchedAt: 0,
  source: 'fallback',
  items: []
};

const fallbackItems = [
  {
    title: 'Fallback headline: server could not reach Google News feed.',
    link: 'https://news.google.com/',
    pubDate: new Date().toUTCString(),
    source: 'Google News'
  },
  {
    title: 'Tip: run the local proxy server to avoid browser CORS issues.',
    link: 'https://news.google.com/',
    pubDate: new Date().toUTCString(),
    source: 'App Notice'
  },
  {
    title: 'You can swap the feed URL with GOOGLE_NEWS_RSS in your environment.',
    link: 'https://news.google.com/',
    pubDate: new Date().toUTCString(),
    source: 'App Notice'
  }
];

function normalizeItem(item) {
  const sourceName = item.creator || item.author || item.source?.title || item.source || 'Google News';
  return {
    title: item.title || 'Untitled headline',
    link: item.link || 'https://news.google.com/',
    pubDate: item.pubDate || item.isoDate || '',
    source: sourceName
  };
}

async function fetchNews() {
  const now = Date.now();
  if (cache.items.length && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }

  try {
    const feed = await parser.parseURL(GOOGLE_NEWS_RSS);
    const items = (feed.items || []).slice(0, 12).map(normalizeItem);

    cache = {
      fetchedAt: now,
      source: 'google-news-rss',
      items: items.length ? items : fallbackItems
    };
  } catch (error) {
    cache = {
      fetchedAt: now,
      source: 'fallback',
      items: cache.items.length ? cache.items : fallbackItems,
      error: error.message
    };
  }

  return cache;
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/news', async (_req, res) => {
  const result = await fetchNews();
  res.json({
    ok: true,
    refreshedEveryMs: FETCH_INTERVAL_MS,
    fetchedAt: new Date(result.fetchedAt).toISOString(),
    source: result.source,
    error: result.error || null,
    items: result.items
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Google News Ticker Calculator running at http://localhost:${PORT}`);
});
