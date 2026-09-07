import { TopBar } from "./TopBar";
import { BalanceHeader } from "./BalanceHeader";
import { CategoriesSection } from "./CategoriesSection";
import { ApartmentsTable } from "./ApartmentsTable";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <TopBar />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <BalanceHeader />
        <CategoriesSection />
        <ApartmentsTable />
      </main>
    </div>
  );
}
