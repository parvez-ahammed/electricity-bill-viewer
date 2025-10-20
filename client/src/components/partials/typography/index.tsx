import { cn } from "@/lib/utils";
import type React from "react";
import { JSX } from "react";

import { LinkProps } from "./interfaces/linkProps.interface";
import { TextProps } from "./interfaces/textProps.interface";

const Typography = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("max-w-4xl space-y-6", className)}>{children}</div>
    );
};

const Title = ({
    children,
    level = 1,
    className,
    ellipsis,
}: {
    children: React.ReactNode;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    ellipsis?: boolean | { rows?: number };
}) => {
    const Component = `h${level}` as keyof JSX.IntrinsicElements;
    const sizeClasses = {
        1: "text-4xl font-bold tracking-tight",
        2: "text-3xl font-semibold tracking-tight",
        3: "text-2xl font-semibold tracking-tight",
        4: "text-xl font-semibold tracking-tight",
        5: "text-lg font-semibold tracking-tight",
        6: "text-base font-semibold tracking-tight",
    }[level];

    const ellipsisClasses =
        typeof ellipsis === "object" && ellipsis?.rows
            ? `line-clamp-${ellipsis.rows}`
            : ellipsis
              ? "truncate"
              : "";

    return (
        <Component
            className={cn(
                sizeClasses,
                "scroll-m-20",
                ellipsisClasses,
                "text-black",
                className
            )}
        >
            {children}
        </Component>
    );
};

const Paragraph = ({
    children,
    className,
    ellipsisRows,
}: {
    children: React.ReactNode;
    className?: string;
    ellipsisRows?: number;
}) => {
    const ellipsisClasses = ellipsisRows ? `line-clamp-${ellipsisRows}` : "";

    return (
        <p
            className={cn(
                "leading-7 [&:not(:first-child)]:mt-6",
                ellipsisClasses,
                className
            )}
        >
            {children}
        </p>
    );
};

const Text = ({
    children,
    type,
    strong,
    code,
    keyboard,
    mark,
    underline,
    delete: deleteProp,
    italic,
    disabled,
    className,
    ellipsis,
}: TextProps) => {
    const typeClasses = {
        secondary: "text-muted-foreground",
        success: "text-green-600 dark:text-green-500",
        warning: "text-yellow-600 dark:text-yellow-500",
        danger: "text-red-600 dark:text-red-500",
    };

    const ellipsisClasses =
        typeof ellipsis === "object" && ellipsis?.rows
            ? `line-clamp-${ellipsis.rows}`
            : ellipsis
              ? "truncate"
              : "";

    if (code) {
        return (
            <code
                className={cn(
                    "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm",
                    ellipsisClasses,
                    className
                )}
            >
                {children}
            </code>
        );
    }

    if (keyboard) {
        return (
            <kbd
                className={cn(
                    "bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none",
                    ellipsisClasses,
                    className
                )}
            >
                {children}
            </kbd>
        );
    }

    if (mark) {
        return (
            <mark
                className={cn(
                    "bg-yellow-200 dark:bg-yellow-800",
                    ellipsisClasses,
                    className
                )}
            >
                {children}
            </mark>
        );
    }

    const Component = deleteProp ? "del" : "span";

    return (
        <Component
            className={cn(
                type && typeClasses[type],
                strong && "font-semibold",
                underline && "underline",
                italic && "italic",
                disabled && "cursor-not-allowed opacity-50",
                ellipsisClasses,
                className
            )}
        >
            {children}
        </Component>
    );
};

const Link = ({ href, children, className, target, ellipsis }: LinkProps) => {
    const ellipsisClasses =
        typeof ellipsis === "object" && ellipsis?.rows
            ? `line-clamp-${ellipsis.rows}`
            : ellipsis
              ? "truncate"
              : "";

    return (
        <a
            href={href}
            target={target}
            className={cn(
                "text-primary font-medium underline underline-offset-4",
                ellipsisClasses,
                className
            )}
        >
            {children}
        </a>
    );
};

const Blockquote = ({
    children,
    className,
    ellipsis,
}: {
    children: React.ReactNode;
    className?: string;
    ellipsis?: boolean | { rows?: number };
}) => {
    const ellipsisClasses =
        typeof ellipsis === "object" && ellipsis?.rows
            ? `line-clamp-${ellipsis.rows}`
            : ellipsis
              ? "truncate"
              : "";

    return (
        <blockquote
            className={cn(
                "border-primary mt-6 border-l-2 pl-6 italic",
                ellipsisClasses,
                className
            )}
        >
            {children}
        </blockquote>
    );
};

const Pre = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <pre
            className={cn(
                "bg-muted mt-6 overflow-x-auto rounded-lg p-4",
                className
            )}
        >
            {children}
        </pre>
    );
};

export { Typography, Title, Paragraph, Text, Link, Blockquote, Pre };
