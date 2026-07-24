from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import SessionLocal, engine
from .routers import itinerary, members, packing, trips, users
from .seed import seed_if_empty

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrailPlan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(trips.router)
app.include_router(itinerary.router)
app.include_router(members.router)
app.include_router(packing.router)


@app.on_event("startup")
def startup() -> None:
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
