import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api";
import ShareTripModal from "../components/ShareTripModal";
import {
  CalendarIcon,
  PinIcon,
  ChevronDownIcon,
  ShareIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
} from "../components/Icons";
import { formatDateRange, formatDate } from "../utils/date";

export default function ItineraryPage() {
  const { trip, refreshTrip } = useOutletContext();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDayId, setOpenDayId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    loadDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id]);

  async function loadDays() {
    setLoading(true);
    try {
      const data = await api.listItinerary(trip.id);
      setDays(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="topbar">
        <button className="btn btn-outline" onClick={() => setShowShare(true)}>
          <ShareIcon width={15} height={15} /> Share Trip
        </button>
        <button className="btn btn-primary" onClick={() => setEditMode((v) => !v)}>
          <EditIcon width={15} height={15} /> {editMode ? "Done Editing" : "Edit Itinerary"}
        </button>
      </div>

      <div className="banner">
        {trip.cover_image_url && <img className="banner-image" src={trip.cover_image_url} alt="" />}
        <div className="banner-overlay">
          <h1 className="banner-title">{trip.name}</h1>
          <div className="banner-meta">
            <CalendarIcon width={16} height={16} />
            {formatDateRange(trip.start_date, trip.end_date) || "Dates TBD"}
          </div>
          <div className="banner-meta">
            <PinIcon width={16} height={16} />
            {trip.location || "Location TBD"}
          </div>
        </div>
      </div>

      {editMode && <TripDetailsForm trip={trip} onSaved={refreshTrip} />}

      <div className="section-heading">
        <h2>Itinerary</h2>
      </div>

      {loading ? (
        <p style={{ color: "var(--gray-500)" }}>Loading itinerary…</p>
      ) : (
        <div className="itinerary-list">
          {days.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              editMode={editMode}
              open={openDayId === day.id}
              onToggle={() => setOpenDayId(openDayId === day.id ? null : day.id)}
              onChanged={loadDays}
            />
          ))}
        </div>
      )}

      {days.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No itinerary yet</h3>
          <p>Turn on editing to add your first day.</p>
        </div>
      )}

      {editMode && <AddDayForm tripId={trip.id} nextDayNumber={days.length + 1} onAdded={loadDays} />}

      {showShare && (
        <ShareTripModal tripId={trip.id} onClose={() => setShowShare(false)} onInvited={refreshTrip} />
      )}
    </div>
  );
}

function DayCard({ day, editMode, open, onToggle, onChanged }) {
  const [editing, setEditing] = useState(false);

  async function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${day.title}"?`)) return;
    await api.deleteItineraryDay(day.id);
    onChanged();
  }

  if (editing) {
    return (
      <div className="day-card">
        <div style={{ padding: 16 }}>
          <EditDayForm
            day={day}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              onChanged();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="day-card">
      <div className="day-card-row" onClick={onToggle}>
        <div className="day-badge">
          <span className="day-label">DAY</span>
          <span className="day-number">{day.day_number}</span>
        </div>
        <div className="day-card-main">
          <p className="day-card-title">{day.title}</p>
          <p className="day-card-desc">{day.description}</p>
        </div>
        {editMode && (
          <div className="day-card-actions" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => setEditing(true)} title="Edit day">
              <EditIcon width={15} height={15} />
            </button>
            <button className="icon-btn" onClick={handleDelete} title="Delete day">
              <TrashIcon width={15} height={15} />
            </button>
          </div>
        )}
        <ChevronDownIcon className={`day-card-chevron${open ? " open" : ""}`} />
      </div>
      {open && (
        <div className="day-card-body">
          <p>{day.description || "No details added yet."}</p>
          {day.date && <span className="day-card-tag">{formatDate(day.date)}</span>}
          {day.distance_km != null && (
            <span className="day-card-tag" style={{ marginLeft: 8 }}>
              ~{day.distance_km} km
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function EditDayForm({ day, onCancel, onSaved }) {
  const [form, setForm] = useState({
    day_number: day.day_number,
    title: day.title,
    description: day.description || "",
    distance_km: day.distance_km ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateItineraryDay(day.id, {
        day_number: Number(form.day_number),
        title: form.title,
        description: form.description,
        distance_km: form.distance_km === "" ? null : Number(form.distance_km),
      });
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="form-grid">
        <label>
          Day #
          <input
            type="number"
            min="1"
            value={form.day_number}
            onChange={(e) => update("day_number", e.target.value)}
            required
          />
        </label>
        <label>
          Distance (km)
          <input
            type="number"
            step="0.1"
            value={form.distance_km}
            onChange={(e) => update("distance_km", e.target.value)}
          />
        </label>
        <label className="span-2">
          Title
          <input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </label>
        <label className="span-2">
          Description
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          Save
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddDayForm({ tripId, nextDayNumber, onAdded }) {
  const [form, setForm] = useState({
    day_number: nextDayNumber,
    title: "",
    description: "",
    distance_km: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createItineraryDay(tripId, {
        day_number: Number(form.day_number),
        title: form.title,
        description: form.description,
        distance_km: form.distance_km === "" ? null : Number(form.distance_km),
      });
      setForm({ day_number: Number(form.day_number) + 1, title: "", description: "", distance_km: "" });
      onAdded();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-add-row">
      <label style={{ maxWidth: 80 }}>
        Day #
        <input
          type="number"
          min="1"
          value={form.day_number}
          onChange={(e) => update("day_number", e.target.value)}
          required
        />
      </label>
      <label>
        Title
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Hike to Camp Grey"
          required
        />
      </label>
      <label>
        Distance (km)
        <input
          type="number"
          step="0.1"
          value={form.distance_km}
          onChange={(e) => update("distance_km", e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
        <PlusIcon width={14} height={14} /> Add day
      </button>
    </form>
  );
}

function TripDetailsForm({ trip, onSaved }) {
  const [form, setForm] = useState({
    name: trip.name,
    location: trip.location,
    start_date: trip.start_date || "",
    end_date: trip.end_date || "",
    cover_image_url: trip.cover_image_url,
    description: trip.description,
  });
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateTrip(trip.id, {
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
      await onSaved();
      setSaved(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="edit-panel">
      <h3>Trip details</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="span-2">
            Trip name
            <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </label>
          <label className="span-2">
            Location
            <input value={form.location} onChange={(e) => update("location", e.target.value)} />
          </label>
          <label>
            Start date
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
            />
          </label>
          <label>
            End date
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => update("end_date", e.target.value)}
            />
          </label>
          <label className="span-2">
            Cover image URL
            <input
              value={form.cover_image_url}
              onChange={(e) => update("cover_image_url", e.target.value)}
            />
          </label>
          <label className="span-2">
            Description
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            Save trip details
          </button>
          {saved && <span style={{ color: "var(--green-700)", fontSize: 13, alignSelf: "center" }}>Saved</span>}
        </div>
      </form>
    </div>
  );
}
