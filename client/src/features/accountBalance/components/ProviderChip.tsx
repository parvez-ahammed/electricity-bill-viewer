
interface ProviderChipProps {
    provider: string;
}

const getProviderBadgeColor = (provider: string) => {
    switch (provider.toUpperCase()) {
        case "DPDC":
            return "bg-blue-100 text-blue-800";
        case "NESCO":
            return "bg-green-100 text-green-800";
        case "DESCO":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export const ProviderChip = ({ provider }: ProviderChipProps) => {
    const providerUpper = provider?.toUpperCase() || "UNKNOWN";

    return (
        <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getProviderBadgeColor(providerUpper)}`}
        >
            {providerUpper}
        </span>
    );
};
