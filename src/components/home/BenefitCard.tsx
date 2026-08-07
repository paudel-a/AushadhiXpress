import type { Benefit } from "../../data/benefits";

interface BenefitCardProps {
  benefit: Benefit;
}

function BenefitCard({ benefit }: BenefitCardProps) {
  const Icon = benefit.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
        <Icon size={28} className="text-emerald-600" />
      </div>

      <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {benefit.description}
      </p>
    </div>
  );
}

export default BenefitCard;
