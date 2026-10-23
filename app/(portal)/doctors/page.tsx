"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DoctorForm } from "@/components/DoctorForm";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { Modal } from "@/components/Modal";
import { PageHeading } from "@/components/PageHeading";
import { Pagination } from "@/components/Pagination";
import { apiRequest, ApiError, queryString } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import type { Doctor, ListData } from "@/lib/types";

const PAGE_SIZE = 10;

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<ListData<Doctor> | null>(null);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [loadedQuery, setLoadedQuery] = useState("");
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const query = queryString({ q: debouncedSearch, specialization, from, to, page, limit: PAGE_SIZE });
  const queryKey = `${query}&refresh=${refresh}`;
  const loading = loadedQuery !== queryKey;

  useEffect(() => {
    let active = true;
    apiRequest<ListData<Doctor>>(`/doctors?${query}`)
      .then((result) => { if (active) { setData(result); setError(""); } })
      .catch((err) => { if (active) setError(err instanceof ApiError ? err.message : "Doctor records could not be loaded."); })
      .finally(() => { if (active) setLoadedQuery(queryKey); });
    return () => { active = false; };
  }, [query, queryKey]);

  useEffect(() => {
    let active = true;
    apiRequest<{ specializations: string[] }>("/doctors/specializations")
      .then((result) => { if (active) setSpecializations(result.specializations); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const hasFilters = Boolean(search || specialization || from || to);
  function resetFilters() {
    setSearch(""); setSpecialization(""); setFrom(""); setTo(""); setPage(1);
  }

  return (
    <>
      <PageHeading
        eyebrow="CARE TEAM"
        title="Doctors"
        description="Keep your provider directory organized and see which patients are connected to each doctor."
        action={<button className="button button-primary" type="button" onClick={() => setCreateOpen(true)}><Icon name="plus" size={16} /> Add doctor</button>}
      />

      {error && !loading && <div className="inline-alert" role="alert">{error}</div>}

      <section className="toolbar" aria-label="Doctor list filters">
        <label className="search-box"><Icon name="search" size={17} /><input aria-label="Search doctors" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, specialty, hospital…" /></label>
        <label className="filter-box"><Icon name="filter" size={15} /><select aria-label="Filter by specialization" value={specialization} onChange={(event) => { setSpecialization(event.target.value); setPage(1); }}><option value="">All specialties</option>{specializations.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="filter-box"><Icon name="calendar" size={15} /><span className="filter-caption">From</span><input aria-label="Filter doctors from date" type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} /></label>
        <label className="filter-box"><Icon name="calendar" size={15} /><span className="filter-caption">To</span><input aria-label="Filter doctors to date" type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} /></label>
        {hasFilters && <button className="text-button filter-reset" type="button" onClick={resetFilters}>Clear filters</button>}
        <span className="results-label">{data ? `${data.pagination.total} ${data.pagination.total === 1 ? "doctor" : "doctors"}` : "Loading directory"}</span>
      </section>

      <section className="panel table-panel">
        {loading ? <div aria-label="Loading doctors">{Array.from({ length: 5 }, (_, i) => <div className="loading-row" key={i} />)}</div>
          : data?.items.length ? <>
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Doctor</th><th>Specialization</th><th>Hospital</th><th>Contact</th><th>Added</th><th><span className="sr-only">View</span></th></tr></thead>
                <tbody>
                  {data.items.map((doctor) => (
                    <tr key={doctor.id}>
                      <td><div className="primary-cell"><span className="table-avatar">{initials(doctor.name)}</span><span className="primary-cell-copy"><strong>{doctor.name}</strong><small>{doctor.email}</small></span></div></td>
                      <td><span className="specialty-pill">{doctor.specialization}</span></td>
                      <td><span className="cell-with-icon"><Icon name="hospital" size={14} /> {doctor.hospital}</span></td>
                      <td>{doctor.phone}</td>
                      <td>{formatDate(doctor.createdAt)}</td>
                      <td><Link className="table-link" href={`/doctors/${doctor.id}`}>Patients <Icon name="arrow-right" size={14} /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-foot"><Pagination value={data.pagination} onChange={setPage} /></div>
          </> : <EmptyState icon="doctor" title={hasFilters ? "No doctors match these filters" : "Your care team starts here"} description={hasFilters ? "Try a different search or clear the filters to see all doctors." : "Add a doctor to begin organizing your practice and patient relationships."} />}
      </section>

      <Modal open={createOpen} title="Add a doctor" onClose={() => setCreateOpen(false)}>
        <DoctorForm onCancel={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); setPage(1); setRefresh((value) => value + 1); }} />
      </Modal>
    </>
  );
}
