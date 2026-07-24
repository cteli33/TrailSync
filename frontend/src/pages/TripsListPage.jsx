import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { MountainIcon, PinIcon, PlusIcon } from "../components/Icons";
import { formatDateRange } from "../utils/date";

const TRIP_TYPES = [
  { value: "hiking", label: "Hiking" },
  { value: "skiing", label: "Skiing" },
  { value: "backpacking", label: "Backpacking" },
  { value: "other", label: "Other" },
];

export default function TripsListPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.listTrips(user.id);
      setTrips(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="centered-loader">Loading your trips…</div>;

  return (
    <div className="app-shell">
      <main className="main-content" style={{ maxWidth: 960, margin: "0 auto" }}>
        <div className="topbar" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div className="brand">
            <MountainIcon className="brand-icon" />
            <span>TrailPlan</span>
          </div>
          <button className="btn btn-ghost" onClick={signOut}>
            Sign out ({user.name})
          </button>
        </div>

        <div className="section-heading">
          <h2>Your trips</h2>
        </div>

        <div className="trips-grid">
          <div className="new-trip-tile" onClick={() => setShowForm(true)}>
            <PlusIcon />
            New trip
          </div>
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="trip-tile"
              onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
            >
              {trip.cover_image_url ? (
                <img className="trip-tile-image" src={trip.cover_image_url} alt="" />
              ) : (
                <div className="trip-tile-image" />
              )}
              <div className="trip-tile-body">
                <div className="trip-tile-name">{trip.name}</div>
                <div className="trip-tile-loc">
                  <PinIcon width={13} height={13} /> {trip.location}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--gray-500)" }}>
                  {formatDateRange(trip.start_date, trip.end_date)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {trips.length === 0 && (
          <p style={{ color: "var(--gray-500)", marginTop: 8 }}>
            No trips yet — create one to get started, or ask a friend to invite you.
          </p>
        )}
      </main>

      {showForm && (
        <NewTripModal
          onClose={() => setShowForm(false)}
          onCreated={(trip) => {
            setShowForm(false);
            navigate(`/trips/${trip.id}/itinerary`);
          }}
        />
      )}
    </div>
  );
}

function NewTripModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    location: "",
    start_date: "",
    end_date: "",
    cover_image_url: "",
    description: "",
    trip_type: "hiking",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        user_id: user.id,
      };
      const trip = await api.createTrip(payload);
      onCreated(trip);
    } catch (err) {
      setError(err.message || "Could not create trip");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>New trip</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            Trip name
            <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </label>
          <label>
            Location
            <input value={form.location} onChange={(e) => update("location", e.target.value)} />
          </label>
          <div className="form-grid">
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
          </div>
          <label>
            Trip type
            <select value={form.trip_type} onChange={(e) => update("trip_type", e.target.value)}>
              {TRIP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cover image URL
            <input
              value={form.cover_image_url}
              onChange={(e) => update("cover_image_url", e.target.value)}
              placeholder="https://…"
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              Create trip
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
