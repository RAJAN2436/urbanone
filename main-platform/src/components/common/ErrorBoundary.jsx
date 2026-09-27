import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('urban_customer_subview');
      } catch (e) {
        // ignore
      }
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 shadow-xl p-6 sm:p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-zinc-950 font-['Outfit']">
              Unable to load this section
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              An unexpected display issue occurred. You can return to the home screen or reload to continue ordering smoothly.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleGoHome}
                className="btn-light-secondary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
              <button
                onClick={this.handleReset}
                className="btn-orange-primary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="text-left text-[11px] bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-red-700 mt-4 overflow-auto max-h-40">
                <summary className="cursor-pointer font-mono font-bold">Error Details</summary>
                <pre className="mt-2 font-mono whitespace-pre-wrap">{this.state.error?.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
