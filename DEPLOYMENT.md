# Paper & Loop — Production Deployment

This guide deploys **Paper & Loop** with:

| Component | Platform |
|-----------|----------|
| Frontend (React SPA) | [Vercel](https://vercel.com) |
| Backend (FastAPI) | [Railway](https://railway.app) or [Render](https://render.com) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Product images | `backend/uploads/` on the backend host (persistent volume) |

Docker is **not required** in production. Use it locally only if you want a local MongoDB instance.

---

## 1. MongoDB Atlas

1. Create a free **M0** cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Database Access** → Add user with password (save credentials).
3. **Network Access** → Allow access from anywhere (`0.0.0.0/0`) for cloud hosts, or restrict to your backend IP.
4. **Connect** → Drivers → copy connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Set database name: `paper_loop` (append `&appName=PaperLoop` if desired).

---

## 2. Backend (FastAPI)

Deploy to **Railway** or **Render** with a **persistent disk** for uploads.

### Required environment variables

| Variable | Example | Description |
|----------|---------|-------------|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster...` | Atlas connection string |
| `DB_NAME` | `paper_loop` | MongoDB database name |
| `JWT_SECRET` | `<long-random-string>` | Sign JWT tokens (use `openssl rand -hex 32`) |
| `APP_ENV` | `production` | Disables OTP dev_code in responses |
| `CORS_ORIGINS` | `https://paperandloop.com,https://www.paperandloop.com` | Comma-separated frontend URLs |
| `RESEND_API_KEY` | `re_...` | Optional — real OTP & order emails |
| `SENDER_EMAIL` | `Paper & Loop <hello@paperandloop.com>` | Verified Resend sender |

### Start command

```bash
uvicorn server:app --host 0.0.0.0 --port $PORT
```

### Persistent uploads

Product images live in `backend/uploads/`. On Railway/Render:

1. Mount a **volume** at `/app/backend/uploads` (or your deploy root + `uploads`).
2. On first deploy, ensure the `Images/` folder from the repo is present and the server will copy assets on startup when the products collection is empty.
3. Alternatively run once after deploy:
   ```bash
   python seed_local_products.py
   ```

### Railway example

```bash
# From repo root
cd backend
railway init
railway add --plugin mongodb   # OR set MONGO_URL manually to Atlas
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set APP_ENV=production
railway variables set CORS_ORIGINS=https://your-app.vercel.app
railway up
```

Note the public URL, e.g. `https://paper-loop-api.up.railway.app`.

### Render example

- **Build command:** `pip install -r requirements.txt` (or minimal deps listed in README)
- **Start command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Add a **Disk** mounted at `uploads` with path `backend/uploads`

---

## 3. Frontend (Vercel)

### Environment variables (Vercel project settings)

| Variable | Value |
|----------|-------|
| `REACT_APP_BACKEND_URL` | `https://paper-loop-api.up.railway.app` (no trailing slash) |

### Deploy

1. Import the GitHub repo into Vercel.
2. Set **Root Directory** to `frontend`.
3. **Build command:** `npm run build` (or `npm install --legacy-peer-deps && npm run build`)
4. **Output directory:** `build`
5. Add `REACT_APP_BACKEND_URL` pointing to your live API.
6. Deploy.

`frontend/vercel.json` handles SPA routing (all routes → `index.html`).

### Custom domain

Point `paperandloop.com` to Vercel, then add the domain to `CORS_ORIGINS` on the backend.

---

## 4. Post-deploy checklist

- [ ] Backend `/api/` returns `{ "status": "alive" }`
- [ ] `/api/products` returns 11 real products with `/api/uploads/...` image URLs
- [ ] `/api/settings` returns `hero_background_url` as a local upload path
- [ ] Frontend loads hero, shop, and product images from the backend URL
- [ ] Admin login works (`ritheeshvaran2007@gmail.com` — **change password immediately**)
- [ ] OTP emails send via Resend (or verify `dev_code` is NOT returned in production)
- [ ] GPay QR and UPI ID configured in Admin → Settings
- [ ] HTTPS on both frontend and backend

---

## 5. Local development (no Docker required if Atlas is used)

```powershell
# Backend
cd backend
copy .env.example .env
# Set MONGO_URL to Atlas or mongodb://localhost:27017
pip install fastapi uvicorn motor pymongo bcrypt PyJWT python-dotenv python-multipart pydantic email-validator resend
python -m uvicorn server:app --reload --port 8000

# Frontend
cd frontend
copy .env.example .env
# REACT_APP_BACKEND_URL=http://localhost:8000
npm install --legacy-peer-deps
npm install ajv@8.17.1 --legacy-peer-deps
npm start
```

For local MongoDB without Atlas, use Docker optionally:

```bash
docker run -d --name paperloop-mongo -p 27017:27017 mongo:7
```

---

## 6. Security notes

- Rotate `JWT_SECRET` and admin password before going live.
- Never commit `.env` files.
- Set `APP_ENV=production` to disable OTP dev codes.
- Restrict MongoDB Atlas network access when possible.
- Backend uploads are public (product images) — do not store private files in `uploads/`.

---

## 7. Architecture summary

```
User → Vercel (React SPA)
         ↓ REACT_APP_BACKEND_URL
       FastAPI (Railway/Render)
         ↓ MONGO_URL
       MongoDB Atlas
         ↑
       backend/uploads/ (persistent volume)
```

Images are **not** on Vercel — they are served by the FastAPI static mount at `/api/uploads/*`.
