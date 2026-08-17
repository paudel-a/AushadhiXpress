import { getCategories } from "../services/categoryService";
import { useEffect, useState } from "react";
import {
  Pill,
  HeartPulse,
  Syringe,
  Baby,
  Stethoscope,
  ShieldPlus,
  type LucideIcon,
} from "lucide-react";
import CategoryCard from "../components/home/CategoryCard";
import type { Category } from "../data/categories";

const categoryIcons: Record<string, LucideIcon> = {
  "Pain Relief": Pill,
  "Heart Care": HeartPulse,
  Diabetes: Syringe,
  "Baby Care": Baby,
  Healthcare: Stethoscope,
  Immunity: ShieldPlus,
};

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => {
        const categoriesWithIcons: Category[] = data.map((category) => ({
          ...category,
          icon: categoryIcons[category.name] || Pill,
        }));

        setCategories(categoriesWithIcons);
      })
      .catch((error) => {
        console.error("Category fetch error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Categories</h1>

          <p className="mt-4 text-slate-600">
            Browse medicines and healthcare products by category.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-slate-600">Loading categories...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default CategoriesPage;
