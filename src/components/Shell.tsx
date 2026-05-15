import type { ReactNode } from "react";

export function Blobs() {
  return (
    <>
      {/* primary large orbs */}
      <div className="gradient-blob orb-drift top-[-18%] left-[-10%] w-[62%] h-[62%] bg-teal-200" />
      <div className="gradient-blob orb-drift-reverse bottom-[-14%] right-[-8%] w-[55%] h-[55%] bg-blue-200" />
      {/* accent orbs */}
      <div className="gradient-blob animate-float-slow top-[35%] right-[5%] w-[28%] h-[28%] bg-cyan-100 opacity-50" />
      <div className="gradient-blob animate-float top-[60%] left-[8%] w-[22%] h-[22%] bg-violet-100 opacity-40" />
      {/* subtle mesh dots */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#0d9488" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
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
    <div className={`flex items-center gap-2.5 ${compact ? "" : ""}`}>
      <div
        className="relative flex-shrink-0"
        style={{ width: compact ? 32 : 38, height: compact ? 32 : 38 }}
      >
        {/* spinning gradient ring */}
        <div
          className="absolute inset-0 rounded-xl animate-spin"
          style={{
            background: "conic-gradient(from 0deg, #0d9488, #22d3ee, #a78bfa, #0d9488)",
            animationDuration: "4s",
          }}
        />
        {/* white inner */}
        <div className="absolute inset-[2px] rounded-[10px] bg-white shadow-sm flex items-center justify-center">
          <svg
            width={compact ? 14 : 17}
            height={compact ? 14 : 17}
            viewBox="0 0 24 24"
            fill="none"
            className="text-teal-600"
          >
            <path
              d="M12 3v18M5 8h14M5 16h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <span
        className={`font-black tracking-[0.22em] text-teal-900 ${compact ? "text-sm" : "text-base"}`}
        style={{ letterSpacing: "0.22em" }}
      >
        NEOHOMEO
      </span>
    </div>
  );
}
