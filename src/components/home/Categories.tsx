import { useEffect, useState } from "react";
import api from "../../services/api";
import CategoryCard from "./CategoryCard";

import {
  Pill,
  HeartPulse,
  Syringe,
  Baby,
  Stethoscope,
  ShieldPlus,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  description?: string;
}

const categoryIcons = {
  "Pain Relief": Pill,
  "Heart Care": HeartPulse,
  Diabetes: Syringe,
  "Baby Care": Baby,
  Healthcare: Stethoscope,
  Immunity: ShieldPlus,
};

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
          {categories.map((category) => {
            const Icon =
              categoryIcons[category.name as keyof typeof categoryIcons];

            return (
              <CategoryCard
                key={category.id}
                category={{
                  ...category,
                  icon: Icon,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Categories;
