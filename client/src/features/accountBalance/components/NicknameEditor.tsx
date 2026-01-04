import { useNicknameManager } from "@/common/hooks/useNicknameManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";

interface NicknameEditorProps {
    accountId: string;
    currentDisplayName: string;
    location: string;
}

export const NicknameEditor = ({ accountId, currentDisplayName, location }: NicknameEditorProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState(currentDisplayName === location ? "" : currentDisplayName);
    const { setNicknameMutation, deleteNicknameMutation, isRefreshing } = useNicknameManager();

    const handleSave = () => {
        const trimmedNickname = nickname.trim();
        if (trimmedNickname === "") {
            // If nickname is empty, delete it
            deleteNicknameMutation.mutate(accountId, {
                onSuccess: () => {
                    setNickname("");
                    setIsEditing(false);
                }
            });
        } else {
            // Set the nickname
            setNicknameMutation.mutate({ accountId, nickname: trimmedNickname }, {
                onSuccess: () => {
                    setIsEditing(false);
                }
            });
        }
    };

    const handleCancel = () => {
        setNickname(currentDisplayName === location ? "" : currentDisplayName);
        setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <TableCell className="w-[200px] min-w-[200px] px-4 py-4">
                <div className="flex items-center gap-2">
                    <Input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={location}
                        className="h-8 text-sm"
                        maxLength={50}
                        autoFocus
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSave}
                        disabled={setNicknameMutation.isPending || deleteNicknameMutation.isPending || isRefreshing}
                        className="h-8 w-8 p-0"
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={setNicknameMutation.isPending || deleteNicknameMutation.isPending || isRefreshing}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
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