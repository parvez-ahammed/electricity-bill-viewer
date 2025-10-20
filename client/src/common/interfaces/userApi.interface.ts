export interface IUser {
    id: string;
    name: string;
    email: string;
    joinDate: string;
    role: string;
    bio?: string;
    location?: string;
    avatar?: string;
    isAdmin?: boolean;
    username: string;
}
