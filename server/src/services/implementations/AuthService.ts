import { AuthResponseDto } from '@dtos/AuthResponse.dto';
import ApiError from '@helpers/ApiError';
import { AuthRepository } from '@repositories/AuthRepository';
import { AuthDtoConversionUtlity } from '@utility/AuthDtoConversionUtility';
import { comparePassword } from '@utility/comparePasswordUtility';
import { handleRepositoryCall } from '@utility/handleRepositoryCall';
import { hashPassword } from '@utility/hashPasswordUtility';
import httpStatus from 'http-status';
import { IAuth } from '../../interfaces/IAuth';
import IAuthService from '../interfaces/IAuthService';
import TokenService from './TokenService';
import { UserService } from './UserService';
export class AuthService implements IAuthService {
    private authRepository: AuthRepository;
    private userService: UserService;
    constructor() {
        this.authRepository = new AuthRepository();
        this.userService = new UserService();
    }

    async saveUserCredentials(userId: string, password: string): Promise<void> {
        const hashedPassword = await hashPassword(password);
        await this.authRepository.create({
            userId: userId,
            password: hashedPassword,
        });
    }

    loginWithEmailPassword = async (email: string, password: string) => {
        const user = await handleRepositoryCall(
            this.userService.getUserByWhere({ email }),
            httpStatus.NOT_FOUND,
            'User not found'
        );

        const result = await handleRepositoryCall(
            this.authRepository.findOne({ userId: user.id }),
            httpStatus.NOT_FOUND,
            'User not found'
        );

        const isPasswordValid = await comparePassword(
            password,
            result.password
        );

        if (!isPasswordValid) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Invalid Email or Password'
            );
        }

        const tokenService = new TokenService();
        const token = tokenService.generateToken(user);

        return AuthDtoConversionUtlity.convertLoginResponse(token, user);
    };

    async deleteUserCredentials(userId: string): Promise<AuthResponseDto> {
        const result: IAuth = await handleRepositoryCall(
            this.authRepository.delete({ userId: userId }),
            httpStatus.NOT_FOUND,
            'User ID not found'
        );

        return AuthDtoConversionUtlity.convertAuth(result);
    }
    async updatePassword(
        userId: string,
        newPassword: string,
        currentPassword: string
    ): Promise<AuthResponseDto> {
        const getResult = await handleRepositoryCall(
            this.authRepository.findOne({ userId: userId }),
            httpStatus.NOT_FOUND,
            'User not found'
        );

        const isPasswordValid = await comparePassword(
            currentPassword,
            getResult.password
        );

        if (!isPasswordValid) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Current password is incorrect'
            );
        }

        const newHashedPassword = await hashPassword(newPassword);

        const result: IAuth = await handleRepositoryCall(
            this.authRepository.update(
                { userId: userId },
                { password: newHashedPassword }
            ),
            httpStatus.NOT_FOUND,
            'User ID not found'
        );

        return AuthDtoConversionUtlity.convertAuth(result);
    }
}
