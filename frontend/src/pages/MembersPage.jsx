import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import Avatar from "../components/Avatar";
import ShareTripModal from "../components/ShareTripModal";
import { ShareIcon, CheckIcon, TrashIcon } from "../components/Icons";

export default function MembersPage() {
  const { trip } = useOutletContext();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.listMembers(trip.id);
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }

  const myMembership = members.find((m) => m.user.id === user.id);
  const confirmedCount = members.filter((m) => m.status === "confirmed").length;

  async function respond(membershipId, status) {
    await api.updateMemberStatus(membershipId, status);
    load();
  }

  async function remove(membershipId) {
    if (!window.confirm("Remove this member from the trip?")) return;
    await api.removeMember(membershipId);
    load();
  }

  return (
    <div>
      <div className="topbar">
        <button className="btn btn-outline" onClick={() => setShowShare(true)}>
          <ShareIcon width={15} height={15} /> Share Trip
        </button>
      </div>

      <div className="section-heading">
        <h2>Members</h2>
        <span style={{ color: "var(--gray-500)", fontSize: 13.5 }}>
          {confirmedCount} confirmed · {members.length} total
        </span>
      </div>

      {myMembership && myMembership.status === "pending" && (
        <div className="invite-banner">
          <div>
            <strong>You're invited to {trip.name}!</strong>
            <p>Let the group know if you're in.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => respond(myMembership.id, "confirmed")}
            >
              <CheckIcon width={14} height={14} /> Confirm
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => respond(myMembership.id, "declined")}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--gray-500)" }}>Loading members…</p>
      ) : (
        <div className="member-list">
          {members.map((m) => (
            <div className="member-row" key={m.id}>
              <Avatar name={m.user.name} color={m.user.avatar_color} size="avatar-lg" />
              <div className="member-info">
                <div className="member-name">
                  {m.user.name}
                  {m.role === "owner" && <span className="role-tag">Owner</span>}
                </div>
                <div className="member-email">{m.user.email}</div>
              </div>
              <span className={`status-badge status-${m.status}`}>{m.status}</span>
              <div className="member-actions">
                {m.status === "pending" && m.user.id !== user.id && (
                  <button
                    className="icon-btn"
                    title="Mark confirmed"
                    onClick={() => respond(m.id, "confirmed")}
                  >
                    <CheckIcon width={15} height={15} />
                  </button>
                )}
                {m.role !== "owner" && (
                  <button className="icon-btn" title="Remove" onClick={() => remove(m.id)}>
                    <TrashIcon width={15} height={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showShare && (
        <ShareTripModal tripId={trip.id} onClose={() => setShowShare(false)} onInvited={load} />
      )}
    </div>
  );
}
