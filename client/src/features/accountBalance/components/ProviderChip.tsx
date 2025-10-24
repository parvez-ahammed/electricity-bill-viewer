import { Badge } from "@/components/ui/badge";

interface ProviderChipProps {
    provider: string;
}

const PROVIDER_STYLES: Record<string, string> = {
    DPDC: "border-transparent bg-blue-300 text-white hover:bg-blue-400",
    NESCO: "border-transparent bg-green-300 text-white hover:bg-green-400",
    DESCO: "border-transparent bg-red-300 text-white hover:bg-red-400",
};

export const ProviderChip = ({ provider }: ProviderChipProps) => {
    const providerUpper = provider?.toUpperCase() || "UNKNOWN";
    const style =
        PROVIDER_STYLES[providerUpper] ||
        "border-transparent bg-slate-500 text-white hover:bg-slate-600";

    return (
        <Badge
            className={`${style} max-w-full truncate rounded-full px-3 py-1 text-xs font-medium shadow-sm transition-colors`}
        >
            {providerUpper}
        </Badge>
    );
};
