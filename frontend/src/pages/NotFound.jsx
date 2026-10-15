import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-4">404</p>
      <h1 className="font-serif text-5xl md:text-6xl text-[#141414] mb-6">Page Not Found</h1>
      <p className="text-[#6b6b6b] max-w-sm mb-10">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 text-sm tracking-widest uppercase border border-[#141414] text-[#141414] px-7 py-3 hover:bg-[#141414] hover:text-[#FAF9F7] transition-all duration-200"
      >
        <ArrowLeft size={14} /> Back to Home
      </Link>
    </main>
  );
}
