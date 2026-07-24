import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Layout from "./components/Layout";
import TripsListPage from "./pages/TripsListPage";
import ItineraryPage from "./pages/ItineraryPage";
import MembersPage from "./pages/MembersPage";
import PackingPage from "./pages/PackingPage";
import { api } from "./api";

function RootRedirect() {
  const { user } = useAuth();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    api.listTrips(user.id).then((trips) => {
      setTarget(trips.length > 0 ? `/trips/${trips[0].id}/itinerary` : "/trips");
    });
  }, [user.id]);

  if (!target) return <div className="centered-loader">Loading…</div>;
  return <Navigate to={target} replace />;
}

function AuthedApp() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/trips" element={<TripsListPage />} />
      <Route path="/trips/:tripId" element={<Layout />}>
        <Route path="itinerary" element={<ItineraryPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="packing" element={<PackingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Shell() {
  const { user, loading } = useAuth();
  if (loading) return <div className="centered-loader">Loading…</div>;
  if (!user) return <Login />;
  return <AuthedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
