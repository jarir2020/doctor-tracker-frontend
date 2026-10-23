/** Doctor Tracker: Defines the frontend shapes shared by API responses and UI components. */
export type Admin = {
  id: string;
  name: string;
  email: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number | null;
  condition: string;
  phone: string;
  notes: string;
  doctor: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type PaginationData = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListData<T> = {
  items: T[];
  pagination: PaginationData;
};

export type DashboardSummary = {
  totals: { doctors: number; patients: number };
  monthlyActivity: { month: string; label: string; doctors: number; patients: number }[];
  patientsPerDoctor: { doctorId: string; name: string; specialization: string; patients: number }[];
};
