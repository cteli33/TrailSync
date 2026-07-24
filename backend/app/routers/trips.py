from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/trips", tags=["trips"])


def _to_trip_out(trip: models.Trip) -> schemas.TripOut:
    member_count = len(trip.memberships)
    confirmed_count = sum(
        1 for m in trip.memberships if m.status == models.MemberStatus.confirmed
    )
    return schemas.TripOut(
        id=trip.id,
        name=trip.name,
        location=trip.location,
        start_date=trip.start_date,
        end_date=trip.end_date,
        cover_image_url=trip.cover_image_url,
        description=trip.description,
        trip_type=trip.trip_type,
        member_count=member_count,
        confirmed_count=confirmed_count,
    )


@router.get("", response_model=list[schemas.TripOut])
def list_trips(user_id: int, db: Session = Depends(get_db)):
    trips = (
        db.query(models.Trip)
        .join(models.Membership)
        .filter(models.Membership.user_id == user_id)
        .all()
    )
    return [_to_trip_out(t) for t in trips]


@router.post("", response_model=schemas.TripOut)
def create_trip(payload: schemas.TripCreate, db: Session = Depends(get_db)):
    user = db.get(models.User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    trip = models.Trip(
        name=payload.name,
        location=payload.location,
        start_date=payload.start_date,
        end_date=payload.end_date,
        cover_image_url=payload.cover_image_url,
        description=payload.description,
        trip_type=payload.trip_type,
    )
    db.add(trip)
    db.flush()

    membership = models.Membership(
        trip_id=trip.id,
        user_id=user.id,
        role=models.MemberRole.owner,
        status=models.MemberStatus.confirmed,
    )
    db.add(membership)
    db.commit()
    db.refresh(trip)
    return _to_trip_out(trip)


@router.get("/{trip_id}", response_model=schemas.TripOut)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return _to_trip_out(trip)


@router.put("/{trip_id}", response_model=schemas.TripOut)
def update_trip(trip_id: int, payload: schemas.TripUpdate, db: Session = Depends(get_db)):
    trip = db.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return _to_trip_out(trip)
