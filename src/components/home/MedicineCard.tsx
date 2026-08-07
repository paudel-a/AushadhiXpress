import { Star, ShoppingCart } from "lucide-react";
import type { Medicine } from "../../data/medicines";

interface MedicineCardProps {
  medicine: Medicine;
}

function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Medicine Image */}
      <div className="flex h-52 items-center justify-center bg-slate-50">
        <div className="flex h-52 items-center justify-center bg-slate-50">
          <div className="text-6xl">💊</div>
        </div>
      </div>

      {/* Medicine Details */}
      <div className="p-5">
        <p className="text-sm text-slate-500">{medicine.category}</p>

        <h3 className="mt-1 text-lg font-semibold text-slate-900">
          {medicine.name}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-slate-600">
            {medicine.rating}
          </span>
        </div>

        {/* Price + Cart */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl font-bold text-emerald-600">
            Rs. {medicine.price}
          </p>

          <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
            <ShoppingCart size={18} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default MedicineCard;
