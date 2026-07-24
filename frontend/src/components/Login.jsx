import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MountainIcon } from "./Icons";

export default function Login() {
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(name.trim(), email.trim());
    } catch (err) {
      setError(err.message || "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  }

  async function continueAsDemo() {
    setSubmitting(true);
    setError("");
    try {
      await signIn("Cody", "cody@example.com");
    } catch (err) {
      setError(err.message || "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand brand-center">
          <MountainIcon className="brand-icon" />
          <span>TrailPlan</span>
        </div>
        <p className="auth-subtitle">Plan group hiking &amp; skiing trips together.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Reyes"
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            Continue
          </button>
        </form>
        <button className="btn btn-outline auth-demo-btn" onClick={continueAsDemo} disabled={submitting}>
          Continue as demo user (Cody)
        </button>
      </div>
    </div>
  );
}
