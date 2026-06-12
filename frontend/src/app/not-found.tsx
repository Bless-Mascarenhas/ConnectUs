import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-6">
      <div className="relative text-center max-w-md">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-40%] left-[10%] w-[60%] h-[80%] rounded-full bg-[#00D4AE]/5 blur-[100px]" />
        </div>

        <Logo className="justify-center mb-10" />

        {/* Large 404 */}
        <h1 className="text-[120px] sm:text-[160px] font-serif leading-none tracking-tight text-ink/5 select-none">
          404
        </h1>

        <div className="-mt-10 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-ink">
            Page not found
          </h2>
          <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-ink text-canvas text-[14px] font-medium transition-all hover:bg-ink/90 hover:shadow-lg"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-surface border border-line/70 text-ink text-[14px] font-medium transition-all hover:bg-muted/50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
