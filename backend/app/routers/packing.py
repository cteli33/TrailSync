from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["packing"])


@router.get("/api/trips/{trip_id}/packing/individual", response_model=list[schemas.PackingItemOut])
def list_individual_items(trip_id: int, user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.PackingItem)
        .filter(
            models.PackingItem.trip_id == trip_id,
            models.PackingItem.scope == models.PackingScope.individual,
            models.PackingItem.owner_user_id == user_id,
        )
        .all()
    )


@router.get("/api/trips/{trip_id}/packing/group", response_model=list[schemas.PackingItemOut])
def list_group_items(trip_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.PackingItem)
        .filter(
            models.PackingItem.trip_id == trip_id,
            models.PackingItem.scope == models.PackingScope.group,
        )
        .all()
    )


@router.post("/api/trips/{trip_id}/packing", response_model=schemas.PackingItemOut)
def create_packing_item(
    trip_id: int, payload: schemas.PackingItemCreate, db: Session = Depends(get_db)
):
    trip = db.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if payload.scope == models.PackingScope.individual and payload.owner_user_id is None:
        raise HTTPException(
            status_code=400, detail="owner_user_id is required for individual items"
        )

    item = models.PackingItem(
        trip_id=trip_id,
        scope=payload.scope,
        name=payload.name,
        category=payload.category,
        quantity=payload.quantity,
        owner_user_id=payload.owner_user_id if payload.scope == models.PackingScope.individual else None,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/api/packing/{item_id}", response_model=schemas.PackingItemOut)
def update_packing_item(
    item_id: int, payload: schemas.PackingItemUpdate, db: Session = Depends(get_db)
):
    item = db.get(models.PackingItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Packing item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.post("/api/packing/{item_id}/claim", response_model=schemas.PackingItemOut)
def claim_packing_item(
    item_id: int, payload: schemas.PackingClaimAction, db: Session = Depends(get_db)
):
    item = db.get(models.PackingItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Packing item not found")
    if item.scope != models.PackingScope.group:
        raise HTTPException(status_code=400, detail="Only group items can be claimed")

    if payload.claim:
        if item.claimed_by_user_id is not None and item.claimed_by_user_id != payload.user_id:
            raise HTTPException(status_code=409, detail="Item already claimed by someone else")
        item.claimed_by_user_id = payload.user_id
    else:
        if item.claimed_by_user_id != payload.user_id:
            raise HTTPException(status_code=403, detail="You have not claimed this item")
        item.claimed_by_user_id = None
        item.is_packed = False

    db.commit()
    db.refresh(item)
    return item


@router.delete("/api/packing/{item_id}", status_code=204)
def delete_packing_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(models.PackingItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Packing item not found")
    db.delete(item)
    db.commit()
