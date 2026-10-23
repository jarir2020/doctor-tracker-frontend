"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { Icon } from "@/components/Icon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-art" aria-label="DoctorTrack introduction">
        <div className="login-brand">
          <span className="brand-mark">D</span>
          <span><strong>doctor<span>track</span></strong><small>CARE OPERATIONS</small></span>
        </div>
        <div className="login-art-copy">
          <div className="login-art-kicker">A MORE CONNECTED PRACTICE</div>
          <h1>Good care starts with <span>clarity.</span></h1>
          <p>Bring your doctors, patient records, and practice activity into one thoughtfully organized workspace.</p>
        </div>
        <div className="login-art-foot">
          <span>Focused on the people behind every record.</span>
          <span className="login-badge"><Icon name="check" size={13} /> Private admin portal</span>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-form-card">
          <div className="eyebrow">WELCOME BACK</div>
          <h2>Sign in to your workspace</h2>
          <p>Enter the administrator credentials configured for this DoctorTrack environment.</p>
          <form className="login-form" onSubmit={submit}>
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" autoComplete="username" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@clinic.com" />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
            </div>
            {error && <div className="inline-alert" role="alert">{error}</div>}
            <button className="button button-primary button-full" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in securely"}
              {!busy && <Icon name="arrow-right" size={16} />}
            </button>
          </form>
          <div className="login-secure-note"><Icon name="check" size={14} /> Access is limited to authorized administrators.</div>
        </div>
      </section>
    </main>
  );
}
