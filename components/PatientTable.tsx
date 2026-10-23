/** Doctor Tracker: Renders patient rows and exposes edit, delete, and doctor navigation actions. */
import Link from "next/link";
import { formatDate, initials } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { Icon } from "./Icon";

/** Render patient details and delegate row actions to the containing page. */
export function PatientTable({
  patients,
  hideDoctor = false,
  onEdit,
  onDelete,
}: {
  patients: Patient[];
  hideDoctor?: boolean;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Condition</th>
            {!hideDoctor && <th>Doctor</th>}
            <th>Added</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>
                <div className="primary-cell">
                  <span className="table-avatar mint">{initials(patient.name)}</span>
                  <span className="primary-cell-copy"><strong>{patient.name}</strong><small>{patient.age == null ? "Age not provided" : `${patient.age} years old`}{patient.phone ? ` · ${patient.phone}` : ""}</small></span>
                </div>
              </td>
              <td><span className="condition-pill">{patient.condition}</span></td>
              {!hideDoctor && <td>{patient.doctor?.id ? <Link className="table-link" href={`/doctors/${patient.doctor.id}`}>{patient.doctor.name} <Icon name="arrow-right" size={12} /></Link> : "-"}</td>}
              <td>{formatDate(patient.createdAt)}</td>
              <td>
                <div className="row-actions">
                  <button className="row-action" type="button" aria-label={`Edit ${patient.name}`} title="Edit patient" onClick={() => onEdit(patient)}><Icon name="edit" size={16} /></button>
                  <button className="row-action danger" type="button" aria-label={`Delete ${patient.name}`} title="Delete patient" onClick={() => onDelete(patient)}><Icon name="trash" size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
