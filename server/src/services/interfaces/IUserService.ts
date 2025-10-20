import { UserResponseDto } from '@dtos/UserResponse.dto';
import { IUser } from '@interfaces/IUser';
export default interface IUserService {
    createUser(newUser: IUser): Promise<UserResponseDto>;
    getAllUsers(): Promise<UserResponseDto[]>;
    getUserById(id: string): Promise<UserResponseDto>;
    getUserByUsername(username: string): Promise<UserResponseDto>;
    getUserByWhere(condition: object): Promise<UserResponseDto>;
    updateUser(id: string, updatedUserInfo: IUser): Promise<UserResponseDto>;
    deleteUser(id: string): Promise<UserResponseDto>;
}
