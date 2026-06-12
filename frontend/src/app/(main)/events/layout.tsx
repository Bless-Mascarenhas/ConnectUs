import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming panels, workshops, and networking mixers hosted by alumni. RSVP and connect.",
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
