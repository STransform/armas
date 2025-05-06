import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container mt-5">
                    <h2>Something went wrong.</h2>
                    <p>An error occurred while rendering this component. Please try refreshing the page or contact support if the issue persists.</p>
                    {this.state.error && (
                        <details style={{ whiteSpace: 'pre-wrap' }}>
                            <summary>Error Details</summary>
                            <p>{this.state.error.toString()}</p>
                            <p>{this.state.errorInfo?.componentStack}</p>
                        </details>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;