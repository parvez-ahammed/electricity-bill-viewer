/**
 * Shared date formatting utilities for electricity providers
 */

const MONTH_MAP_FULL: Record<string, string> = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    october: '10',
    november: '11',
    december: '12',
};

const MONTH_MAP_SHORT: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    oct: '10',
    nov: '11',
    dec: '12',
};

/**
 * Convert month name (full or short) to month number
 */
export const monthToNumber = (month: string): string => {
    const lowerMonth = month.toLowerCase();
    return (
        MONTH_MAP_FULL[lowerMonth] ||
        MONTH_MAP_SHORT[lowerMonth] ||
        (new Date(`${month} 1, 2000`).getMonth() + 1)
            .toString()
            .padStart(2, '0')
    );
};

/**
 * Pad day/month with leading zero if needed
 */
export const padDateComponent = (value: string | number): string => {
    return value.toString().padStart(2, '0');
};

/**
 * Format NESCO date string to standard YYYY-MM-DD format
 * Input: "24 October 2025 12:34:56 PM" or "24 Oct 2025"
 * Output: "2025-10-24"
 */
export const formatNESCODateToStandard = (dateString: string): string => {
    try {
        const cleanDate = dateString.trim();
        const datePattern =
            /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM))?/i;
        const match = cleanDate.match(datePattern);

        if (match) {
            const day = match[1];
            const month = match[2];
            const year = match[3];

            const monthNum = monthToNumber(month);
            const paddedMonth =
                typeof monthNum === 'string'
                    ? monthNum
                    : padDateComponent(monthNum);
            const paddedDay = padDateComponent(day);

            return `${year}-${paddedMonth}-${paddedDay}`;
        }

        return cleanDate;
    } catch {
        return dateString;
    }
};

/**
 * Format NESCO payment date to standard YYYY-MM-DD format
 * Input: "24-OCT-2025 12:34 PM"
 * Output: "2025-10-24"
 */
export const formatNESCOPaymentDateToStandard = (
    dateString: string
): string => {
    try {
        const cleanDate = dateString.trim();
        const datePattern =
            /(\d{1,2})-([A-Z]{3})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i;
        const match = cleanDate.match(datePattern);

        if (match) {
            const day = match[1];
            const month = match[2];
            const year = match[3];

            const monthNum = monthToNumber(month);
            const paddedDay = padDateComponent(day);

            return `${year}-${monthNum}-${paddedDay}`;
        }

        return cleanDate;
    } catch {
        return dateString;
    }
};

/**
 * Format DPDC date string to standard YYYY-MM-DD format
 * Input: "2025-10-24 12:34:56" or "2025-10-24"
 * Output: "2025-10-24"
 */
export const formatDPDCDateToStandard = (dateString: string): string => {
    try {
        if (!dateString) return '';

        const datePattern = /^(\d{4})-(\d{2})-(\d{2})/;
        const match = dateString.match(datePattern);

        if (match) {
            const year = match[1];
            const month = match[2];
            const day = match[3];
            return `${year}-${month}-${day}`;
        }

        return dateString;
    } catch {
        return dateString;
    }
};
