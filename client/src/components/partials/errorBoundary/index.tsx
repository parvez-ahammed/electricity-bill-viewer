import { Component, ErrorInfo, ReactNode } from "react";

import { ErrorCard } from "../errorCard";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // eslint-disable-next-line no-console
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center p-4">
                    <ErrorCard
                        title="Something went wrong"
                        description={
                            this.state.error?.message ||
                            "An unexpected error occurred. Please refresh the page."
                        }
                        showButtons
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
