import { Account } from "@/common/apis/accounts.api";
import { notificationSettingsApi } from "@/common/apis/notificationSettings.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationSettingsItemProps {
    account: Account;
}

export const NotificationSettingsItem = ({ account }: NotificationSettingsItemProps) => {
    const queryClient = useQueryClient();
    const [chatIdInput, setChatIdInput] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const { data: settings, isLoading } = useQuery({
        queryKey: ["notificationSettings", account.id],
        queryFn: () => notificationSettingsApi.getTelegramSettings(account.id),
    });

    const updateMutation = useMutation({
        mutationFn: notificationSettingsApi.updateTelegramSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notificationSettings", account.id] });
            toast.success("Notification settings updated");
            setIsEditing(false);
        },
        onError: () => {
            toast.error("Failed to update settings");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: notificationSettingsApi.deleteTelegramSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notificationSettings", account.id] });
            toast.success("Notification settings removed");
            setChatIdInput("");
        },
        onError: () => {
            toast.error("Failed to remove settings");
        },
    });

    const handleSave = () => {
        if (!chatIdInput.trim()) return;
        updateMutation.mutate({
            accountId: account.id,
            chatId: chatIdInput,
            isActive: settings?.isActive ?? true,
        });
    };

    const handleToggle = (checked: boolean) => {
        if (!settings?.chatId) return;
        updateMutation.mutate({
            accountId: account.id,
            chatId: settings.chatId,
            isActive: checked,
        });
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to remove Telegram notifications for this account?")) {
            deleteMutation.mutate(account.id);
        }
    };

    // Initialize input when editing starts or settings load
    const startEditing = () => {
        setChatIdInput(settings?.chatId || "");
        setIsEditing(true);
    };

    if (isLoading) {
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    const hasSettings = !!settings && !!settings.chatId;

    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex flex-col gap-1 w-full max-w-md">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                        {account.provider} - {account.credentials.username}
                    </span>
                    {hasSettings && (
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Active</span>
                            <Switch
                                checked={settings.isActive}
                                onCheckedChange={handleToggle}
                                disabled={updateMutation.isPending}
                            />
                        </div>
                    )}
                </div>

                {!hasSettings && !isEditing ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-fit text-xs h-8"
                        onClick={startEditing}
                    >
                        Configure Telegram
                    </Button>
                ) : isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Enter Telegram Chat ID"
                            value={chatIdInput}
                            onChange={(e) => setChatIdInput(e.target.value)}
                            className="h-8 text-sm"
                        />
                        <Button
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={handleSave}
                            disabled={updateMutation.isPending || !chatIdInput.trim()}
                        >
                            {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setIsEditing(false)}
                        >
                            <span className="sr-only">Cancel</span>
                            <span className="text-xs">✕</span>
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 p-2 rounded-md">
                         <span className="flex-1 font-mono text-xs">Chat ID: {settings?.chatId}</span>
                         <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={startEditing}
                         >
                            <span className="text-xs">✏️</span>
                         </Button>
                         <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:text-destructive hover:bg-destructive/10"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                         >
                            {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                         </Button>
                    </div>
                )}
            </div>
            
            {/* Status Indicator if not active but set */}
            {hasSettings && !settings.isActive && (
                <div className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Paused
                </div>
            )}
        </div>
    );
};
