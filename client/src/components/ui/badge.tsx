import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-none border-[2px] border-[var(--color-neo-border)] px-3 py-1 text-xs font-bold uppercase tracking-wide w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-0 transition-all overflow-hidden shadow-neo-sm hover:-translate-y-[1px] hover:shadow-neo",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--color-neo-primary)] text-white [a&]:hover:bg-[var(--color-neo-primary)]",
                secondary:
                    "bg-[var(--color-neo-accent)] text-black [a&]:hover:bg-[var(--color-neo-accent)]",
                destructive:
                    "bg-[var(--color-neo-destructive)] text-white [a&]:hover:bg-[var(--color-neo-destructive)]",
                outline:
                    "bg-white text-black [a&]:hover:bg-[var(--color-neo-muted)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
