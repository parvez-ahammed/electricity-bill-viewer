export interface IUser {
    id?: string;
    username?: string;
    name?: string;
    email?: string;
    joinDate?: Date;
    role?: number;
    passwordLastModificationTime?: Date;
    bio?: string;
    location?: string;
}
