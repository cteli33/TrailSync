# TrailPlan

Group trip planning MVP for hiking & skiing trips: itinerary and trip details,
individual + claimable group packing lists, and trip membership/RSVPs.

## Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite (`backend/`)
- **Frontend:** React + Vite + react-router (`frontend/`)

## Running locally

### Backend (http://127.0.0.1:8000)

```bash
cd backend
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt  # macOS/Linux
./.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

A SQLite file (`trailplan.db`) is created and seeded with a demo trip
("Patagonia O Trek") on first run. API docs: http://127.0.0.1:8000/docs

### Frontend (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Sign in with any name/email (no password — this is an MVP), or use the
"Continue as demo user (Cody)" button to see the seeded trip immediately.

## Features

- **Trips** — create a trip with name, location, dates, cover image, and
  description; edit details inline from the Itinerary page ("Edit Itinerary").
- **Itinerary** — add/edit/delete day-by-day entries with distance and notes.
- **Members** — invite by name/email, confirm/decline RSVPs, see confirmed vs.
  pending members.
- **Packing lists** — each member has a private packing list; the group also
  has a shared gear list where unclaimed items can be claimed ("I'll bring
  this") by any member.

## Notes on this MVP

- Auth is a lightweight "identify by email" flow — no passwords, sessions are
  just a locally-stored user record. Good enough for a trusted group planning
  tool, not for production auth.
- Invites don't send real emails; an invited person sees the trip once they
  sign in with the matching email.
