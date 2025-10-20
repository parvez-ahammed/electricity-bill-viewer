export interface LinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    target?: string;
    ellipsis?: boolean | { rows?: number };
}
