type TextType = "secondary" | "success" | "warning" | "danger";
export interface TextProps {
    children: React.ReactNode;
    className?: string;
    type?: TextType;
    strong?: boolean;
    code?: boolean;
    keyboard?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    italic?: boolean;
    disabled?: boolean;
    ellipsis?: boolean | { rows?: number };
}
