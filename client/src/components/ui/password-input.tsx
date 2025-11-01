import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { Button } from "./button";

export interface PasswordInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);

        const togglePasswordVisibility = (e: React.MouseEvent) => {
            e.preventDefault();
            setShowPassword(!showPassword);
        };

        return (
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className={cn(
                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        "pr-10", // Add padding for the eye icon
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:ring-0 focus:ring-offset-0"
                    onClick={togglePasswordVisibility}
                    disabled={props.disabled}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    )}
                </Button>
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
