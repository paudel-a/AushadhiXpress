import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Pencil,
  Trash2,
  X,
  ImagePlus,
  Plus,
  Minus,
} from "lucide-react";

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
  imageUrl?: string | null;
  category: Category;
}

const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(stock: number) {
  if (stock === 0)
    return { label: "Out of stock", className: "bg-red-100 text-red-700" };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { label: "Low stock", className: "bg-amber-100 text-amber-700" };
  return null;
}

function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stockUpdating, setStockUpdating] = useState<number | null>(null);

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

  const loadCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    loadMedicines();
    loadCategories();
  }, []);

  const handleDelete = async () => {
    if (!deletingMedicine) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/medicines/${deletingMedicine.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to delete medicine");
      setMedicines((prev) => prev.filter((m) => m.id !== deletingMedicine.id));
      setDeletingMedicine(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete medicine. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStockChange = async (medicine: Medicine, delta: number) => {
    const newStock = medicine.stock + delta;
    if (newStock < 0) return;

    // Optimistic update
    setMedicines((prev) =>
      prev.map((m) => (m.id === medicine.id ? { ...m, stock: newStock } : m)),
    );
    setStockUpdating(medicine.id);

    try {
      const response = await fetch(
        `http://localhost:5000/api/medicines/${medicine.id}/stock`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: newStock }),
        },
      );
      if (!response.ok) throw new Error("Failed to update stock");
    } catch (error) {
      console.error("Stock update failed:", error);
      // Roll back on failure
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === medicine.id ? { ...m, stock: medicine.stock } : m,
        ),
      );
      alert("Failed to update stock. Please try again.");
    } finally {
      setStockUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="mt-4 text-slate-500 text-sm">Loading medicines...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Manage Medicines
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((medicine) => {
            const stockStatus = getStockStatus(medicine.stock);
            const isUpdating = stockUpdating === medicine.id;

            return (
              <div
                key={medicine.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {medicine.imageUrl && (
                  <img
                    src={medicine.imageUrl}
                    alt={medicine.name}
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                )}

                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">
                    {medicine.name}
                  </h2>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setEditingMedicine(medicine)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                      aria-label="Edit medicine"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingMedicine(medicine)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                      aria-label="Delete medicine"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-1">
                  {medicine.category.name}
                </p>
                <p className="mt-2 text-emerald-600 font-bold">
                  Rs. {medicine.price}
                </p>

                {/* Restock stepper */}
                <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                  <button
                    onClick={() => handleStockChange(medicine, -1)}
                    disabled={isUpdating || medicine.stock === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Decrease stock"
                  >
                    <Minus size={14} />
                  </button>

                  <div className="flex items-center gap-1.5 text-sm">
                    {isUpdating && (
                      <Loader2
                        size={12}
                        className="animate-spin text-slate-400"
                      />
                    )}
                    <span className="font-medium text-slate-700">
                      {medicine.stock}
                    </span>
                    <span className="text-slate-400">in stock</span>
                  </div>

                  <button
                    onClick={() => handleStockChange(medicine, 1)}
                    disabled={isUpdating}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Increase stock"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {medicine.requiresPrescription && (
                    <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                      Prescription required
                    </span>
                  )}
                  {stockStatus && (
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded ${stockStatus.className}`}
                    >
                      {stockStatus.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingMedicine && (
        <EditMedicineModal
          medicine={editingMedicine}
          categories={categories}
          onClose={() => setEditingMedicine(null)}
          onSaved={(updated) => {
            setMedicines((prev) =>
              prev.map((m) => (m.id === updated.id ? updated : m)),
            );
            setEditingMedicine(null);
          }}
        />
      )}

      {deletingMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete "{deletingMedicine.name}"?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeletingMedicine(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function EditMedicineModal({
  medicine,
  categories,
  onClose,
  onSaved,
}: {
  medicine: Medicine;
  categories: Category[];
  onClose: () => void;
  onSaved: (updated: Medicine) => void;
}) {
  const [name, setName] = useState(medicine.name);
  const [description, setDescription] = useState(medicine.description ?? "");
  const [price, setPrice] = useState(medicine.price);
  const [stock, setStock] = useState(medicine.stock.toString());
  const [categoryId, setCategoryId] = useState(medicine.category.id.toString());
  const [requiresPrescription, setRequiresPrescription] = useState(
    medicine.requiresPrescription,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : medicine.imageUrl),
    [imageFile, medicine.imageUrl],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Name is required.");
    if (Number(price) < 0) return setError("Price cannot be negative.");
    if (Number(stock) < 0) return setError("Stock cannot be negative.");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("categoryId", categoryId);
      formData.append("requiresPrescription", String(requiresPrescription));
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch(
        `http://localhost:5000/api/medicines/${medicine.id}`,
        { method: "PUT", body: formData },
      );
      if (!response.ok) throw new Error("Failed to update medicine");
      const updated = await response.json();
      onSaved(updated);
    } catch (err) {
      console.error(err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Edit Medicine
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Image
            </label>
            <label className="flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:border-emerald-400">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <ImagePlus size={24} />
                  <span className="mt-1 text-xs">Upload image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price (Rs.)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={requiresPrescription}
              onChange={(e) => setRequiresPrescription(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Requires prescription
          </label>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminMedicinesPage;
