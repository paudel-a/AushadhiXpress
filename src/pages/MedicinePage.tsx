import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

interface Medicine {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  requiresPrescription: boolean;
  imageUrl?: string | null;
  image?: string | null;
  category: {
    id: number;
    name: string;
  };
}

const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-100 text-red-700",
    };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: "Low Stock",
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "In Stock",
    className: "bg-emerald-100 text-emerald-700",
  };
}

function normalizeMedicine(medicine: Medicine): Medicine {
  return {
    ...medicine,
    imageUrl: medicine.imageUrl ?? medicine.image ?? null,
  };
}

function MedicinesPage() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/medicines");

        if (!response.ok) {
          throw new Error("Failed to fetch medicines");
        }

        const data: Medicine[] = await response.json();

        setMedicines(data.map(normalizeMedicine));
      } catch (err) {
        console.error("Failed to load medicines:", err);
        setError("Unable to load medicines. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadMedicines();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(medicines.map((medicine) => medicine.category.name)),
    );

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
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Medicines</h1>

        <div className="mb-4 max-w-2xl">
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

        <div className="mb-8 max-w-2xl">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                Category: {category}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-slate-500">
            Loading medicines...
          </p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMedicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.stock);

                return (
                  <div
                    key={medicine.id}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    {medicine.imageUrl && (
                      <img
                        src={medicine.imageUrl}
                        alt={medicine.name}
                        className="mb-3 h-40 w-full rounded-lg object-cover"
                      />
                    )}

                    <h2 className="font-semibold text-slate-900">
                      {medicine.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      {medicine.category.name}
                    </p>

                    <p className="mt-2 font-bold text-emerald-600">
                      Rs. {medicine.price}
                    </p>

                    <span
                      className={`mt-2 inline-block w-fit rounded px-2 py-1 text-xs ${stockStatus.className}`}
                    >
                      {stockStatus.label}
                    </span>

                    {medicine.requiresPrescription && (
                      <span className="mt-2 inline-block w-fit rounded bg-amber-100 px-2 py-1 text-xs text-amber-700">
                        Prescription required
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedMedicineId(medicine.id)}
                      className="mt-4 self-end text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                );
              })}
            </div>

            {filteredMedicines.length === 0 && (
              <p className="mt-10 text-center text-slate-500">
                No medicines found.
              </p>
            )}
          </>
        )}
      </div>

      {selectedMedicineId !== null && (
        <MedicineDetailsModal
          medicineId={selectedMedicineId}
          onClose={() => setSelectedMedicineId(null)}
          onUploadPrescription={() => {
            navigate(`/prescriptions?medicineId=${selectedMedicineId}`);
          }}
        />
      )}
    </main>
  );
}

function MedicineDetailsModal({
  medicineId,
  onClose,
  onUploadPrescription,
}: {
  medicineId: number;
  onClose: () => void;
  onUploadPrescription: () => void;
}) {
  const { addToCart } = useCart();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMedicine = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5000/api/medicines/${medicineId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch medicine details");
        }

        const data: Medicine = await response.json();

        setMedicine(normalizeMedicine(data));
      } catch (err) {
        console.error(err);
        setError("Could not load medicine details.");
      } finally {
        setLoading(false);
      }
    };

    void loadMedicine();
  }, [medicineId]);

  const stockStatus = medicine ? getStockStatus(medicine.stock) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Medicine Details
          </h3>

          <button
            onClick={onClose}
            aria-label="Close medicine details"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {loading && (
            <p className="py-10 text-center text-slate-500">
              Loading details...
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {medicine && !loading && !error && (
            <div>
              {medicine.imageUrl && (
                <img
                  src={medicine.imageUrl}
                  alt={medicine.name}
                  className="mb-4 h-48 w-full rounded-lg object-cover"
                />
              )}

              <h2 className="text-xl font-bold text-slate-900">
                {medicine.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {medicine.category.name}
              </p>

              <p className="mt-3 text-2xl font-bold text-emerald-600">
                Rs. {medicine.price}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {stockStatus && (
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs ${stockStatus.className}`}
                  >
                    {stockStatus.label} ({medicine.stock} units)
                  </span>
                )}

                {medicine.requiresPrescription && (
                  <span className="inline-block rounded bg-amber-100 px-2 py-1 text-xs text-amber-700">
                    Prescription required
                  </span>
                )}
              </div>

              {medicine.description && (
                <div className="mt-4">
                  <h4 className="mb-1 text-sm font-semibold text-slate-700">
                    Description
                  </h4>

                  <p className="text-sm leading-relaxed text-slate-600">
                    {medicine.description}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>

                {medicine.requiresPrescription ? (
                  <button
                    onClick={onUploadPrescription}
                    disabled={medicine.stock === 0}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Upload Prescription
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      addToCart({
                        id: medicine.id,
                        name: medicine.name,
                        price: medicine.price,
                        imageUrl: medicine.imageUrl,
                        stock: medicine.stock,
                      });

                      onClose();
                    }}
                    disabled={medicine.stock === 0}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                )}
              </div>

              {medicine.requiresPrescription && (
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  This medicine cannot be added to your cart until your
                  prescription has been reviewed and approved.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicinesPage;
