import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { Providers } from "@/components/Providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-figaro-black">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopBar />
          <main id="main-content" className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
}
