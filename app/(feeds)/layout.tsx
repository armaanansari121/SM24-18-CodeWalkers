// app/feeds/layout.tsx

import SearchBar from "../_components/SearchBar";
import Sidebar from "../_components/Sidebar";


export default function FeedsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <SearchBar />
          {children}
        </div>
      </main>
    </div>
  );
}