import { IUser } from "@/common/interfaces/userApi.interface";
import { useLocales } from "@/config/i18n";
import { Avatar } from "@radix-ui/react-avatar";

import { Button } from "@/components/ui";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UsersProps {
    users: IUser[];
    handleResultClick: (id: string, type: "user") => void;
}

export const Users = ({ users, handleResultClick }: UsersProps) => {
    const { locale } = useLocales();
    if (users.length === 0) {
        return null;
    }

    return (
        <div className="pb-2">
            <div className="text-muted-foreground px-4 py-2 text-xs font-semibold">
                Users
            </div>
            <div>
                {users.map((user) => (
                    <Button
                        key={user.id}
                        className="hover:bg-muted mb-2 flex w-full items-center justify-between bg-white px-4 py-2 text-left"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleResultClick(user.username, "user")}
                    >
                        <div className="flex items-center gap-2 space-y-2">
                            <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src="/profile-photo-2.svg"
                                        alt={user.name}
                                    />
                                    <AvatarFallback>
                                        {user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div>
                                <div className="cursor-pointer text-sm font-medium">
                                    {user.name}
                                </div>
                                <div className="text-muted-foreground cursor-pointer text-xs">
                                    @{user.username}
                                </div>
                            </div>
                        </div>
                        <span className="text-muted-foreground cursor-pointer text-xs text-black">
                            {locale.navbar.cta.jumpTo}
                        </span>
                    </Button>
                ))}
            </div>
        </div>
    );
};
