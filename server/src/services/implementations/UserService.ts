import { UserResponseDto } from '@dtos/UserResponse.dto';
import ApiError from '@helpers/ApiError';
import { IUser } from '@interfaces/IUser';
import { UserRepository } from '@repositories/UserRepository';
import { UserDtoConversionUtlity } from '@utility/UserDtoConversionUtility';
import { handleRepositoryCall } from '@utility/handleRepositoryCall';
import httpStatus from 'http-status';
import IUserService from '../interfaces/IUserService';

export class UserService implements IUserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(newUser: IUser): Promise<UserResponseDto> {
        const emailExists = await this.userRepository.exists({
            email: newUser.email,
        });

        const usernameExists = await this.userRepository.exists({
            username: newUser.username,
        });

        if (usernameExists || emailExists) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Username or email already exists'
            );
        }
        if (!newUser.joinDate) {
            newUser.joinDate = new Date();
        }

        const user = await handleRepositoryCall(
            this.userRepository.create(newUser),
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while creating the user'
        );
        return UserDtoConversionUtlity.convertUser(user);
    }

    async getAllUsers(): Promise<UserResponseDto[]> {
        const users = await handleRepositoryCall(
            this.userRepository.findAll(),
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while fetching all users'
        );
        return UserDtoConversionUtlity.convertUsers(users);
    }

    async getUserById(id: string): Promise<UserResponseDto> {
        const user = await handleRepositoryCall(
            this.userRepository.findOne({ id }),
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while fetching the user'
        );
        return UserDtoConversionUtlity.convertUser(user);
    }

    async getUserByUsername(username: string): Promise<UserResponseDto> {
        const user = await handleRepositoryCall(
            this.userRepository.findOne({ username }),
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while fetching the user'
        );
        return UserDtoConversionUtlity.convertUser(user);
    }

    async getUserByWhere(condition: object): Promise<UserResponseDto> {
        const user = await handleRepositoryCall(
            this.userRepository.findOne(condition),
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while fetching the user'
        );
        return UserDtoConversionUtlity.convertUser(user);
    }

    async updateUser(
        id: string,
        updatedUserInfo: IUser
    ): Promise<UserResponseDto> {
        const updatedUser = await handleRepositoryCall(
            this.userRepository.update({ id }, updatedUserInfo),
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while updating the user'
        );
        return UserDtoConversionUtlity.convertUser({ id: updatedUser.id });
    }

    async deleteUser(id: string): Promise<UserResponseDto> {
        const deletedUser = await handleRepositoryCall(
            this.userRepository.delete({ id }),
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while deleting the user'
        );

        return UserDtoConversionUtlity.convertUser(deletedUser);
    }
}
