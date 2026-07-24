const BASE_URL = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* no json body */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  identify: (name, email) =>
    request("/api/users/identify", { method: "POST", body: JSON.stringify({ name, email }) }),

  listTrips: (userId) => request(`/api/trips?user_id=${userId}`),
  createTrip: (payload) => request("/api/trips", { method: "POST", body: JSON.stringify(payload) }),
  getTrip: (tripId) => request(`/api/trips/${tripId}`),
  updateTrip: (tripId, payload) =>
    request(`/api/trips/${tripId}`, { method: "PUT", body: JSON.stringify(payload) }),

  listItinerary: (tripId) => request(`/api/trips/${tripId}/itinerary`),
  createItineraryDay: (tripId, payload) =>
    request(`/api/trips/${tripId}/itinerary`, { method: "POST", body: JSON.stringify(payload) }),
  updateItineraryDay: (dayId, payload) =>
    request(`/api/itinerary/${dayId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteItineraryDay: (dayId) => request(`/api/itinerary/${dayId}`, { method: "DELETE" }),

  listMembers: (tripId) => request(`/api/trips/${tripId}/members`),
  inviteMember: (tripId, payload) =>
    request(`/api/trips/${tripId}/members`, { method: "POST", body: JSON.stringify(payload) }),
  updateMemberStatus: (membershipId, status) =>
    request(`/api/members/${membershipId}`, { method: "PUT", body: JSON.stringify({ status }) }),
  removeMember: (membershipId) => request(`/api/members/${membershipId}`, { method: "DELETE" }),

  listIndividualPacking: (tripId, userId) =>
    request(`/api/trips/${tripId}/packing/individual?user_id=${userId}`),
  listGroupPacking: (tripId) => request(`/api/trips/${tripId}/packing/group`),
  createPackingItem: (tripId, payload) =>
    request(`/api/trips/${tripId}/packing`, { method: "POST", body: JSON.stringify(payload) }),
  updatePackingItem: (itemId, payload) =>
    request(`/api/packing/${itemId}`, { method: "PUT", body: JSON.stringify(payload) }),
  claimPackingItem: (itemId, userId, claim) =>
    request(`/api/packing/${itemId}/claim`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, claim }),
    }),
  deletePackingItem: (itemId) => request(`/api/packing/${itemId}`, { method: "DELETE" }),
};
