# Google News Ticker Calculator

A GitHub Pages-friendly static web app that combines:

- a **headline list**
- a scrolling **headline ticker / marquee**
- a built-in **calculator**

This version is **pure frontend**: no Node.js server, no Express proxy, no backend runtime.

## What changed

The original app depended on a local Node/Express backend to fetch Google News RSS and expose `/api/news` to the browser. That works locally, but it does **not** work on GitHub Pages because GitHub Pages can only host static files.

This repo has been converted to a static build that:

- loads news directly in the browser
- tries public browser-accessible RSS helper services
- falls back gracefully to cached/local sample headlines if live fetches fail
- keeps the calculator fully client-side

## Features

- Static site deployable on **GitHub Pages**
- Latest headline list
- Scrolling marquee ticker
- Calculator with mouse + keyboard support
- Manual refresh button
- Graceful fallback when live news fetch is blocked

## Project structure

```text
google-news-ticker-calculator/
├── app.js
├── index.html
├── styles.css
├── README.md
└── .gitignore
```

## Run locally

Because this is a static app, you can open `index.html` directly or serve the folder with any static file server.

### Simplest

Open:

```text
index.html
```

### Optional local static server

Examples:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
3. Save.

GitHub Pages will serve the app directly from the repository root.

## How news loading works

Default feed target:

```text
https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en
```

The frontend attempts these browser-side sources in order:

1. `rss2json` API wrapping the Google News RSS feed
2. `AllOrigins` raw proxy + client-side RSS XML parsing

If both fail, the UI:

- keeps working
- shows fallback/cached headlines
- still provides the marquee and calculator

## Tradeoffs / caveats

This is the honest part:

### Why this is not as reliable as the old backend

A frontend-only site cannot safely or consistently fetch Google News RSS directly from the browser because of **CORS restrictions**. Public RSS helper services are the most practical static-only workaround, but they come with tradeoffs:

- they may rate-limit requests
- they may go down temporarily
- they may block some regions or networks
- they are third-party dependencies outside this repo

### What you gain

- zero backend
- works on GitHub Pages
- simple deployment
- no server maintenance

### What you lose

- full control over feed fetching reliability
- guaranteed availability of live headlines
- custom secret/config-based server behavior

If you need maximum reliability, a tiny serverless/API proxy would still be the better architecture than pure static hosting.

## Calculator safety note

Calculator evaluation only accepts digits, spaces, parentheses, and math operators:

```text
+ - * / .
```

Unsupported input is rejected.

## Suggested repo name

`google-news-ticker-calculator`
