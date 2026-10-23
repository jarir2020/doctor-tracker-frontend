"use client";

import { useState, type FormEvent } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import type { Patient } from "@/lib/types";
import { Icon } from "./Icon";

export function PatientForm({
  doctorId,
  patient,
  onSaved,
  onCancel,
}: {
  doctorId?: string;
  patient?: Patient;
  onSaved: (patient: Patient) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState({
    name: patient?.name || "",
    age: patient?.age == null ? "" : String(patient.age),
    condition: patient?.condition || "",
    phone: patient?.phone || "",
    notes: patient?.notes || "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isEditing = Boolean(patient);

  function change(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const payload = {
      name: values.name.trim(),
      age: values.age.trim() ? Number(values.age) : null,
      condition: values.condition.trim(),
      phone: values.phone.trim(),
      notes: values.notes.trim(),
    };

    try {
      if (patient) {
        const result = await apiRequest<{ patient: Patient }>(`/patients/${patient.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        onSaved(result.patient);
      } else if (doctorId) {
        const result = await apiRequest<{ patient: Patient }>(`/doctors/${doctorId}/patients`, { method: "POST", body: JSON.stringify(payload) });
        onSaved(result.patient);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Patient could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <div className="form-field full"><label htmlFor="patient-name">Full name</label><input id="patient-name" autoFocus required maxLength={100} value={values.name} onChange={(event) => change("name", event.target.value)} placeholder="Patient name" /></div>
        <div className="form-field"><label htmlFor="patient-condition">Condition</label><input id="patient-condition" required maxLength={120} value={values.condition} onChange={(event) => change("condition", event.target.value)} placeholder="e.g. Hypertension" /></div>
        <div className="form-field"><label htmlFor="patient-age">Age <span className="form-help">(optional)</span></label><input id="patient-age" type="number" min="0" max="130" value={values.age} onChange={(event) => change("age", event.target.value)} placeholder="Age" /></div>
        <div className="form-field full"><label htmlFor="patient-phone">Phone number <span className="form-help">(optional)</span></label><input id="patient-phone" type="tel" maxLength={40} value={values.phone} onChange={(event) => change("phone", event.target.value)} placeholder="Patient contact number" /></div>
        <div className="form-field full"><label htmlFor="patient-notes">Care notes <span className="form-help">(optional)</span></label><textarea id="patient-notes" maxLength={1000} value={values.notes} onChange={(event) => change("notes", event.target.value)} placeholder="Short administrative note" /></div>
      </div>
      {error && <div className="inline-alert" role="alert">{error}</div>}
      <div className="form-actions">
        <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : <><Icon name={isEditing ? "check" : "plus"} size={15} /> {isEditing ? "Save changes" : "Add patient"}</>}</button>
      </div>
    </form>
  );
}
