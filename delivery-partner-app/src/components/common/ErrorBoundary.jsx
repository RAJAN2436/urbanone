import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[220px] rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-extrabold text-white">Map View Temporarily Unavailable</h4>
          <p className="text-xs text-zinc-400 max-w-xs">
            {this.state.error?.message || 'A display issue occurred while rendering the map overlay.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Map</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
