import { useEffect, useRef, useState } from "react";
import { FileUp, Clock3, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type PrescriptionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Prescription {
  id: number;
  documentUrl: string;
  status: PrescriptionStatus;
  rejectionReason: string | null;
  createdAt: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function Prescriptions() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("token");

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    setMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and PDF files are allowed.");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5 MB.");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a prescription file.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("prescription", selectedFile); // must match upload.single("prescription")

      // Don't set Content-Type: the browser adds the multipart boundary itself.
      const response = await fetch("http://localhost:5000/api/prescriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload prescription");
      }

      setMessage("Prescription uploaded successfully.");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchPrescriptions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload prescription",
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
            Upload your prescription and track its approval status.
          </p>
        </div>

        {/* Upload Prescription */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <FileUp size={24} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Upload Prescription
              </h2>

              <p className="text-sm text-slate-500">
                JPG, PNG or PDF, maximum 5 MB.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Prescription File
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            {selectedFile && (
              <p className="mt-3 text-sm text-slate-600">
                Selected:{" "}
                <span className="font-medium text-slate-900">
                  {selectedFile.name}
                </span>
              </p>
            )}

            <button
              type="submit"
              disabled={!selectedFile || submitting}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileUp size={18} />
                  Upload Prescription
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
                Your uploaded prescriptions will appear here.
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
