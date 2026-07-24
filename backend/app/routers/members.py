from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["members"])


@router.get("/api/trips/{trip_id}/members", response_model=list[schemas.MemberOut])
def list_members(trip_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Membership)
        .filter(models.Membership.trip_id == trip_id)
        .all()
    )


@router.post("/api/trips/{trip_id}/members", response_model=schemas.MemberOut)
def invite_member(trip_id: int, payload: schemas.MemberInvite, db: Session = Depends(get_db)):
    trip = db.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        user = models.User(name=payload.name, email=payload.email)
        db.add(user)
        db.flush()

    existing = (
        db.query(models.Membership)
        .filter(models.Membership.trip_id == trip_id, models.Membership.user_id == user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this trip")

    membership = models.Membership(
        trip_id=trip_id,
        user_id=user.id,
        role=models.MemberRole.member,
        status=models.MemberStatus.pending,
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


@router.put("/api/members/{membership_id}", response_model=schemas.MemberOut)
def update_member_status(
    membership_id: int, payload: schemas.MemberStatusUpdate, db: Session = Depends(get_db)
):
    membership = db.get(models.Membership, membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    membership.status = payload.status
    db.commit()
    db.refresh(membership)
    return membership


@router.delete("/api/members/{membership_id}", status_code=204)
def remove_member(membership_id: int, db: Session = Depends(get_db)):
    membership = db.get(models.Membership, membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    db.delete(membership)
    db.commit()
