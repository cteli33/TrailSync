import random

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/users", tags=["users"])

AVATAR_COLORS = ["#2f6d51", "#8a5a2f", "#3a6b8a", "#6b4f8a", "#8a3a4f", "#4f7a3a"]


@router.post("/identify", response_model=schemas.UserOut)
def identify_user(payload: schemas.UserIdentify, db: Session = Depends(get_db)):
    """Lightweight sign-in: find-or-create a user by email. No password for this MVP."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if user:
        return user
    user = models.User(
        name=payload.name,
        email=payload.email,
        avatar_color=random.choice(AVATAR_COLORS),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
