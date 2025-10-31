import { ResponseBuilder } from '@helpers/ResponseBuilder';
import { AccountResponse } from '@interfaces/Account';
import { ElectricityProvider } from '@interfaces/Shared';
import { AccountParamsSchema, CreateAccountSchema, UpdateAccountSchema } from '@schemas/AccountSchemas';
import { Request, Response } from 'express';
import { AccountService } from '../../services/implementations/AccountService';

export class AccountController {
    private static accountService: AccountService;

    constructor() {
        if (!AccountController.accountService) {
            AccountController.accountService = new AccountService();
        }
    }

    private get accountService(): AccountService {
        return AccountController.accountService;
    }

    private mapToResponse(account: any): AccountResponse {
        return {
            id: account.id,
            provider: account.provider,
            credentials: account.credentials,
            createdAt: account.createdAt.toISOString(),
            updatedAt: account.updatedAt.toISOString(),
        };
    }

    createAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const validationResult = CreateAccountSchema.safeParse(req.body);
            
            if (!validationResult.success) {
                new ResponseBuilder(res)
                    .setStatus(400)
                    .setMessage('Validation failed')
                    .setData({ errors: validationResult.error.errors })
                    .sendError();
                return;
            }

            const account = await this.accountService.createAccount(validationResult.data as any);
            const response = this.mapToResponse(account);

            new ResponseBuilder(res)
                .setStatus(201)
                .setMessage('Account created successfully')
                .setData(response)
                .send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Internal server error')
                .setData({ error: errorMessage })
                .sendError();
        }
    };

    getAccountById = async (req: Request, res: Response): Promise<void> => {
        try {
            const paramsValidation = AccountParamsSchema.safeParse(req.params);
            
            if (!paramsValidation.success) {
                new ResponseBuilder(res)
                    .setStatus(400)
                    .setMessage('Invalid account ID')
                    .setData({ errors: paramsValidation.error.errors })
                    .sendError();
                return;
            }

            const account = await this.accountService.getAccountById(paramsValidation.data.id);
            
            if (!account) {
                new ResponseBuilder(res)
                    .setStatus(404)
                    .setMessage('Account not found')
                    .setData({})
                    .sendError();
                return;
            }

            const response = this.mapToResponse(account);

            new ResponseBuilder(res)
                .setStatus(200)
                .setMessage('Account retrieved successfully')
                .setData(response)
                .send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Internal server error')
                .setData({ error: errorMessage })
                .sendError();
        }
    };

    getAllAccounts = async (req: Request, res: Response): Promise<void> => {
        try {
            const accounts = await this.accountService.getAllAccounts();
            const response = accounts.map(account => this.mapToResponse(account));

            new ResponseBuilder(res)
                .setStatus(200)
                .setMessage('Accounts retrieved successfully')
                .setData(response)
                .send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Internal server error')
                .setData({ error: errorMessage })
                .sendError();
        }
    };

    updateAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const paramsValidation = AccountParamsSchema.safeParse(req.params);
            const bodyValidation = UpdateAccountSchema.safeParse(req.body);
            
            if (!paramsValidation.success) {
                new ResponseBuilder(res)
                    .setStatus(400)
                    .setMessage('Invalid account ID')
                    .setData({ errors: paramsValidation.error.errors })
                    .sendError();
                return;
            }

            if (!bodyValidation.success) {
                new ResponseBuilder(res)
                    .setStatus(400)
                    .setMessage('Validation failed')
                    .setData({ errors: bodyValidation.error.errors })
                    .sendError();
                return;
            }

            const account = await this.accountService.updateAccount(
                paramsValidation.data.id,
                bodyValidation.data as any
            );
            
            if (!account) {
                new ResponseBuilder(res)
                    .setStatus(404)
                    .setMessage('Account not found')
                    .setData({})
                    .sendError();
                return;
            }

            const response = this.mapToResponse(account);

            new ResponseBuilder(res)
                .setStatus(200)
                .setMessage('Account updated successfully')
                .setData(response)
                .send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Internal server error')
                .setData({ error: errorMessage })
                .sendError();
        }
    };

    deleteAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const paramsValidation = AccountParamsSchema.safeParse(req.params);
            
            if (!paramsValidation.success) {
                new ResponseBuilder(res)
                    .setStatus(400)
                    .setMessage('Invalid account ID')
                    .setData({ errors: paramsValidation.error.errors })
                    .sendError();
                return;
            }

            const deleted = await this.accountService.deleteAccount(paramsValidation.data.id);
            
            if (!deleted) {
                new ResponseBuilder(res)
                    .setStatus(404)
                    .setMessage('Account not found')
                    .setData({})
                    .sendError();
                return;
            }

            new ResponseBuilder(res)
                .setStatus(200)
                .setMessage('Account deleted successfully')
                .setData({})
                .send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Internal server error')
                .setData({ error: errorMessage })
                .sendError();
        }
    };

    getAccountsByProvider = async (req: Request, res: Response): Promise<void> => {
        try {
            const { provider } = req.params;
            
            if (!Object.values(ElectricityProvider).includes(provider as ElectricityProvider)) {
                new ResponseBuilder(res)
                    .setStatus(400)
                    .setMessage('Invalid provider')
                    .setData({ error: 'Provider must be one of: DPDC, NESCO, DESCO' })
                    .sendError();
                return;
            }

            const accounts = await this.accountService.getAccountsByProvider(provider);
            const response = accounts.map(account => this.mapToResponse(account));

            new ResponseBuilder(res)
                .setStatus(200)
                .setMessage(`${provider} accounts retrieved successfully`)
                .setData(response)
                .send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Internal server error')
                .setData({ error: errorMessage })
                .sendError();
        }
    };
}