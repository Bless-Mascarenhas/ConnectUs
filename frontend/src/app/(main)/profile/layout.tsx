import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile",
  description: "View and edit your ConnectUs profile — bio, experience, interests, and more.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
