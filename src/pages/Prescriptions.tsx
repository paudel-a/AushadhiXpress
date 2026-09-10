import { useEffect, useState } from "react";
import { FileUp, Clock3, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type PrescriptionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Prescription {
  id: number;
  documentUrl: string;
  status: PrescriptionStatus;
  rejectionReason: string | null;
  createdAt: string;
}

function Prescriptions() {
  const [documentUrl, setDocumentUrl] = useState("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/prescriptions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch prescriptions");
      }

      setPrescriptions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch prescriptions",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentUrl.trim()) {
      setError("Please enter a prescription document URL.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await fetch("http://localhost:5000/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentUrl: documentUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit prescription");
      }

      setMessage("Prescription submitted successfully.");
      setDocumentUrl("");

      await fetchPrescriptions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit prescription",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: PrescriptionStatus) => {
    if (status === "APPROVED") {
      return <CheckCircle2 size={18} />;
    }

    if (status === "REJECTED") {
      return <XCircle size={18} />;
    }

    return <Clock3 size={18} />;
  };

  const getStatusStyle = (status: PrescriptionStatus) => {
    if (status === "APPROVED") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "REJECTED") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            My Prescriptions
          </h1>

          <p className="mt-2 text-slate-600">
            Submit your prescription and track its approval status.
          </p>
        </div>

        {/* Submit Prescription */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <FileUp size={24} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Submit Prescription
              </h2>

              <p className="text-sm text-slate-500">
                Enter the URL of your prescription document.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Prescription Document URL
            </label>

            <input
              type="url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://example.com/prescription.pdf"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileUp size={18} />
                  Submit Prescription
                </>
              )}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>

        {/* Prescription History */}
        <section className="mt-10">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            Prescription History
          </h2>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl bg-white py-16">
              <Loader2 size={28} className="animate-spin text-emerald-600" />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
              <FileUp size={40} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-800">
                No prescriptions yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your submitted prescriptions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Prescription #{prescription.id}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Submitted{" "}
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>

                      <a
                        href={prescription.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        View Prescription
                      </a>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${getStatusStyle(
                        prescription.status,
                      )}`}
                    >
                      {getStatusIcon(prescription.status)}

                      {prescription.status}
                    </div>
                  </div>

                  {prescription.status === "REJECTED" &&
                    prescription.rejectionReason && (
                      <div className="mt-4 rounded-lg bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">
                          Rejection Reason
                        </p>

                        <p className="mt-1 text-sm text-red-700">
                          {prescription.rejectionReason}
                        </p>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Prescriptions;
