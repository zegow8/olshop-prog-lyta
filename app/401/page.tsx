export default function UnauthorizedPage() {
return (
<div className="min-h-screen flex items-center justify-center bg-white px-4">
<div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-8 text-center">
<h1 className="text-4xl font-bold text-[#800000] mb-4">401</h1>
<p className="text-lg font-semibold text-gray-800 mb-2">
Unauthorized
</p>
<p className="text-gray-600 mb-8">
Please login.
</p>


<a
href="/login"
className="inline-block w-full rounded-xl bg-[#800000] text-white py-3 font-semibold hover:opacity-90 transition"
>
Login
</a>
</div>
</div>
);
}