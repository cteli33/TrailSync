import { useState } from "react";
import { api } from "../api";

export default function ShareTripModal({ tripId, onClose, onInvited }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.inviteMember(tripId, { name: name.trim(), email: email.trim() });
      setSuccess(`Invited ${name.trim()} — they'll appear as pending until they confirm.`);
      setName("");
      setEmail("");
      onInvited?.();
    } catch (err) {
      setError(err.message || "Could not invite member");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Share trip</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          {success && (
            <div style={{ fontSize: 13, color: "var(--green-700)", fontWeight: 600 }}>{success}</div>
          )}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              Send invite
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
