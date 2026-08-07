import { benefits } from "../../data/benefits";
import BenefitCard from "./BenefitCard";

function Benefits() {
  return (
    <section className="bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Why Choose AushadhiXpress?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            We make getting your medicines simple, safe, and convenient.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Benefits;
