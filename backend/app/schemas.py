from datetime import date as Date

from pydantic import BaseModel, ConfigDict, EmailStr

from .models import MemberRole, MemberStatus, PackingScope


# ---------- Users ----------
class UserIdentify(BaseModel):
    name: str
    email: EmailStr


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    avatar_color: str


# ---------- Trips ----------
class TripCreate(BaseModel):
    name: str
    location: str = ""
    start_date: Date | None = None
    end_date: Date | None = None
    cover_image_url: str = ""
    description: str = ""
    trip_type: str = "hiking"
    user_id: int


class TripUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    start_date: Date | None = None
    end_date: Date | None = None
    cover_image_url: str | None = None
    description: str | None = None
    trip_type: str | None = None


class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    location: str
    start_date: Date | None
    end_date: Date | None
    cover_image_url: str
    description: str
    trip_type: str
    member_count: int = 0
    confirmed_count: int = 0


# ---------- Memberships ----------
class MemberInvite(BaseModel):
    name: str
    email: EmailStr


class MemberStatusUpdate(BaseModel):
    status: MemberStatus


class MemberOut(BaseModel):
    id: int
    role: MemberRole
    status: MemberStatus
    user: UserOut


# ---------- Itinerary ----------
class ItineraryDayCreate(BaseModel):
    day_number: int
    date: Date | None = None
    title: str
    description: str = ""
    distance_km: float | None = None


class ItineraryDayUpdate(BaseModel):
    day_number: int | None = None
    date: Date | None = None
    title: str | None = None
    description: str | None = None
    distance_km: float | None = None


class ItineraryDayOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    trip_id: int
    day_number: int
    date: Date | None
    title: str
    description: str
    distance_km: float | None


# ---------- Packing ----------
class PackingItemCreate(BaseModel):
    scope: PackingScope
    name: str
    category: str = "Other"
    quantity: int = 1
    owner_user_id: int | None = None  # required when scope == individual


class PackingItemUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    quantity: int | None = None
    is_packed: bool | None = None


class PackingClaimAction(BaseModel):
    user_id: int
    claim: bool  # True to claim, False to release


class PackingItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    trip_id: int
    scope: PackingScope
    name: str
    category: str
    quantity: int
    is_packed: bool
    owner: UserOut | None
    claimed_by: UserOut | None
