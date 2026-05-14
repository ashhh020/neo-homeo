import type { ReactNode } from "react";

export function Blobs() {
  return (
    <>
      <div className="gradient-blob top-[-18%] left-[-10%] w-[60%] h-[60%] bg-blue-100 animate-pulse" />
      <div className="gradient-blob bottom-[-12%] right-[-8%] w-[50%] h-[55%] bg-teal-100" />
    </>
  );
}

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative min-h-screen bg-[#F2F4F7] text-teal-950 overflow-x-hidden ${className}`}>
      <Blobs />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function NeoLogo({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "text-sm" : ""}`}>
      <div className="w-9 h-9 bg-white rounded-2xl shadow-lg border border-teal-100 flex items-center justify-center rotate-[-6deg]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-teal-600">
          <path
            d="M12 3v18M5 8h14M5 16h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="font-bold tracking-[0.2em] text-teal-900">NEOHOMEO</span>
    </div>
  );
}
