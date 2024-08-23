// app/feeds/layout.tsx

import SearchBar from "../_components/SearchBar";
import Sidebar from "../_components/Sidebar";


export default function FeedsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-slate-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-12 sm:px-6 lg:px-4">
          <SearchBar />
          {children}
        </div>
      </main>
    </div>
  );
}