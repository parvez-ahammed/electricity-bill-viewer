import { telegramApi } from "@/common/apis/telegram.api";
import { useState } from "react";
import { toast } from "sonner";

export const useTelegram = () => {
    const [isSendingTelegram, setIsSendingTelegram] = useState(false);

    const handleSendTelegram = async () => {
        setIsSendingTelegram(true);
        try {
            const result = await telegramApi.sendBalances(true); // Force fresh data

            if (result.success) {
                toast.success(
                    `Account balances sent to Telegram successfully! (${result.sentAccounts} accounts)`
                );
            } else {
                toast.error(result.error || result.message || 'Failed to send balances to Telegram');
            }
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            toast.error('Failed to send balances to Telegram');
        } finally {
            setTimeout(() => setIsSendingTelegram(false), 1000);
        }
    };

    return {
        isSendingTelegram,
        handleSendTelegram,
    };
};