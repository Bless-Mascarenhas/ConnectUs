import { CommandPaletteProvider } from "@/components/features/command-palette";
import { Sidebar } from "@/components/layout/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      <div className="min-h-screen flex bg-canvas">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </CommandPaletteProvider>
  );
}
