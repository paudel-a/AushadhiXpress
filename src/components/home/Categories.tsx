import { getCategories } from "../../services/categoryService";
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
import CategoryCard from "./CategoryCard";
import type { Category } from "../../data/categories";

const categoryIcons: Record<string, LucideIcon> = {
  "Pain Relief": Pill,
  "Vitamins & Supplements": HeartPulse,
  "Diabetes Care": Syringe,
  "Baby Care": Baby,
  "Personal Care": Stethoscope,
  "First Aid": ShieldPlus,
};

function Categories() {
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

  if (loading) {
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-slate-600">Loading categories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Browse by Category
          </h2>

          <p className="mt-4 text-slate-600">
            Find medicines and healthcare products by category.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
