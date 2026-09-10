import { FileUp, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PrescriptionCTA() {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-10 rounded-3xl bg-emerald-600 px-8 py-12 text-white lg:flex-row lg:px-12">
          {/* Content */}
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-white/15 p-3">
                <FileUp size={24} />
              </div>

              <span className="font-medium text-emerald-50">
                Prescription Orders
              </span>
            </div>

            <h2 className="text-3xl font-bold sm:text-4xl">
              Have a prescription?
            </h2>

            <p className="mt-4 leading-7 text-emerald-50">
              Upload your prescription and let our pharmacy team help you find
              the medicines you need.
            </p>

            <button
              onClick={() => navigate("/prescriptions")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              <FileUp size={18} />
              Upload Prescription
            </button>
          </div>

          {/* Trust Information */}
          <div className="flex max-w-sm items-start gap-4 rounded-2xl bg-white/10 p-6">
            <ShieldCheck size={28} className="mt-1 shrink-0" />

            <div>
              <h3 className="font-semibold">Safe & Secure</h3>

              <p className="mt-2 text-sm leading-6 text-emerald-50">
                Your prescription information is handled securely by our
                pharmacy team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrescriptionCTA;
