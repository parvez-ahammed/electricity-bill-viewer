import { notificationSettingsApi } from "@/common/apis/notificationSettings.api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const NotificationManagement = () => {
    const queryClient = useQueryClient();
    const [chatIdInput, setChatIdInput] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const { data: settings, isLoading } = useQuery({
        queryKey: ["notificationSettings"],
        queryFn: notificationSettingsApi.getTelegramSettings,
    });

    const updateMutation = useMutation({
        mutationFn: notificationSettingsApi.updateTelegramSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
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
            queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
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
            chatId: chatIdInput,
            isActive: settings?.isActive ?? true,
        });
    };

    const handleToggle = (checked: boolean) => {
        if (!settings?.chatId) return;
        updateMutation.mutate({
            chatId: settings.chatId,
            isActive: checked,
        });
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to remove Telegram notifications?")) {
            deleteMutation.mutate();
        }
    };

    const startEditing = () => {
        setChatIdInput(settings?.chatId || "");
        setIsEditing(true);
    };

    // Initialize input when settings load
    useEffect(() => {
        if (settings?.chatId && !isEditing) {
            setChatIdInput(settings.chatId);
        }
    }, [settings, isEditing]);

    const hasSettings = !!settings && !!settings.chatId;

    return (
        <Card className="border-none pt-2 pb-0 shadow-none sm:border sm:shadow-none mt-4">
            <CardHeader className="hidden px-0 py-2 sm:block sm:px-0 sm:py-3">
                <CardTitle className="text-base sm:text-lg">
                    Notification Management
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Configure Telegram alerts for all your accounts
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:pb-4">
                <div className="bg-card rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium leading-none">Telegram Notifications</h4>
                            <p className="text-xs text-muted-foreground">
                                Receive daily balance updates for all accounts on Telegram.
                            </p>
                        </div>
                        {hasSettings && (
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">Active</span>
                                <Switch
                                    checked={settings.isActive}
                                    onCheckedChange={handleToggle}
                                    disabled={updateMutation.isPending || isLoading}
                                />
                            </div>
                        )}
                    </div>
                    
                    <Separator />

                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : !hasSettings && !isEditing ? (
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
                                className="h-8 text-sm flex-1"
                            />
                            <Button
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={handleSave}
                                disabled={updateMutation.isPending || !chatIdInput.trim()}
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Save className="h-3 w-3" />
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => setIsEditing(false)}
                            >
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
                                {deleteMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3 w-3" />
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Status Indicator if not active but set */}
                    {hasSettings && !settings.isActive && (
                        <div className="text-xs text-amber-500 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-md">
                            <AlertCircle className="h-3 w-3" />
                            Notifications are currently paused
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
