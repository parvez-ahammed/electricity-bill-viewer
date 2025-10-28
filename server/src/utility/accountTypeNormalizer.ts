/**
 * Normalize account type to either "Prepaid" or "Postpaid"
 * @param accountType - The raw account type from the provider
 * @returns Normalized account type
 */
export const normalizeAccountType = (accountType: string): string => {
    if (!accountType) {
        return 'Unknown';
    }

    const normalized = accountType.toLowerCase().trim();

    // Check if it contains "prepaid" or variations
    if (
        normalized.includes('prepaid') ||
        normalized.includes('pre-paid') ||
        normalized.includes('pre paid')
    ) {
        return 'Prepaid';
    }

    // Check if it contains "postpaid" or variations
    if (
        normalized.includes('postpaid') ||
        normalized.includes('post-paid') ||
        normalized.includes('post paid')
    ) {
        return 'Postpaid';
    }

    // If unclear, return the original value capitalized
    return accountType.charAt(0).toUpperCase() + accountType.slice(1);
};
