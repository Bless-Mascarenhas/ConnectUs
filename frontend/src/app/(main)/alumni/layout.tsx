import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumni Directory",
  description: "Browse verified alumni by industry, company, and expertise. Filter, connect, and grow your professional network.",
};

export default function AlumniLayout({ children }: { children: React.ReactNode }) {
  return children;
}
