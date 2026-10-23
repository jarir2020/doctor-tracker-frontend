/** Doctor Tracker: Draws SVG activity trends and patient counts by doctor. */
import type { DashboardSummary } from "@/lib/types";

/** Plot doctor and patient registrations against a shared six-month scale. */
export function TrendChart({ data }: { data: DashboardSummary["monthlyActivity"] }) {
  const width = 680;
  const height = 214;
  const left = 34;
  const right = width - 14;
  const top = 18;
  const bottom = 170;
  // Use one shared scale so the two series remain directly comparable.
  const max = Math.max(4, ...data.flatMap((item) => [item.patients, item.doctors]));
  const xFor = (index: number) => left + (data.length <= 1 ? 0 : index * (right - left) / (data.length - 1));
  const yFor = (value: number) => bottom - value / max * (bottom - top);
  const patients = data.map((item, index) => `${xFor(index)},${yFor(item.patients)}`).join(" ");
  const doctors = data.map((item, index) => `${xFor(index)},${yFor(item.doctors)}`).join(" ");

  return (
    <div className="trend-chart-wrap">
      <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly doctor and patient registrations for the last six months">
        {[0, 1, 2, 3].map((line) => {
          const y = top + line * (bottom - top) / 3;
          return <line key={line} x1={left} x2={right} y1={y} y2={y} className="chart-gridline" />;
        })}
        <polyline points={patients} className="chart-line chart-line-patients" />
        <polyline points={doctors} className="chart-line chart-line-doctors" />
        {data.map((item, index) => (
          <g key={item.month}>
            <circle cx={xFor(index)} cy={yFor(item.patients)} r="4" className="chart-point-patients" />
            <circle cx={xFor(index)} cy={yFor(item.doctors)} r="3.5" className="chart-point-doctors" />
            <text x={xFor(index)} y="202" textAnchor="middle" className="chart-month">{item.label}</text>
          </g>
        ))}
      </svg>
      <div className="chart-scale"><span>{max}</span><span>{Math.ceil(max / 2)}</span><span>0</span></div>
    </div>
  );
}

/** Compare patient totals per doctor using widths relative to the largest count. */
export function DoctorBars({ data }: { data: DashboardSummary["patientsPerDoctor"] }) {
  const max = Math.max(1, ...data.map((item) => item.patients));
  if (!data.length) return <div className="chart-empty">Add a doctor and patient to see care distribution.</div>;

  return (
    <div className="doctor-bars">
      {data.map((item, index) => (
        <div className="doctor-bar-row" key={item.doctorId}>
          <div className="doctor-bar-label"><span>{item.name}</span><strong>{item.patients}</strong></div>
          <div className="bar-track"><span style={{ width: `${Math.max(item.patients > 0 ? 8 : 0, item.patients / max * 100)}%`, animationDelay: `${index * 70}ms` }} /></div>
          <small>{item.specialization}</small>
        </div>
      ))}
    </div>
  );
}
