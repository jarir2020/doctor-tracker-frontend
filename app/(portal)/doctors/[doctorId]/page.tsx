/** Doctor Tracker: Loads one doctor and manages that doctor’s searchable, filterable patient list. */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { Modal } from "@/components/Modal";
import { PageHeading } from "@/components/PageHeading";
import { Pagination } from "@/components/Pagination";
import { PatientForm } from "@/components/PatientForm";
import { PatientTable } from "@/components/PatientTable";
import { apiRequest, ApiError, queryString } from "@/lib/api";
import { initials } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import type { Doctor, ListData, Patient } from "@/lib/types";

const PAGE_SIZE = 10;

/** Loads one doctor profile and manages its linked patient records. */
export default function DoctorDetailPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<ListData<Patient> | null>(null);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loadedQuery, setLoadedQuery] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const query = queryString({ q: debouncedSearch, from, to, page, limit: PAGE_SIZE });
  // Include refresh in the request identity so saves and deletes trigger a reload.
  const queryKey = `${doctorId}?${query}&refresh=${refresh}`;
  const loading = loadedQuery !== queryKey;

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<{ doctor: Doctor }>(`/doctors/${doctorId}`),
      apiRequest<ListData<Patient>>(`/doctors/${doctorId}/patients?${query}`),
    ])
      .then(([doctorResult, patientResult]) => {
        if (!active) return;
        setDoctor(doctorResult.doctor);
        setPatients(patientResult);
        setError("");
      })
      .catch((err) => { if (active) setError(err instanceof ApiError ? err.message : "Doctor details could not be loaded."); })
      .finally(() => { if (active) setLoadedQuery(queryKey); });
    // Prevent an older query from replacing results for the latest filters.
    return () => { active = false; };
  }, [doctorId, query, queryKey]);

  /** Delete the selected linked patient and refresh the list on success. */
  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await apiRequest(`/doctors/${doctorId}/patients/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      setRefresh((value) => value + 1);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Patient could not be deleted.");
    } finally {
      setDeleteBusy(false);
    }
  }

  const hasFilters = Boolean(search || from || to);
  return (
    <>
      <Link className="back-link" href="/doctors"><Icon name="chevron-left" size={15} /> Back to doctors</Link>
      <PageHeading
        eyebrow="CARE TEAM"
        title="Doctor profile"
        description="Review this provider's details and the patients connected to their care."
        action={<button className="button button-primary" type="button" disabled={!doctor} onClick={() => setAdding(true)}><Icon name="plus" size={16} /> Add patient</button>}
      />

      {error && !loading && <div className="inline-alert" role="alert">{error}</div>}
      {doctor && <section className="detail-hero">
        <span className="detail-avatar">{initials(doctor.name)}</span>
        <div><h2>{doctor.name}</h2><p>{doctor.specialization}</p>
          <div className="detail-info-row">
            <span><Icon name="hospital" size={14} />{doctor.hospital}</span>
            <span>{doctor.email}</span>
            <span>{doctor.phone}</span>
          </div>
        </div>
        <span className="hero-spacer" />
        <span className="record-meta"><Icon name="patient" size={15} /><strong>{patients?.pagination.total ?? "—"}</strong> linked patients</span>
      </section>}

      <div className="section-title-row"><h2>Patients under this doctor</h2><span>Patient records stay linked to their care provider.</span></div>
      <section className="toolbar" aria-label="Doctor patient filters">
        <label className="search-box"><Icon name="search" size={17} /><input aria-label="Search this doctor's patients" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search patient or condition…" /></label>
        <label className="filter-box"><Icon name="calendar" size={15} /><span className="filter-caption">From</span><input aria-label="Filter patients from date" type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} /></label>
        <label className="filter-box"><Icon name="calendar" size={15} /><span className="filter-caption">To</span><input aria-label="Filter patients to date" type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} /></label>
        {hasFilters && <button className="text-button filter-reset" type="button" onClick={() => { setSearch(""); setFrom(""); setTo(""); setPage(1); }}>Clear filters</button>}
        <span className="results-label">{patients ? `${patients.pagination.total} patients` : "Loading patients"}</span>
      </section>

      <section className="panel table-panel">
        {loading ? <div aria-label="Loading patients">{Array.from({ length: 4 }, (_, i) => <div className="loading-row" key={i} />)}</div>
          : patients?.items.length ? <>
            <PatientTable patients={patients.items} hideDoctor onEdit={setEditing} onDelete={setDeleting} />
            <div className="table-foot"><Pagination value={patients.pagination} onChange={setPage} /></div>
          </> : <EmptyState icon="patient" title={hasFilters ? "No patients match these filters" : "No patients linked yet"} description={hasFilters ? "Try changing your filters or clear them to see all linked patients." : "Add the first patient record to connect it with this doctor."} />}
      </section>

      <Modal open={adding} title="Add a patient" onClose={() => setAdding(false)}>
        <PatientForm doctorId={doctorId} onCancel={() => setAdding(false)} onSaved={() => { setAdding(false); setPage(1); setRefresh((value) => value + 1); }} />
      </Modal>
      <Modal open={Boolean(editing)} title="Edit patient" onClose={() => setEditing(null)}>
        {editing && <PatientForm patient={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); setRefresh((value) => value + 1); }} />}
      </Modal>
      <Modal open={Boolean(deleting)} title="Remove patient" onClose={() => { setDeleting(null); setDeleteError(""); }}>
        <p className="confirm-copy">Remove <strong>{deleting?.name}</strong> from this doctor&apos;s patient list? This deletes the patient record from the workspace.</p>
        {deleteError && <div className="inline-alert" role="alert">{deleteError}</div>}
        <div className="form-actions">
          <button className="button button-secondary" type="button" onClick={() => setDeleting(null)}>Cancel</button>
          <button className="button button-danger" type="button" disabled={deleteBusy} onClick={confirmDelete}>{deleteBusy ? "Removing…" : "Delete patient"}</button>
        </div>
      </Modal>
    </>
  );
}
