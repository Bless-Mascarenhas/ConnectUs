import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your ConnectUs dashboard — stats, recommended alumni, upcoming events, and recent activity at a glance.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
