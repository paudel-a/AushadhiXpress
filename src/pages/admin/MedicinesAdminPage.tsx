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
  image?: string | null;
  category: Category;
}

const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of stock",
      className: "bg-red-100 text-red-700",
    };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: "Low stock",
      className: "bg-amber-100 text-amber-700",
    };
  }

  return null;
}

function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [addingMedicine, setAddingMedicine] = useState(false);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(
    null,
  );

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stockUpdating, setStockUpdating] = useState<number | null>(null);

  const loadMedicines = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/medicines");

      if (!response.ok) {
        throw new Error("Failed to fetch medicines");
      }

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

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

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

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not authenticated.");
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/medicines/${deletingMedicine.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Failed to delete medicine (${response.status})`,
        );
      }

      setMedicines((prev) =>
        prev.filter((medicine) => medicine.id !== deletingMedicine.id),
      );

      setDeletingMedicine(null);
    } catch (error) {
      console.error("Delete failed:", error);

      alert(
        error instanceof Error ? error.message : "Failed to delete medicine.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStockChange = async (medicine: Medicine, delta: number) => {
    const newStock = medicine.stock + delta;

    if (newStock < 0) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not authenticated.");
      return;
    }

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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            stock: newStock,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || `Failed to update stock (${response.status})`,
        );
      }
    } catch (error) {
      console.error("Stock update failed:", error);

      // Roll back optimistic update
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === medicine.id
            ? {
                ...m,
                stock: medicine.stock,
              }
            : m,
        ),
      );

      alert(error instanceof Error ? error.message : "Failed to update stock.");
    } finally {
      setStockUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={36} className="animate-spin text-emerald-600" />

        <p className="mt-4 text-sm text-slate-500">Loading medicines...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Manage Medicines
          </h1>

          <button
            type="button"
            onClick={() => setAddingMedicine(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add New Medicine
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((medicine) => {
            const stockStatus = getStockStatus(medicine.stock);

            const isUpdating = stockUpdating === medicine.id;

            return (
              <div
                key={medicine.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {medicine.image && (
                  <img
                    src={medicine.image}
                    alt={medicine.name}
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                )}

                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">
                    {medicine.name}
                  </h2>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingMedicine(medicine)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                      aria-label="Edit medicine"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingMedicine(medicine)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                      aria-label="Delete medicine"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  {medicine.category.name}
                </p>

                <p className="mt-2 font-bold text-emerald-600">
                  Rs. {medicine.price}
                </p>

                {/* Stock controls */}
                <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                  <button
                    type="button"
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
                    type="button"
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
                    <span className="inline-block rounded bg-amber-100 px-2 py-1 text-xs text-amber-700">
                      Prescription required
                    </span>
                  )}

                  {stockStatus && (
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs ${stockStatus.className}`}
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

      {/* Edit modal */}
      {editingMedicine && (
        <EditMedicineModal
          medicine={editingMedicine}
          categories={categories}
          onClose={() => setEditingMedicine(null)}
          onSaved={(updated) => {
            setMedicines((prev) =>
              prev.map((medicine) =>
                medicine.id === updated.id ? updated : medicine,
              ),
            );

            setEditingMedicine(null);
          }}
        />
      )}
      {/* Add medicine modal */}
      {addingMedicine && (
        <AddMedicineModal
          categories={categories}
          onClose={() => setAddingMedicine(false)}
          onCreated={(created) => {
            setMedicines((prev) => [...prev, created]);
            setAddingMedicine(false);
          }}
        />
      )}
      {/* Delete confirmation */}
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
                type="button"
                onClick={() => setDeletingMedicine(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
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
    () =>
      imageFile ? URL.createObjectURL(imageFile) : (medicine.image ?? null),
    [imageFile, medicine.image],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (stock === "" || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found. Please sign in again.");
      return;
    }

    setSaving(true);

    try {
      /*
       * IMPORTANT:
       * The current backend controller expects JSON.
       *
       * Therefore we are NOT sending FormData here.
       */
      const response = await fetch(
        `http://localhost:5000/api/medicines/${medicine.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name.trim(),

            description: description.trim() || null,

            price: Number(price),

            stock: Number(stock),

            categoryId: Number(categoryId),

            requiresPrescription,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Update medicine failed:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });

        throw new Error(
          data?.message || `Failed to update medicine (${response.status})`,
        );
      }

      console.log("Medicine updated successfully:", data);

      onSaved(data);
    } catch (error) {
      console.error("Update medicine error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to update medicine.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Edit Medicine
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Image preview only */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Image
            </label>

            <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <ImagePlus size={24} />

                  <span className="mt-1 text-xs">
                    Image upload will be added later
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
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

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
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
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Stock
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prescription */}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={requiresPrescription}
              onChange={(e) => setRequiresPrescription(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Requires prescription
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
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
function AddMedicineModal({
  categories,
  onClose,
  onCreated,
}: {
  categories: Category[];
  onClose: () => void;
  onCreated: (medicine: Medicine) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [requiresPrescription, setRequiresPrescription] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (stock === "" || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found. Please sign in again.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("http://localhost:5000/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          stock: Number(stock),
          categoryId: Number(categoryId),
          requiresPrescription,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || `Failed to create medicine (${response.status})`,
        );
      }

      onCreated(data);
    } catch (error) {
      console.error("Create medicine error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to create medicine.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Add New Medicine
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter medicine name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter medicine description"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Price (Rs.)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Stock
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prescription */}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={requiresPrescription}
              onChange={(e) => setRequiresPrescription(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Requires prescription
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Adding..." : "Add Medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AdminMedicinesPage;
