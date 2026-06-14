import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Real-time conversations with alumni and students. Get career advice, referrals, and mentorship.",
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
