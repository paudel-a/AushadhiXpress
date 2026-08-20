import { Search, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Medicine {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  requiresPrescription: boolean;
  category: {
    id: number;
    name: string;
  };
}

function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/medicines");
        if (!response.ok) throw new Error("Failed to fetch medicines");
        const data = await response.json();
        setMedicines(data);
      } catch (error) {
        console.error("Failed to load medicines:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, []);

  // Unique category names, derived from the fetched medicines
  const categories = useMemo(() => {
    const unique = Array.from(new Set(medicines.map((m) => m.category.name)));
    return ["All", ...unique];
  }, [medicines]);

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch = medicine.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || medicine.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-indigo-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Medicines</h1>

        <div className="mx-auto max-w-2xl mb-6 lg:mx-0">
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white">
            <Search size={20} className="ml-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines..."
              className="flex-1 px-4 py-3 outline-none"
            />
          </div>
        </div>

        {!loading && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  selectedCategory === category
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-600 border-slate-300 hover:border-emerald-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-emerald-600" />
            <p className="mt-4 text-slate-500 text-sm">Loading medicines...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <h2 className="font-semibold text-slate-900">
                    {medicine.name}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {medicine.category.name}
                  </p>
                  <p className="mt-2 text-emerald-600 font-bold">
                    Rs. {medicine.price}
                  </p>
                  <p className="text-sm text-slate-500">
                    Stock: {medicine.stock}
                  </p>
                  {medicine.requiresPrescription && (
                    <span className="mt-2 inline-block text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                      Prescription required
                    </span>
                  )}
                </div>
              ))}
            </div>

            {filteredMedicines.length === 0 && (
              <p className="text-center text-slate-500 mt-10">
                No medicines found.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default MedicinesPage;
