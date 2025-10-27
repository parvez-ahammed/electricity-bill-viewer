export const formatDate = (dateString: string): string => {
    try {
        // Convert format like "2025-10-17-06.59.58" to "17 October"
        const parts = dateString.split("-");
        if (parts.length >= 3) {
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);

            const monthNames = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];

            if (month >= 1 && month <= 12) {
                return `${day} ${monthNames[month - 1]}`;
            }
        }
        return dateString;
    } catch {
        return dateString;
    }
};
