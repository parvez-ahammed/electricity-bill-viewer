import { cn } from "@/lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

function Switch({
    className,
    ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                "peer data-[state=checked]:bg-[var(--color-neo-secondary)] data-[state=unchecked]:bg-black focus-visible:border-black focus-visible:ring-offset-2 inline-flex h-7 w-12 shrink-0 items-center rounded-sm border-[3px] border-black shadow-neo-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    "bg-white pointer-events-none block h-[18px] w-[18px] rounded-none border-[2px] border-black shadow-none ring-0 transition-transform data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
