export const formatDate = (dateString: string): string => {
    try {
        // Convert format like "2025-10-17-06.59.58" to readable format
        const parts = dateString.split("-");
        if (parts.length >= 3) {
            return `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
        return dateString;
    } catch {
        return dateString;
    }
};
