# CHRISTMAS-TREES

React + TypeScript + Vite storefront prepared for automatic deployment to GitHub Pages from the `master` branch.

## GitHub Pages

The repository contains `.github/workflows/deploy-pages.yml`.

Every push to `master` performs:

1. `npm ci`
2. production Vite build
3. GitHub Pages SPA fallback generation
4. upload of `dist`
5. automatic deployment to GitHub Pages

No `gh-pages` branch is required.

### First setup

1. Push the project to a GitHub repository using the `master` branch.
2. Open `Settings -> Pages`.
3. Under `Build and deployment`, choose `GitHub Actions` as the source.
4. Push a new commit to `master` or run `Deploy GitHub Pages` manually from the Actions tab.

For a normal project repository the site URL will be:

`https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`

The workflow automatically calculates the Vite base path from the repository name, so the repository can be renamed without editing the source code.

## Optional repository variables

Open `Settings -> Secrets and variables -> Actions -> Variables`.

### `SITE_URL`

Optional custom public website URL.

Example:

`https://dream-trees.kz`

If it is not configured, the workflow automatically uses the GitHub Pages URL for canonical URLs and the generated sitemap.

### `VITE_ORDER_API_URL`

Public HTTPS URL of the order API.

Example:

`https://dream-trees-api.vercel.app/api/order`

GitHub Pages only hosts static frontend files. It cannot execute `api/order.js`, so Telegram orders require the API to be deployed separately on Vercel, Netlify, Cloudflare Workers, a Node server, or another backend host.

Local development still uses `/api/order` through the Vite development plugin.

## Telegram order API

The existing `api/order.js` can be deployed as a Vercel Function.

Backend environment variables:

`TELEGRAM_BOT_TOKEN`

`TELEGRAM_CHAT_ID`

`TELEGRAM_DRY_RUN=false`

`ALLOWED_ORIGINS=https://YOUR_USERNAME.github.io/YOUR_REPOSITORY`

For multiple allowed frontends, separate origins with commas.

Never put the Telegram bot token into `VITE_*`, `data/shopConfig.json`, `public`, or any frontend file. `VITE_*` variables are visible in the browser bundle.

## Local development

```bash
npm ci
npm run dev
```

## Manual production build

```bash
npm run build
```

## Push flow

```bash
git add .
git commit -m "Update storefront"
git push origin master
```

After the push, GitHub Actions rebuilds and republishes the site automatically.

## Product images

Product and review image paths are read from `data/products.js` and `data/opinionsData.json`. Keep the existing `public/images` directory from your storefront repository when replacing the source files with this archive. If an image is unavailable, the UI falls back to `public/tree-placeholder.svg` instead of leaving a broken image.

## Production order API

When deploying the frontend to GitHub Pages, set the repository Action variable `VITE_ORDER_API_URL` to the public HTTPS endpoint of the deployed order API. Without that variable, the GitHub Pages frontend will not attempt to send an order to a nonexistent `/api/order` endpoint and will show the normal order error state instead.
