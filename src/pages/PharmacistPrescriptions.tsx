import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";

interface Patient {
  id: number;
  name: string;
  email: string;
}

interface Prescription {
  id: number;
  documentUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
  user: Patient;
}

function PharmacistPrescriptions() {
  const { user } = useAuth();
  const isPharmacist = user?.role === "PHARMACIST";
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [rejectingPrescription, setRejectingPrescription] =
    useState<Prescription | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        "http://localhost:5000/api/prescriptions/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load prescriptions.");
      }

      setPrescriptions(data);
    } catch (error) {
      console.error("Failed to load prescriptions:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load prescriptions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const handleApprove = async (prescriptionId: number) => {
    try {
      setActionLoading(prescriptionId);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `http://localhost:5000/api/prescriptions/${prescriptionId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to approve prescription.");
      }

      setPrescriptions((prev) =>
        prev.filter((prescription) => prescription.id !== prescriptionId),
      );

      setSuccess("Prescription approved successfully.");
    } catch (error) {
      console.error("Approve prescription error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to approve prescription.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingPrescription) return;

    if (!rejectionReason.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }

    try {
      setActionLoading(rejectingPrescription.id);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `http://localhost:5000/api/prescriptions/${rejectingPrescription.id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to reject prescription.");
      }

      setPrescriptions((prev) =>
        prev.filter(
          (prescription) => prescription.id !== rejectingPrescription.id,
        ),
      );

      setRejectingPrescription(null);
      setRejectionReason("");

      setSuccess("Prescription rejected successfully.");
    } catch (error) {
      console.error("Reject prescription error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to reject prescription.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={36} className="animate-spin text-emerald-600" />

        <p className="mt-4 text-sm text-slate-500">Loading prescriptions...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Prescription Requests
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review and manage customer prescription requests.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPrescriptions}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Empty state */}
        {prescriptions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <CheckCircle2 size={44} className="mx-auto text-emerald-500" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No pending prescriptions
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              All prescription requests have been reviewed.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {prescriptions.map((prescription) => {
              const isUpdating = actionLoading === prescription.id;

              return (
                <div
                  key={prescription.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                        <FileText size={22} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-900">
                          Prescription #{prescription.id}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Submitted{" "}
                          {new Date(
                            prescription.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                      <Clock3 size={14} />
                      Pending
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="mt-6 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Customer
                    </p>

                    <p className="mt-1 font-medium text-slate-900">
                      {prescription.user.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {prescription.user.email}
                    </p>
                  </div>

                  {/* Document */}
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-slate-700">
                      Prescription Document
                    </p>

                    <a
                      href={prescription.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <FileText size={17} />
                      View Prescription
                    </a>
                  </div>

                  {/* Actions (pharmacist only) */}
                  {isPharmacist && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleApprove(prescription.id)}
                        disabled={isUpdating}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={17} />
                        )}
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setRejectingPrescription(prescription);
                          setRejectionReason("");
                        }}
                        disabled={isUpdating}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle size={17} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isPharmacist && rejectingPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Reject Prescription
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Prescription #{rejectingPrescription.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRejectingPrescription(null);
                  setRejectionReason("");
                }}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Rejection Reason
              </label>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Explain why this prescription is being rejected..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setRejectingPrescription(null);
                  setRejectionReason("");
                }}
                disabled={actionLoading !== null}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading !== null && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Reject Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default PharmacistPrescriptions;
