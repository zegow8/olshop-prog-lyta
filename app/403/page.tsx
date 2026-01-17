"use client";

import { useSearchParams } from "next/navigation";

export default function ForbiddenPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role"); // "admin" | "user"

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-8 text-center">
        <h1 className="text-4xl font-bold text-[#800000] mb-4">403</h1>

        <p className="text-lg font-semibold text-gray-800 mb-2">
          Forbidden
        </p>

        <p className="text-gray-600 mb-8">
          {role === "user" ? "User only." : "Admin only."}
        </p>

        <button
          onClick={() => window.history.back()}
          className="w-full rounded-xl border-2 border-[#800000] text-[#800000] py-3 font-semibold hover:bg-[#800000] hover:text-white transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}
