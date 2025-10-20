import { ErrorCard, ErrorCardProps } from "@/components/partials/errorCard";

export const ErrorPage = ({
    image,
    statusCode,
    title,
    description,
    showButtons = true,
    className,
}: ErrorCardProps) => {
    return (
        <ErrorCard
            image={image}
            statusCode={statusCode}
            title={title}
            description={description}
            showButtons={showButtons}
            className={className + " min-h-screen"}
        />
    );
};
