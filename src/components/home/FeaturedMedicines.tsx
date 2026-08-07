import { medicines } from "../../data/medicines";
import MedicineCard from "./MedicineCard";

function FeaturedMedicines() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Featured Medicines
            </h2>

            <p className="mt-2 text-slate-600">
              Popular medicines and healthcare products.
            </p>
          </div>

          <button className="font-medium text-emerald-600 transition hover:text-emerald-700">
            View All →
          </button>
        </div>

        {/* Medicine Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {medicines.map((medicine) => (
            <MedicineCard key={medicine.id} medicine={medicine} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedMedicines;
