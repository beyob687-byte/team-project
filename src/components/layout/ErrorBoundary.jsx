import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // You can also log the error to an external service here
    // console.error('Captured error in ErrorBoundary', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, info: null });
    // Try a hard reload to recover app state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-deep p-6">
          <div className="max-w-2xl w-full bg-surface border border-border-glow rounded-card p-6">
            <h2 className="text-2xl font-display font-bold mb-2">
              Something went wrong
            </h2>
            <p className="text-text-2 mb-4">
              An unexpected error occurred while rendering the page.
            </p>
            <details className="text-xs text-text-2 mb-4 whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
              {this.state.info && "\n" + (this.state.info.componentStack || "")}
            </details>
            <div className="flex gap-2">
              <button onClick={this.handleReload} className="btn-primary">
                Reload
              </button>
              <button
                onClick={() =>
                  this.setState({ hasError: false, error: null, info: null })
                }
                className="btn-outline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
