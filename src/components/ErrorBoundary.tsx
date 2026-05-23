import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: unknown): State {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 bg-[#f2f4f7]">
            <div className="text-5xl">⚠️</div>
            <div className="text-center space-y-2">
              <p className="text-xl font-bold text-teal-950">Something went wrong</p>
              <p className="text-sm text-teal-900/60 max-w-sm">
                {this.state.message || "An unexpected error occurred. Please reload and try again."}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-7 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full font-bold shadow-lg hover:shadow-teal-500/30 transition"
            >
              Reload page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
