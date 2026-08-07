import type { Category } from "../../data/categories";

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <div className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-200 hover:shadow-xl">
      <div className="mb-6 inline-flex rounded-full bg-emerald-100 p-4 transition group-hover:bg-emerald-600">
        <Icon
          size={32}
          className="text-emerald-600 transition group-hover:text-white"
        />
      </div>

      <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>

      <p className="mt-2 text-sm text-slate-500">
        Browse medicines and healthcare products.
      </p>

      <div className="mt-6 font-medium text-emerald-600 transition group-hover:translate-x-2">
        Shop Now →
      </div>
    </div>
  );
}

export default CategoryCard;
