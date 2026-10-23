/** Doctor Tracker: Sends the application entry route to the dashboard route. */
import { redirect } from "next/navigation";

/** Route the site root to the authenticated portal entry. */
export default function HomePage() {
  redirect("/dashboard");
}
