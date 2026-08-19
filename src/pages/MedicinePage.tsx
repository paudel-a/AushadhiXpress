import { useEffect, useState } from "react";

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

  if (loading) {
    return <p className="text-center py-10">Loading medicines...</p>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Medicines</h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((medicine) => (
            <div
              key={medicine.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold text-slate-900">{medicine.name}</h2>
              <p className="text-sm text-slate-600 mt-1">
                {medicine.category.name}
              </p>
              <p className="mt-2 text-emerald-600 font-bold">
                Rs. {medicine.price}
              </p>
              <p className="text-sm text-slate-500">Stock: {medicine.stock}</p>
              {medicine.requiresPrescription && (
                <span className="mt-2 inline-block text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  Prescription required
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default MedicinesPage;
