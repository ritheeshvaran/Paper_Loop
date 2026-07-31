# Paper & Loop

Premium youth merchandise — posters and keychains. Editorial e-commerce built with React + FastAPI + MongoDB.

## Stack

- **Frontend:** React 19, React Router, Tailwind, shadcn/ui, Framer Motion
- **Backend:** FastAPI, Motor (MongoDB)
- **Database:** MongoDB (Atlas in production)
- **Images:** Local uploads served at `/api/uploads/*`

## Quick start

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full local and production setup.

```powershell
# Backend
cd backend && copy .env.example .env
pip install fastapi uvicorn motor pymongo bcrypt PyJWT python-dotenv python-multipart pydantic email-validator resend
python -m uvicorn server:app --reload --port 8000

# Frontend
cd frontend && copy .env.example .env
npm install --legacy-peer-deps && npm install ajv@8.17.1 --legacy-peer-deps
npm start
```

Products and brand assets are seeded automatically from `Images/` on first backend startup.

## Production

- Frontend → **Vercel** (`frontend/`, set `REACT_APP_BACKEND_URL`)
- Backend → **Railway** or **Render** (persistent volume for `backend/uploads/`)
- Database → **MongoDB Atlas**

Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
