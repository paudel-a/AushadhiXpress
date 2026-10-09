import { useEffect, useRef, useState } from "react";
import {
  FileUp,
  Clock3,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

type PrescriptionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface PrescriptionMedicine {
  id: number;
  name: string;
  price: string;
  image: string | null;
  stock: number;
}

interface Prescription {
  id: number;
  medicineId: number;
  medicine: PrescriptionMedicine;
  documentUrl: string;
  status: PrescriptionStatus;
  rejectionReason: string | null;
  createdAt: string;
}

interface MedicineDetails {
  id: number;
  name: string;
  price: string;
  stock: number;
  requiresPrescription: boolean;
  image?: string | null;
  imageUrl?: string | null;
  category: {
    id: number;
    name: string;
  };
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const TRACKED_KEY = "aushadhixpress_tracked_prescriptions";

function readTrackedPrescriptionIds(): number[] {
  try {
    const stored = localStorage.getItem(TRACKED_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (id): id is number => typeof id === "number" && Number.isInteger(id),
    );
  } catch {
    return [];
  }
}

function Prescriptions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const medicineIdParam = searchParams.get("medicineId");

  const medicineId =
    medicineIdParam && /^\d+$/.test(medicineIdParam)
      ? Number(medicineIdParam)
      : null;

  const { items, addToCart } = useCart();

  const [medicine, setMedicine] = useState<MedicineDetails | null>(null);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineError, setMedicineError] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!medicineId) {
      setMedicine(null);
      setMedicineError("");
      setMedicineLoading(false);
      return;
    }

    let cancelled = false;

    const loadMedicine = async () => {
      setMedicineLoading(true);
      setMedicineError("");
      setMedicine(null);

      try {
        const response = await fetch(
          `http://localhost:5000/api/medicines/${medicineId}`,
        );

        const data: MedicineDetails = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load medicine");
        }

        if (cancelled) return;

        if (!data.requiresPrescription) {
          setMedicineError("This medicine does not require a prescription.");
          return;
        }

        setMedicine(data);
      } catch (err) {
        if (!cancelled) {
          setMedicineError(
            err instanceof Error
              ? err.message
              : "Unable to load medicine details.",
          );
        }
      } finally {
        if (!cancelled) {
          setMedicineLoading(false);
        }
      }
    };

    void loadMedicine();

    return () => {
      cancelled = true;
    };
  }, [medicineId]);

  const fetchPrescriptions = async (showRefresh = false) => {
    if (!token) {
      setError("Please sign in to view your prescriptions.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/prescriptions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data: Prescription[] | { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(
          !Array.isArray(data) && data.message
            ? data.message
            : "Failed to fetch prescriptions",
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected prescription response from server");
      }

      setPrescriptions(data);

      // Only process approvals for prescriptions uploaded through this flow.
      // This avoids adding every older approved prescription to the cart.
      const trackedIds = readTrackedPrescriptionIds();
      const remainingTrackedIds = new Set(trackedIds);
      const cartMedicineIds = new Set(items.map((item) => item.id));

      for (const prescription of data) {
        if (
          prescription.status !== "APPROVED" ||
          !remainingTrackedIds.has(prescription.id) ||
          !prescription.medicine
        ) {
          continue;
        }

        const approvedMedicine = prescription.medicine;

        // Don't increment quantity if this medicine is already in the cart.
        if (
          approvedMedicine.stock > 0 &&
          !cartMedicineIds.has(approvedMedicine.id)
        ) {
          addToCart({
            id: approvedMedicine.id,
            name: approvedMedicine.name,
            price: String(approvedMedicine.price),
            imageUrl: approvedMedicine.image,
            stock: approvedMedicine.stock,
          });

          cartMedicineIds.add(approvedMedicine.id);
        }

        // Remove it from the tracking list so a refresh cannot add it again.
        remainingTrackedIds.delete(prescription.id);
      }

      localStorage.setItem(
        TRACKED_KEY,
        JSON.stringify([...remainingTrackedIds]),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch prescriptions",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchPrescriptions();
    // Initial load only. Manual refresh uses the current cart contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    setMessage("");
    setError("");

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
      setError("File size must be 5 MB or smaller.");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Please sign in before uploading a prescription.");
      return;
    }

    if (!medicineId || !medicine) {
      setError("Please select a prescription-required medicine first.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a prescription file.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("prescription", selectedFile);
      formData.append("medicineId", String(medicine.id));

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

      // Remember this submission so a later approval can add its medicine.
      const prescriptionId = data.prescription?.id;

      if (typeof prescriptionId === "number") {
        const trackedIds = readTrackedPrescriptionIds();

        if (!trackedIds.includes(prescriptionId)) {
          trackedIds.push(prescriptionId);
        }

        localStorage.setItem(TRACKED_KEY, JSON.stringify(trackedIds));
      }

      setMessage(
        `Prescription for ${medicine.name} uploaded successfully. You can track its status below.`,
      );

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
    if (status === "APPROVED") return <CheckCircle2 size={18} />;
    if (status === "REJECTED") return <XCircle size={18} />;

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
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            My Prescriptions
          </h1>

          <p className="mt-2 text-slate-600">
            Upload prescriptions for medicines that require them and track the
            review status.
          </p>
        </div>

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

          {!medicineId ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <p className="text-sm text-slate-600">
                First choose a medicine marked “Prescription required” on the
                Medicines page. Its prescription upload form will open here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/medicines")}
                className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Browse Medicines
              </button>
            </div>
          ) : medicineLoading ? (
            <div className="flex items-center gap-2 py-5 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Loading medicine...
            </div>
          ) : medicineError ? (
            <div>
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {medicineError}
              </p>

              <button
                type="button"
                onClick={() => navigate("/medicines")}
                className="mt-4 text-sm font-medium text-emerald-700 hover:underline"
              >
                Return to Medicines
              </button>
            </div>
          ) : medicine ? (
            <>
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Selected Medicine
                </p>

                <h3 className="mt-1 font-semibold text-slate-900">
                  {medicine.name}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Rs. {medicine.price}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Your uploaded prescription will be linked to this medicine.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="prescription-file"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Prescription File
                </label>

                <input
                  id="prescription-file"
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

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={
                      !selectedFile || submitting || medicine.stock === 0
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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

                  <button
                    type="button"
                    onClick={() => navigate("/medicines")}
                    className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Choose Another Medicine
                  </button>
                </div>

                {medicine.stock === 0 && (
                  <p className="mt-3 text-sm text-red-600">
                    This medicine is currently out of stock, so its prescription
                    cannot be submitted through this form.
                  </p>
                )}
              </form>
            </>
          ) : null}

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

        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Prescription History
            </h2>

            <button
              type="button"
              onClick={() => void fetchPrescriptions(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh Status
            </button>
          </div>

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
                        {prescription.medicine?.name ??
                          `Medicine #${prescription.medicineId}`}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
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

                  {prescription.status === "APPROVED" && (
                    <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                      Prescription approved. Refresh this page if the medicine
                      has not yet appeared in your cart.
                    </p>
                  )}

                  {prescription.status === "REJECTED" &&
                    prescription.rejectionReason && (
                      <div className="mt-4 rounded-lg bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">
                          Rejection Reason
                        </p>

                        <p className="mt-1 text-sm text-red-700">
                          {prescription.rejectionReason}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/prescriptions?medicineId=${prescription.medicineId}`,
                            )
                          }
                          className="mt-3 text-sm font-semibold text-red-700 underline hover:text-red-900"
                        >
                          Upload a New Prescription
                        </button>
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
