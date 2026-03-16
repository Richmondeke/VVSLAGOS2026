"use client";

import { useState } from "react";
import { apiClient, ApiError } from "@/lib/api-client";

type DocType = "nin" | "drivers_licence" | "passport" | "voters_card";
type Status = "idle" | "uploading" | "submitted" | "error";

const DOC_TYPES: { value: DocType; label: string }[] = [
    { value: "nin", label: "National Identification Number (NIN)" },
    { value: "drivers_licence", label: "Driver's Licence" },
    { value: "passport", label: "International Passport" },
    { value: "voters_card", label: "Voter's Card" },
];

export default function VerifyIdentityPage() {
    const [docType, setDocType] = useState<DocType | "">("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!docType || !file) return;

        setStatus("uploading");
        setError(null);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setProgress((p) => Math.min(p + 10, 90));
        }, 200);

        try {
            // In production, this would upload to R2/S3 first, then submit the URL
            await apiClient("/auth/kyc/submit", {
                method: "POST",
                body: {
                    documentType: docType,
                    documentUrl: `uploaded://${file.name}`, // Placeholder
                },
            });
            clearInterval(progressInterval);
            setProgress(100);
            setStatus("submitted");
        } catch (err) {
            clearInterval(progressInterval);
            setStatus("error");
            if (err instanceof ApiError) {
                if (err.message.includes("mismatch")) {
                    setError("Your document details don't match our records. Please double-check and try again with the correct document.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("Verification is taking longer than usual. We'll notify you when it's complete.");
            }
        }
    }

    if (status === "submitted") {
        return (
            <div className="mx-auto max-w-lg p-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                    ✓
                </div>
                <h1 className="mb-2 text-2xl font-bold text-vvs-primary">Document Submitted</h1>
                <p className="mb-6 text-gray-600">
                    We&#39;re reviewing your document. This usually takes a few minutes.
                    We&#39;ll notify you once your identity is verified.
                </p>
                <a
                    href="/discover"
                    className="inline-block rounded-lg bg-vvs-accent px-8 py-3 font-medium text-white transition-colors hover:bg-vvs-accent/90"
                >
                    Continue to Discover
                </a>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg p-4">
            <h1 className="mb-2 text-2xl font-bold text-vvs-primary">Verify Your Identity</h1>
            <p className="mb-6 text-sm text-gray-600">
                Identity verification is required to offer services on VVS. Your documents are
                encrypted and handled securely.
            </p>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Document Type
                    </label>
                    <div className="space-y-2">
                        {DOC_TYPES.map((dt) => (
                            <label
                                key={dt.value}
                                className={`flex cursor-pointer items-center rounded-lg border-2 p-3 transition-colors ${
                                    docType === dt.value
                                        ? "border-vvs-accent bg-vvs-accent/5"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="docType"
                                    value={dt.value}
                                    checked={docType === dt.value}
                                    onChange={(e) => setDocType(e.target.value as DocType)}
                                    className="mr-3"
                                />
                                {dt.label}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Upload Document
                    </label>
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="hidden"
                            id="doc-upload"
                        />
                        <label
                            htmlFor="doc-upload"
                            className="cursor-pointer text-sm text-gray-600"
                        >
                            {file ? (
                                <span className="font-medium text-vvs-accent">{file.name}</span>
                            ) : (
                                <>
                                    <span className="font-medium text-vvs-accent">Choose file</span>
                                    {" "}or drag and drop
                                    <br />
                                    <span className="text-xs text-gray-400">
                                        PNG, JPG, or PDF up to 10MB
                                    </span>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {status === "uploading" && (
                    <div>
                        <div className="mb-1 flex justify-between text-xs text-gray-500">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-vvs-accent transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!docType || !file || status === "uploading"}
                    className="w-full rounded-lg bg-vvs-accent px-4 py-3 font-medium text-white transition-colors hover:bg-vvs-accent/90 disabled:opacity-50"
                >
                    Submit for Verification
                </button>
            </form>
        </div>
    );
}
