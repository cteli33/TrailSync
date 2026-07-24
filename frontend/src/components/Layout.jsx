import { useCallback, useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { api } from "../api";

export default function Layout() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshTrip = useCallback(async () => {
    try {
      const data = await api.getTrip(tripId);
      setTrip(data);
    } catch (err) {
      setError(err.message || "Could not load trip");
    }
  }, [tripId]);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getTrip(tripId)
      .then(setTrip)
      .catch((err) => setError(err.message || "Could not load trip"))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return <div className="centered-loader">Loading trip…</div>;
  }

  if (error || !trip) {
    return <div className="centered-loader">{error || "Trip not found"}</div>;
  }

  return (
    <div className="app-shell">
      <Sidebar trip={trip} />
      <main className="main-content">
        <Outlet context={{ trip, refreshTrip }} />
      </main>
    </div>
  );
}
