# WebProject Deployment (GitHub + Phone Access)

This repository already contains two GitHub Actions workflows:

- `.github/workflows/deploy-frontend-gh-pages.yml`
- `.github/workflows/deploy-backend-render.yml`

## Goal
Deploy frontend + backend so the app works from phone exactly like desktop using public URLs.

## 1) Frontend (GitHub Pages)
1. In GitHub: **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. In GitHub repo variables, add:
   - `VITE_API_BASE_URL=https://<your-render-backend-domain>/api`
4. Push to `main` (or run workflow manually in **Actions**).

Result: frontend is live at:
`https://<github-username>.github.io/WebProject/`

## 2) Backend (Render)
1. Create a Render **Web Service** from this repository.
2. Set **Root Directory** = `backend`.
3. Render will build from `backend/Dockerfile`.

Set these Render environment variables:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY=<generated key>`
- `APP_URL=https://<your-render-backend-domain>`
- `RUN_MIGRATIONS=true`
- `DB_CONNECTION=<sqlite or mysql>`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (if MySQL)
- `SANCTUM_STATEFUL_DOMAINS=<github-username>.github.io`
- `CORS_ALLOWED_ORIGINS=https://<github-username>.github.io`

## 3) Connect GitHub to backend deploy
1. In Render, create a **Deploy Hook** URL.
2. In GitHub repository secrets, add:
   - `RENDER_DEPLOY_HOOK_URL=<your-render-deploy-hook-url>`

Now any push to `main` touching `backend/**` triggers backend deployment.

## 4) Phone access checklist
- Open frontend URL on phone browser:
  - `https://<github-username>.github.io/WebProject/`
- Frontend calls backend over internet using `VITE_API_BASE_URL`.
- Backend CORS is configured via `CORS_ALLOWED_ORIGINS`.
- API/auth uses bearer tokens, so no localhost dependency.

## Notes
- GitHub Pages hosts frontend only (static).
- Backend must stay on Render (or equivalent public host).
- After first setup, deployment updates are fully GitHub-driven.
