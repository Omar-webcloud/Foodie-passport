import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">404</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">This page was not found</h1>
        <p className="mt-3 text-slate-600">The district you are looking for is not on the map yet.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
