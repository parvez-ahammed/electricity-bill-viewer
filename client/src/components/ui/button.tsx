import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 border-[3px] border-[var(--color-neo-border)] text-black shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--color-neo-primary)] text-white shadow-neo",
                destructive:
                    "bg-[var(--color-neo-destructive)] text-white shadow-neo",
                outline:
                    "bg-white text-black hover:bg-[var(--color-neo-muted)] shadow-neo",
                secondary:
                    "bg-[var(--color-neo-accent)] text-black shadow-neo",
                ghost: "border-transparent shadow-none hover:border-[var(--color-neo-border)] hover:bg-[var(--color-neo-bg)] hover:translate-x-0 hover:translate-y-0 hover:shadow-neo",
                link: "border-transparent shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0 text-black underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-3 md:px-5 gap-2",
                sm: "h-8 px-2 md:px-3 gap-1.5 text-xs",
                xs: "h-7 px-1.5 md:px-2 gap-1 text-[10px]",
                lg: "h-12 px-6 md:px-8 gap-2.5 text-base",
                icon: "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
