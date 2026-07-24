import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import { MountainIcon, HomeIcon, UsersIcon, BagIcon } from "./Icons";
import { formatDateRange, daysUntil } from "../utils/date";

const PLANNING_WINDOW_DAYS = 60;

export default function Sidebar({ trip }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const daysToGo = trip ? daysUntil(trip.start_date) : null;
  const progress =
    daysToGo === null
      ? 0
      : Math.max(0, Math.min(100, 100 - (daysToGo / PLANNING_WINDOW_DAYS) * 100));

  return (
    <aside className="sidebar">
      <div className="brand">
        <MountainIcon className="brand-icon" width={22} height={22} />
        <span>TrailPlan</span>
      </div>

      {trip && (
        <nav className="nav">
          <NavLink
            to={`/trips/${trip.id}/itinerary`}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <HomeIcon /> Itinerary
          </NavLink>
          <NavLink
            to={`/trips/${trip.id}/members`}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <UsersIcon /> Members
          </NavLink>
          <NavLink
            to={`/trips/${trip.id}/packing`}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <BagIcon /> Packing Lists
          </NavLink>
        </nav>
      )}

      <div className="sidebar-spacer" />

      {trip && (
        <>
          <button
            className="trip-card"
            onClick={() => navigate("/trips")}
            style={{ border: "1px solid var(--gray-200)", textAlign: "left" }}
          >
            {trip.cover_image_url ? (
              <img className="trip-card-image" src={trip.cover_image_url} alt="" />
            ) : (
              <div className="trip-card-image" />
            )}
            <div className="trip-card-body">
              <div className="trip-card-name">{trip.name}</div>
              <div className="trip-card-dates">
                {formatDateRange(trip.start_date, trip.end_date)}
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="trip-card-countdown">
                {daysToGo === null
                  ? "No date set"
                  : daysToGo > 0
                  ? `${daysToGo} days to go`
                  : daysToGo === 0
                  ? "Today!"
                  : "In progress / done"}
              </div>
            </div>
          </button>
          <a className="trips-switch-link" onClick={() => navigate("/trips")}>
            Switch trip
          </a>
        </>
      )}

      {user && (
        <div className="user-footer">
          {menuOpen && (
            <div className="user-menu">
              <button onClick={() => navigate("/trips")}>My trips</button>
              <button onClick={signOut}>Sign out</button>
            </div>
          )}
          <button className="user-footer-btn" onClick={() => setMenuOpen((v) => !v)}>
            <Avatar name={user.name} color={user.avatar_color} />
            <span style={{ flex: 1, textAlign: "left" }}>{user.name}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
