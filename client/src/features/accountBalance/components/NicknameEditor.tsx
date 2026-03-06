import { useNicknameManager } from "@/common/hooks/useNicknameManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Edit2, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface NicknameEditorProps {
    accountId: string;
    currentDisplayName: string;
    location: string;
}

const nicknameSchema = z.object({
    nickname: z.string().max(50, "Maximum 50 characters")
});

type NicknameForm = z.infer<typeof nicknameSchema>;

export const NicknameEditor = ({ accountId, currentDisplayName, location }: NicknameEditorProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const { setNicknameMutation, deleteNicknameMutation, isRefreshing } = useNicknameManager();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<NicknameForm>({
        resolver: zodResolver(nicknameSchema),
        defaultValues: {
            nickname: currentDisplayName === location ? "" : currentDisplayName
        }
    });

    const onSubmit = (data: NicknameForm) => {
        const trimmedNickname = data.nickname.trim();
        if (trimmedNickname === "") {
            deleteNicknameMutation.mutate(accountId, {
                onSuccess: () => {
                    reset({ nickname: "" });
                    setIsEditing(false);
                }
            });
        } else {
            setNicknameMutation.mutate({ accountId, nickname: trimmedNickname }, {
                onSuccess: () => {
                    setIsEditing(false);
                }
            });
        }
    };

    const handleCancel = () => {
        reset({ nickname: currentDisplayName === location ? "" : currentDisplayName });
        setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <TableCell className="w-[200px] min-w-[200px] px-4 py-4">
                <form 
                    onSubmit={handleSubmit(onSubmit)} 
                    className="flex items-center gap-2"
                >
                    <div className="relative">
                        <Input
                            {...register("nickname")}
                            onKeyDown={handleKeyPress}
                            placeholder={location}
                            className="h-8 text-sm"
                            maxLength={50}
                            autoFocus
                            disabled={setNicknameMutation.isPending || deleteNicknameMutation.isPending || isRefreshing}
                        />
                        {errors.nickname && (
                            <span className="absolute -bottom-4 left-0 text-[10px] text-destructive">
                                {errors.nickname.message}
                            </span>
                        )}
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        disabled={setNicknameMutation.isPending || deleteNicknameMutation.isPending || isRefreshing}
                        className="h-8 w-8 p-0"
                    >
                        {(setNicknameMutation.isPending || deleteNicknameMutation.isPending) ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={setNicknameMutation.isPending || deleteNicknameMutation.isPending || isRefreshing}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </form>
            </TableCell>
        );
    }

    return (
        <TableCell
            className="w-[200px] min-w-[200px] px-4 py-4 group cursor-pointer"
            title={currentDisplayName}
            onClick={() => setIsEditing(true)}
        >
            <div className="flex items-center justify-between">
                <div className="truncate text-sm">{currentDisplayName}</div>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                >
                    <Edit2 className="h-3 w-3" />
                </Button>
            </div>
        </TableCell>
    );
};