import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1E1917] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#F2ECE1] border border-[#E5DDD0] rounded-lg p-7 text-center">
            <h1 className="font-display text-2xl font-semibold text-[#58111E]">
              Saubhagya Emporium
            </h1>
            <p className="mt-3 text-sm text-[#665B56] leading-relaxed">
              Something went wrong while syncing store data. Please refresh the page to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 px-5 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] rounded-md transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
