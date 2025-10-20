import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    className?: string;
}

export const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
    return (
        <div
            className={cn(
                "text-primary flex h-screen !max-h-screen w-screen flex-col items-center justify-center text-center",
                className
            )}
        >
            <Loader2 className="animate-spin" size={500} />
        </div>
    );
};
