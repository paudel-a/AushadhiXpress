import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";
import AddMedicineForm from "../../components/admin/AddMedicineForm";

interface Category {
  id: number;
  name: string;
}

interface Medicine {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  requiresPrescription: boolean;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
}

function MedicinesAdminPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [medicineResponse, categoryData] = await Promise.all([
          fetch("http://localhost:5000/api/medicines"),
          getCategories(),
        ]);

        if (!medicineResponse.ok) {
          throw new Error("Failed to fetch medicines");
        }

        const medicineData = await medicineResponse.json();

        setMedicines(medicineData);
        setCategories(categoryData);
      } catch (error) {
        console.error("Failed to load medicine data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <p className="text-center text-slate-600">Loading medicines...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Medicine Management
            </h1>

            <p className="mt-2 text-slate-600">
              Manage medicines available in AushadhiXpress.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
          >
            + Add Medicine
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8">
            <AddMedicineForm
              categories={categories}
              onCancel={() => setShowAddForm(false)}
              onSuccess={() => {
                setShowAddForm(false);
                window.location.reload();
              }}
            />
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Medicine
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Price
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Stock
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Type
                </th>
              </tr>
            </thead>

            <tbody>
              {medicines.map((medicine) => (
                <tr key={medicine.id} className="border-b border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {medicine.name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {medicine.category.name}
                  </td>

                  <td className="px-6 py-4">Rs. {medicine.price}</td>

                  <td className="px-6 py-4">{medicine.stock}</td>

                  <td className="px-6 py-4">
                    {medicine.requiresPrescription ? "Prescription" : "OTC"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default MedicinesAdminPage;
