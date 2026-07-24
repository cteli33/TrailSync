from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["itinerary"])


@router.get("/api/trips/{trip_id}/itinerary", response_model=list[schemas.ItineraryDayOut])
def list_itinerary(trip_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.ItineraryDay)
        .filter(models.ItineraryDay.trip_id == trip_id)
        .order_by(models.ItineraryDay.day_number)
        .all()
    )


@router.post("/api/trips/{trip_id}/itinerary", response_model=schemas.ItineraryDayOut)
def create_itinerary_day(
    trip_id: int, payload: schemas.ItineraryDayCreate, db: Session = Depends(get_db)
):
    trip = db.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    day = models.ItineraryDay(trip_id=trip_id, **payload.model_dump())
    db.add(day)
    db.commit()
    db.refresh(day)
    return day


@router.put("/api/itinerary/{day_id}", response_model=schemas.ItineraryDayOut)
def update_itinerary_day(
    day_id: int, payload: schemas.ItineraryDayUpdate, db: Session = Depends(get_db)
):
    day = db.get(models.ItineraryDay, day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Itinerary day not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(day, field, value)
    db.commit()
    db.refresh(day)
    return day


@router.delete("/api/itinerary/{day_id}", status_code=204)
def delete_itinerary_day(day_id: int, db: Session = Depends(get_db)):
    day = db.get(models.ItineraryDay, day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Itinerary day not found")
    db.delete(day)
    db.commit()
