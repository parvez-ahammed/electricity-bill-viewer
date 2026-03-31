
interface ProviderChipProps {
    provider: string;
}

const getProviderStyles = (provider: string) => {
    switch (provider.toUpperCase()) {
        case "DPDC":
            return "bg-[var(--color-neo-primary)] text-white"; // Pink/Magenta
        case "NESCO":
            return "bg-[var(--color-neo-accent)] text-black"; // Yellow/Gold
        case "DESCO":
            return "bg-[var(--color-neo-accent-2)] text-black"; // Sky Blue
        default:
            return "bg-black text-white";
    }
};

export const ProviderChip = ({ provider }: ProviderChipProps) => {
    const providerUpper = provider?.toUpperCase() || "UNKNOWN";

    return (
        <span
            className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-widest neo-border-2 ${getProviderStyles(providerUpper)}`}
        >
            {providerUpper}
        </span>
    );
};
