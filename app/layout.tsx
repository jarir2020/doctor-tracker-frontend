/** Doctor Tracker: Defines the shared document shell and page metadata for the application. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DoctorTrack | Care operations",
  description: "A focused workspace for managing doctors, patients, and care activity.",
};

/** Supplies the document language and shared body to every route. */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
