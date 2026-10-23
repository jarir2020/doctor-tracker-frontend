/** Doctor Tracker: Provides the controlled form used to create doctor records. */
"use client";

import { useState, type FormEvent } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import type { Doctor } from "@/lib/types";
import { Icon } from "./Icon";

export function DoctorForm({ onSaved, onCancel }: { onSaved: (doctor: Doctor) => void; onCancel: () => void }) {
  const [values, setValues] = useState({ name: "", specialization: "", hospital: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /** Update one controlled field without replacing the rest of the form state. */
  function change(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  /** Create a doctor through the API and report the saved record to the parent. */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Reset the previous error and mark the request as in flight.
    setError("");
    setBusy(true);
    try {
      const result = await apiRequest<{ doctor: Doctor }>("/doctors", { method: "POST", body: JSON.stringify(values) });
      onSaved(result.doctor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Doctor could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <div className="form-field full"><label htmlFor="doctor-name">Full name</label><input id="doctor-name" autoFocus required maxLength={100} value={values.name} onChange={(event) => change("name", event.target.value)} placeholder="e.g. Dr. Maya Rahman" /></div>
        <div className="form-field"><label htmlFor="doctor-specialty">Specialization</label><input id="doctor-specialty" required maxLength={100} value={values.specialization} onChange={(event) => change("specialization", event.target.value)} placeholder="e.g. Cardiology" /></div>
        <div className="form-field"><label htmlFor="doctor-hospital">Hospital or clinic</label><input id="doctor-hospital" required maxLength={150} value={values.hospital} onChange={(event) => change("hospital", event.target.value)} placeholder="e.g. Central Medical" /></div>
        <div className="form-field"><label htmlFor="doctor-phone">Phone number</label><input id="doctor-phone" type="tel" required maxLength={40} value={values.phone} onChange={(event) => change("phone", event.target.value)} placeholder="+880 1XXX-XXXXXX" /></div>
        <div className="form-field"><label htmlFor="doctor-email">Email address</label><input id="doctor-email" type="email" required maxLength={255} value={values.email} onChange={(event) => change("email", event.target.value)} placeholder="doctor@clinic.com" /></div>
      </div>
      {error && <div className="inline-alert" role="alert">{error}</div>}
      <div className="form-actions">
        <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : <><Icon name="plus" size={15} /> Add doctor</>}</button>
      </div>
    </form>
  );
}
