import enum

from sqlalchemy import (
    Boolean,
    Date,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class MemberStatus(str, enum.Enum):
    confirmed = "confirmed"
    pending = "pending"
    declined = "declined"


class MemberRole(str, enum.Enum):
    owner = "owner"
    member = "member"


class PackingScope(str, enum.Enum):
    individual = "individual"
    group = "group"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    avatar_color: Mapped[str] = mapped_column(String(7), default="#2f6d51")

    memberships: Mapped[list["Membership"]] = relationship(back_populates="user")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(200), default="")
    start_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    cover_image_url: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    trip_type: Mapped[str] = mapped_column(String(50), default="hiking")

    memberships: Mapped[list["Membership"]] = relationship(
        back_populates="trip", cascade="all, delete-orphan"
    )
    itinerary_days: Mapped[list["ItineraryDay"]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", order_by="ItineraryDay.day_number"
    )
    packing_items: Mapped[list["PackingItem"]] = relationship(
        back_populates="trip", cascade="all, delete-orphan"
    )


class Membership(Base):
    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("trip_id", "user_id", name="uq_trip_user"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    role: Mapped[MemberRole] = mapped_column(Enum(MemberRole), default=MemberRole.member)
    status: Mapped[MemberStatus] = mapped_column(Enum(MemberStatus), default=MemberStatus.pending)

    trip: Mapped["Trip"] = relationship(back_populates="memberships")
    user: Mapped["User"] = relationship(back_populates="memberships")


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"))
    day_number: Mapped[int] = mapped_column(Integer)
    date: Mapped[str | None] = mapped_column(Date, nullable=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    distance_km: Mapped[float | None] = mapped_column(nullable=True)

    trip: Mapped["Trip"] = relationship(back_populates="itinerary_days")


class PackingItem(Base):
    __tablename__ = "packing_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"))
    scope: Mapped[PackingScope] = mapped_column(Enum(PackingScope))
    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(100), default="Other")
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    is_packed: Mapped[bool] = mapped_column(Boolean, default=False)

    # individual scope: item belongs to this user's personal list
    owner_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    # group scope: item may be claimed by a member who will bring it
    claimed_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    trip: Mapped["Trip"] = relationship(back_populates="packing_items")
    owner: Mapped["User | None"] = relationship(foreign_keys=[owner_user_id])
    claimed_by: Mapped["User | None"] = relationship(foreign_keys=[claimed_by_user_id])
