import { notificationSettingsApi } from "@/common/apis/notificationSettings.api";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Edit2, Loader2, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const notificationSchema = z.object({
    chatId: z.string().min(1, "Chat ID is required"),
});

type NotificationForm = z.infer<typeof notificationSchema>;

export const NotificationManagement = () => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data: settings, isLoading } = useQuery({
        queryKey: ["notificationSettings"],
        queryFn: notificationSettingsApi.getTelegramSettings,
    });

    const { register, handleSubmit, reset } = useForm<NotificationForm>({
        resolver: zodResolver(notificationSchema),
        values: {
            chatId: settings?.chatId || ""
        }
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
            reset({ chatId: "" });
        },
        onError: () => {
            toast.error("Failed to remove settings");
        },
    });

    const onSubmit = (data: NotificationForm) => {
        const trimmedChatId = data.chatId.trim();
        if (!trimmedChatId) return;
        updateMutation.mutate({
            chatId: trimmedChatId,
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
        deleteMutation.mutate();
        setShowDeleteDialog(false);
    };

    const startEditing = () => {
        setIsEditing(true);
    };

    const hasSettings = !!settings && !!settings.chatId;

    return (
        <>
            <Card className="border-none bg-transparent pt-2 pb-0 shadow-none mt-0">
                <CardHeader className="hidden px-0 py-2 sm:block sm:px-0 sm:py-3">
                    <CardTitle className="text-lg sm:text-2xl font-black uppercase tracking-tighter">
                        Notification Management
                    </CardTitle>
                    <CardDescription className="text-sm font-bold text-black/60">
                        Configure Telegram alerts for all your accounts
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:pb-4 text-black">
                    <div className="bg-transparent space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none">Telegram Notifications</h4>
                                <p className="text-xs text-muted-foreground">
                                    Receive daily balance updates for all accounts on Telegram.
                                </p>
                            </div>
                            {hasSettings && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black">Active</span>
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
                                variant="default"
                                size="sm"
                                className="w-fit text-[10px] uppercase font-black tracking-widest h-8"
                                onClick={startEditing}
                            >
                                Configure Telegram
                            </Button>
                        ) : isEditing ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
                                <Input
                                    placeholder="Enter Telegram Chat ID"
                                    {...register("chatId")}
                                    className="h-8 text-sm flex-1"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Save className="h-3 w-3" />
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                        reset();
                                        setIsEditing(false);
                                    }}
                                >
                                    <span className="text-xs">✕</span>
                                </Button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-black bg-[var(--color-neo-accent-2)]/10 p-3 neo-border border-[2px]">
                                <span className="flex-1 font-mono text-xs font-bold uppercase tracking-wider">
                                    CHAT ID: {settings?.chatId}
                                </span>
                                <div className="flex gap-1">
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        className="h-8 w-8 text-blue-600 hover:bg-blue-600 hover:text-white"
                                        onClick={startEditing}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-600 hover:bg-red-600 hover:text-white"
                                        onClick={() => setShowDeleteDialog(true)}
                                        disabled={deleteMutation.isPending}
                                    >
                                        {deleteMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Status Indicator if not active but set */}
                        {hasSettings && !settings.isActive && (
                            <div className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-1 bg-[var(--color-neo-accent)] p-2 neo-border-2">
                                <AlertCircle className="h-3 w-3" />
                                Notifications Paused
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Telegram Notifications</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove Telegram notifications? You will no longer receive daily balance updates.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
