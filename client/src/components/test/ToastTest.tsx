import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const ToastTest = () => {
    const showMultipleToasts = () => {
        toast.success("Account created successfully");
        setTimeout(() => toast.warning("Some accounts failed to load"), 100);
        setTimeout(() => toast.error("Failed to connect to server"), 200);
        setTimeout(() => toast.info("Data refreshed from cache"), 300);
        setTimeout(() => toast.success("Settings saved"), 400);
    };

    return (
        <div className="p-4">
            <Button onClick={showMultipleToasts}>
                Test Multiple Toasts
            </Button>
        </div>
    );
};