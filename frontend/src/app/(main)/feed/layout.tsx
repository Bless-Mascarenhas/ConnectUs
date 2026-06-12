import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Feed",
  description: "The latest posts, announcements, and discussions from the ConnectUs community.",
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
