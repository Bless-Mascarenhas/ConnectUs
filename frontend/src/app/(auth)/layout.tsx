import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-6 py-12">
      <Link href="/login" className="mb-10">
        <Logo />
      </Link>
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
