/** Doctor Tracker: Displays the patient directory and handles filtering, editing, and deletion. */
"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { Modal } from "@/components/Modal";
import { PageHeading } from "@/components/PageHeading";
import { Pagination } from "@/components/Pagination";
import { PatientForm } from "@/components/PatientForm";
import { PatientTable } from "@/components/PatientTable";
import { apiRequest, ApiError, queryString } from "@/lib/api";
import { useDebouncedValue } from "@/lib/hooks";
import type { ListData, Patient } from "@/lib/types";

const PAGE_SIZE = 10;

/** Loads, filters, and manages patient records across the practice. */
export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<ListData<Patient> | null>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [loadedQuery, setLoadedQuery] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const query = queryString({ q: debouncedSearch, condition, from, to, page, limit: PAGE_SIZE });
  // Changing this key after a mutation causes the current list to be fetched again.
  const queryKey = `${query}&refresh=${refresh}`;
  const loading = loadedQuery !== queryKey;

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<ListData<Patient>>(`/patients?${query}`),
      apiRequest<{ conditions: string[] }>("/patients/conditions"),
    ])
      .then(([patientData, conditionData]) => {
        if (!active) return;
        setData(patientData);
        setConditions(conditionData.conditions);
        setError("");
      })
      .catch((err) => { if (active) setError(err instanceof ApiError ? err.message : "Patient records could not be loaded."); })
      .finally(() => { if (active) setLoadedQuery(queryKey); });
    // Ignore results from an outdated filter set or an unmounted page.
    return () => { active = false; };
  }, [query, queryKey]);

  /** Delete the selected record and trigger a refresh after success. */
  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await apiRequest(`/patients/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      setRefresh((value) => value + 1);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Patient could not be deleted.");
    } finally {
      setDeleteBusy(false);
    }
  }

  const hasFilters = Boolean(search || condition || from || to);
  /** Clear all filters together and return to the first result page. */
  function resetFilters() {
    setSearch(""); setCondition(""); setFrom(""); setTo(""); setPage(1);
  }

  return (
    <>
      <PageHeading
        eyebrow="PATIENT DIRECTORY"
        title="Patients"
        description="Review patient records across your care team. Search, filter, and keep each record current."
      />

      {error && !loading && <div className="inline-alert" role="alert">{error}</div>}

      <section className="toolbar" aria-label="Patient list filters">
        <label className="search-box"><Icon name="search" size={17} /><input aria-label="Search patients" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, condition, phone…" /></label>
        <label className="filter-box"><Icon name="filter" size={15} /><select aria-label="Filter by condition" value={condition} onChange={(event) => { setCondition(event.target.value); setPage(1); }}><option value="">All conditions</option>{conditions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="filter-box"><Icon name="calendar" size={15} /><span className="filter-caption">From</span><input aria-label="Filter patients from date" type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} /></label>
        <label className="filter-box"><Icon name="calendar" size={15} /><span className="filter-caption">To</span><input aria-label="Filter patients to date" type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} /></label>
        {hasFilters && <button className="text-button filter-reset" type="button" onClick={resetFilters}>Clear filters</button>}
        <span className="results-label">{data ? `${data.pagination.total} ${data.pagination.total === 1 ? "patient" : "patients"}` : "Loading records"}</span>
      </section>

      <section className="panel table-panel">
        {loading ? <div aria-label="Loading patients">{Array.from({ length: 5 }, (_, i) => <div className="loading-row" key={i} />)}</div>
          : data?.items.length ? <>
            <PatientTable patients={data.items} onEdit={setEditing} onDelete={setDeleting} />
            <div className="table-foot"><Pagination value={data.pagination} onChange={setPage} /></div>
          </> : <EmptyState icon="patient" title={hasFilters ? "No patients match these filters" : "No patient records yet"} description={hasFilters ? "Adjust your search or clear filters to see all patient records." : "Patient records added from a doctor profile will appear here."} />}
      </section>

      <Modal open={Boolean(editing)} title="Edit patient" onClose={() => setEditing(null)}>
        {editing && <PatientForm patient={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); setRefresh((value) => value + 1); }} />}
      </Modal>
      <Modal open={Boolean(deleting)} title="Delete patient record" onClose={() => { setDeleting(null); setDeleteError(""); }}>
        <p className="confirm-copy">Delete <strong>{deleting?.name}</strong> and remove this record from the workspace? This action cannot be undone.</p>
        {deleteError && <div className="inline-alert" role="alert">{deleteError}</div>}
        <div className="form-actions">
          <button className="button button-secondary" type="button" onClick={() => setDeleting(null)}>Cancel</button>
          <button className="button button-danger" type="button" disabled={deleteBusy} onClick={confirmDelete}>{deleteBusy ? "Deleting…" : "Delete record"}</button>
        </div>
      </Modal>
    </>
  );
}
