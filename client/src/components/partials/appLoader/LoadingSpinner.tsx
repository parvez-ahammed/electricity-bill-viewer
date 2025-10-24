import { useLoading } from "@/providers/LoadingProvider";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => {
    const { isLoading } = useLoading();
    if (!isLoading) return null;

    return (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
        </div>
    );
};
