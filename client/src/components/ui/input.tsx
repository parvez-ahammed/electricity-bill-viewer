import { cn } from "@/lib/utils";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "border-[var(--color-neo-border)] file:text-black placeholder:text-gray-500 flex h-12 w-full min-w-0 rounded-none border-[3px] bg-white px-4 py-2 text-base shadow-neo transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-bold text-black",
                "focus-visible:border-[var(--color-neo-border)] focus-visible:ring-0 focus-visible:translate-x-[4px] focus-visible:translate-y-[4px] focus-visible:shadow-none hover:shadow-neo-hover",
                "aria-invalid:border-[var(--color-neo-destructive)] aria-invalid:bg-red-50",
                className
            )}
            {...props}
        />
    );
}

export { Input };
