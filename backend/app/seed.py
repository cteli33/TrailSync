from datetime import date

from sqlalchemy.orm import Session

from . import models


DEMO_DAYS = [
    (1, "Fly to Puerto Natales", "Arrive in Puerto Natales and check in to hotel.", None),
    (2, "Bus to Torres del Paine", "Morning bus to the park entrance. Stock up on supplies.", None),
    (3, "Start O Trek", "Begin the trek to Camp Serón.", 12),
    (4, "Serón to Dickson", "Hike to Camp Dickson.", 18),
    (5, "Dickson to Los Perros", "Hike to Camp Los Perros.", 11),
    (6, "Los Perros to Grey", "Hike to Grey campground.", 15),
    (7, "Grey to Paine Grande", "Hike past the glacier to Paine Grande.", 11),
    (8, "Paine Grande to Torres", "Final push to the Torres base camp.", 19),
    (9, "Return to Puerto Natales", "Bus back and celebrate the finish.", None),
]

DEMO_GROUP_ITEMS = [
    ("4-person tent", "Shelter", 2),
    ("Camp stove", "Cooking", 1),
    ("Fuel canisters", "Cooking", 4),
    ("Water filter", "Water", 1),
    ("First aid kit", "Safety", 1),
    ("Satellite communicator", "Safety", 1),
    ("Cooking pot set", "Cooking", 1),
    ("Rope (30m)", "Safety", 1),
]

DEMO_INDIVIDUAL_ITEMS = [
    ("Hiking boots", "Clothing", 1),
    ("Sleeping bag", "Sleep", 1),
    ("Sleeping pad", "Sleep", 1),
    ("Rain jacket", "Clothing", 1),
    ("Headlamp", "Gear", 1),
    ("Trekking poles", "Gear", 1),
    ("Water bottles", "Water", 2),
    ("Base layers", "Clothing", 2),
]


def seed_if_empty(db: Session) -> None:
    if db.query(models.Trip).first():
        return

    owner = models.User(name="Cody", email="cody@example.com", avatar_color="#2f6d51")
    mia = models.User(name="Mia Torres", email="mia@example.com", avatar_color="#3a6b8a")
    sam = models.User(name="Sam Wu", email="sam@example.com", avatar_color="#8a5a2f")
    priya = models.User(name="Priya Nair", email="priya@example.com", avatar_color="#6b4f8a")
    db.add_all([owner, mia, sam, priya])
    db.flush()

    trip = models.Trip(
        name="Patagonia O Trek",
        location="Torres del Paine, Chile",
        start_date=date(2025, 3, 12),
        end_date=date(2025, 3, 20),
        cover_image_url="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop",
        description="A 9-day trek around the O Circuit in Torres del Paine National Park.",
        trip_type="hiking",
    )
    db.add(trip)
    db.flush()

    db.add_all(
        [
            models.Membership(
                trip_id=trip.id, user_id=owner.id, role=models.MemberRole.owner,
                status=models.MemberStatus.confirmed,
            ),
            models.Membership(
                trip_id=trip.id, user_id=mia.id, role=models.MemberRole.member,
                status=models.MemberStatus.confirmed,
            ),
            models.Membership(
                trip_id=trip.id, user_id=sam.id, role=models.MemberRole.member,
                status=models.MemberStatus.confirmed,
            ),
            models.Membership(
                trip_id=trip.id, user_id=priya.id, role=models.MemberRole.member,
                status=models.MemberStatus.pending,
            ),
        ]
    )

    for day_number, title, description, distance in DEMO_DAYS:
        db.add(
            models.ItineraryDay(
                trip_id=trip.id,
                day_number=day_number,
                title=title,
                description=description,
                distance_km=distance,
            )
        )

    claim_map = {"4-person tent": mia.id, "Camp stove": sam.id}
    for name, category, qty in DEMO_GROUP_ITEMS:
        db.add(
            models.PackingItem(
                trip_id=trip.id,
                scope=models.PackingScope.group,
                name=name,
                category=category,
                quantity=qty,
                claimed_by_user_id=claim_map.get(name),
            )
        )

    for name, category, qty in DEMO_INDIVIDUAL_ITEMS:
        db.add(
            models.PackingItem(
                trip_id=trip.id,
                scope=models.PackingScope.individual,
                name=name,
                category=category,
                quantity=qty,
                owner_user_id=owner.id,
            )
        )

    db.commit()
