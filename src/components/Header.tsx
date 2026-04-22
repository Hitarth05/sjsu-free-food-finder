"use client";
 
export default function Header() {
  return (
    <header className="border-b border-[var(--card-border)] bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--gold)] flex items-center justify-center text-2xl shadow-sm">
            {"🍕"}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--dark)] tracking-tight leading-none">
              SJSU Free Food Finder
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5 font-medium">
              Never miss free food on campus
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--green-light)] border border-green-200">
          <span className="w-2 h-2 rounded-full bg-[var(--green)] pulse-dot" />
          <span className="font-mono text-xs font-bold text-[var(--green-dark)] tracking-wide">
            LIVE
          </span>
        </div>
      </div>
    </header>
  );
}
 