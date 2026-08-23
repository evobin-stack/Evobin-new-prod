import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f4f8',
          fontFamily: 'sans-serif',
          padding: '2rem',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '700px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            border: '2px solid #ff4444',
          }}>
            <h1 style={{ color: '#cc0000', marginBottom: '1rem', fontSize: '1.5rem' }}>
              ⚠️ Application Error
            </h1>
            <p style={{ color: '#333', marginBottom: '1rem' }}>
              Something crashed. Here is the error details:
            </p>
            <div style={{
              background: '#1e1e1e',
              color: '#ff6b6b',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              overflowX: 'auto',
              marginBottom: '1rem',
            }}>
              <strong>{this.state.error?.name}: {this.state.error?.message}</strong>
              <br /><br />
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#aaa' }}>
                {this.state.error?.stack}
              </pre>
            </div>
            {this.state.errorInfo && (
              <div style={{
                background: '#1e1e1e',
                color: '#ffb347',
                padding: '1rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                overflowX: 'auto',
                marginBottom: '1.5rem',
              }}>
                <strong>Component Stack:</strong>
                <pre style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap', color: '#aaa' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#0077CC',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              🔄 Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
