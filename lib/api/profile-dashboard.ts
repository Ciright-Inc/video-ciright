import type { ProfileDashboardData } from "@/lib/profile/dashboardData";

export async function fetchProfileDashboard(): Promise<ProfileDashboardData> {
  const res = await fetch("/api/profile/dashboard");
  if (!res.ok) {
    throw new Error(`Failed to fetch profile dashboard: ${res.status}`);
  }
  return res.json() as Promise<ProfileDashboardData>;
}
