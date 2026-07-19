import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl m-4">
          <h2 className="text-red-800 font-bold mb-2">Đã xảy ra lỗi hiển thị (Render Error)</h2>
          <p className="text-red-600 text-sm">{this.state.error?.message}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 font-medium text-sm transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
