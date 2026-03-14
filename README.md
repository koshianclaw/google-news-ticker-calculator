# Google News Ticker Calculator

A small self-contained web app that combines:

- a live **Google News headline list**
- a scrolling **headline ticker / marquee**
- a built-in **calculator**

The browser does **not** fetch Google News directly, because that is commonly blocked by CORS. Instead, this project uses a tiny Node/Express server as a lightweight proxy that reads the public Google News RSS feed and serves clean JSON to the frontend every 5 seconds.

## Features

- Auto-refresh headlines every **5 seconds**
- Scrolling marquee ticker
- Clickable latest-news list
- Calculator with mouse + keyboard support
- Fallback/cached headlines when feed fetch fails
- Simple structure, easy to run locally or deploy

## Project structure

```text
google-news-ticker-calculator/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Requirements

- Node.js 18+ recommended
- npm

## Local setup

```bash
cd /Users/koshianclaw/Desktop/google-news-ticker-calculator
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## How it works

- Frontend calls `GET /api/news` every 5 seconds.
- Backend fetches the Google News RSS feed:
  - default: `https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en`
- Backend parses RSS and returns JSON.
- If Google News is temporarily unreachable, the app returns cached or fallback headlines so the UI still works.

## Change the feed / locale

You can point the server at a different Google News RSS URL:

```bash
GOOGLE_NEWS_RSS="https://news.google.com/rss?hl=zh-TW&gl=TW&ceid=TW:zh-Hant" npm start
```

## Deployment options

### Option 1: Run as a normal Node app

Works well on:
- Render
- Railway
- Fly.io
- a VPS
- your own server

Typical deploy command:

```bash
npm install
npm start
```

### Option 2: Docker / reverse proxy setup

Not included here because the app is intentionally kept minimal, but it is straightforward to wrap this Node server behind Nginx/Caddy.

## Why a server proxy is included

Directly fetching Google News from browser JavaScript is unreliable due to cross-origin restrictions. This project avoids that by doing the fetch server-side, which is the practical browser-safe solution.

## Caveats

- Google News RSS availability can vary by region/network.
- Headlines update every 5 seconds in the UI, but actual feed content may not change that frequently.
- Calculator evaluation accepts only digits, spaces, parentheses, and math operators `+ - * / .`.

## Suggested repo name

`google-news-ticker-calculator`

## Quick start summary

```bash
cd /Users/koshianclaw/Desktop/google-news-ticker-calculator
npm install
npm start
```

Open `http://localhost:3000`
