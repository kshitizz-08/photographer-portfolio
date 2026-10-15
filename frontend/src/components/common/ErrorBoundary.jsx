import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F7] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#141414] border border-red-900/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950/60 border border-red-700/50 flex items-center justify-center text-red-400">
              <AlertCircle size={24} />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#FAF9F7]">Something went wrong</h2>
            <p className="text-xs text-[#999999] leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred while rendering this page."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C4A882] hover:bg-[#a8895f] text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider rounded-md transition-colors"
            >
              <RotateCcw size={14} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
