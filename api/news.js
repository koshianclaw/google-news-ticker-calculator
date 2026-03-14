const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GoogleNewsTickerCalculator/1.0)'
  }
});

const GOOGLE_NEWS_RSS = process.env.GOOGLE_NEWS_RSS || 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';

const fallbackItems = [
  {
    title: 'Fallback headline: serverless function could not reach Google News feed.',
    link: 'https://news.google.com/',
    pubDate: new Date().toUTCString(),
    source: 'Google News'
  },
  {
    title: 'Tip: deploy this API on Vercel and point GitHub Pages to the API base URL.',
    link: 'https://news.google.com/',
    pubDate: new Date().toUTCString(),
    source: 'App Notice'
  }
];

function normalizeItem(item) {
  return {
    title: item.title || 'Untitled headline',
    link: item.link || 'https://news.google.com/',
    pubDate: item.pubDate || item.isoDate || '',
    source: item.creator || item.author || item.source?.title || item.source || 'Google News'
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const feed = await parser.parseURL(GOOGLE_NEWS_RSS);
    const items = (feed.items || []).slice(0, 12).map(normalizeItem);
    return res.status(200).json({
      ok: true,
      source: 'google-news-rss',
      fetchedAt: new Date().toISOString(),
      error: null,
      items: items.length ? items : fallbackItems
    });
  } catch (error) {
    return res.status(200).json({
      ok: true,
      source: 'fallback',
      fetchedAt: new Date().toISOString(),
      error: error.message,
      items: fallbackItems
    });
  }
};
