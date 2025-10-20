import { UserResponseDto } from '@dtos/UserResponse.dto';
import logger from '@helpers/Logger';
import { IUser } from '@interfaces/IUser';
import { AuthService } from '@services/AuthService';
import { UserService } from '@services/UserService';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import IAuthService from 'src/services/interfaces/IAuthService';
import IUserService from 'src/services/interfaces/IUserService';

export default class UserController {
    private userService: IUserService;
    private authService: IAuthService;

    constructor() {
        this.userService = new UserService();
        this.authService = new AuthService();
    }
    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { password, ...newUser } = req.body;
            const response: UserResponseDto =
                await this.userService.createUser(newUser);

            await this.authService.saveUserCredentials(response.id, password);

            res.status(httpStatus.CREATED).send(response);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response: UserResponseDto[] =
                await this.userService.getAllUsers();

            res.status(httpStatus.OK).send(response);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const response: UserResponseDto =
                await this.userService.getUserById(id);

            res.status(httpStatus.OK).send(response);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const updatedUserInfo: IUser = req.body;
            const response: UserResponseDto = await this.userService.updateUser(
                id,
                updatedUserInfo
            );

            res.status(httpStatus.OK).send(response);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const response: UserResponseDto =
                await this.userService.deleteUser(id);
            res.status(httpStatus.OK).send(response);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getUserByUsername = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const username = req.params.username;
            const response: UserResponseDto =
                await this.userService.getUserByUsername(username);

            res.status(httpStatus.OK).send(response);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
}
