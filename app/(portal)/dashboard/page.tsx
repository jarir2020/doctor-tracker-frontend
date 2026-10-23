"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DoctorBars, TrendChart } from "@/components/TrendChart";
import { Icon } from "@/components/Icon";
import { PageHeading } from "@/components/PageHeading";
import { StatCard } from "@/components/StatCard";
import { apiRequest, ApiError } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { DashboardSummary } from "@/lib/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<DashboardSummary>("/dashboard/summary")
      .then((data) => { if (active) setSummary(data); })
      .catch((err) => { if (active) setError(err instanceof ApiError ? err.message : "Dashboard data could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const monthlyActivity = summary?.monthlyActivity || [];
  const lastMonth = monthlyActivity[monthlyActivity.length - 1];
  return (
    <>
      <PageHeading
        eyebrow="PRACTICE OVERVIEW"
        title="A clearer view of care"
        description="Keep the people and activity behind your practice in view. Here is your current DoctorTrack snapshot."
        action={<Link className="button button-secondary" href="/doctors"><Icon name="doctor" size={16} /> Browse doctors</Link>}
      />

      {error && <div className="inline-alert" role="alert">{error}</div>}

      <section className="stats-grid" aria-label="Practice totals">
        <StatCard label="Total doctors" value={loading ? "—" : formatNumber(summary?.totals.doctors || 0)} note="Care team" icon="doctor" tone="blue" />
        <StatCard label="Total patients" value={loading ? "—" : formatNumber(summary?.totals.patients || 0)} note="Patient records" icon="patient" tone="mint" />
        <StatCard label="New doctors this month" value={loading ? "—" : formatNumber(lastMonth?.doctors || 0)} note="This month" icon="hospital" tone="violet" />
        <StatCard label="New patients this month" value={loading ? "—" : formatNumber(lastMonth?.patients || 0)} note="This month" icon="activity" tone="amber" />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-head">
            <div><h2>Practice activity</h2><p>Doctor and patient records added over the last six months</p></div>
            <div className="chart-legend">
              <span className="legend-item"><i className="legend-dot legend-patients" /> Patients</span>
              <span className="legend-item"><i className="legend-dot legend-doctors" /> Doctors</span>
            </div>
          </div>
          {loading ? <div className="loading-row" /> : <TrendChart data={monthlyActivity} />}
        </article>

        <article className="panel">
          <div className="panel-head">
            <div><h2>Patients by doctor</h2><p>Care distribution across your team</p></div>
            <Link className="text-button" href="/doctors">View team</Link>
          </div>
          {loading ? <div className="loading-row" /> : <DoctorBars data={summary?.patientsPerDoctor || []} />}
        </article>
      </section>

      <div className="dashboard-footnote"><Icon name="activity" size={15} /> Your dashboard metrics update from the latest records in your practice workspace.</div>
    </>
  );
}
