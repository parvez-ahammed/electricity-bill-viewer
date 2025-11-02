import { ResponseBuilder } from '@helpers/ResponseBuilder';
import { AccountResponse } from '@interfaces/Account';
import { Request, Response } from 'express';
import { AccountService } from '../../services/implementations/AccountService';

export class AccountController {
    private accountService: AccountService;

    constructor() {
        this.accountService = new AccountService();
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
            const account = await this.accountService.createAccount(req.body);
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
            const { id } = req.params;
            const account = await this.accountService.getAccountById(id);
            
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
            const { id } = req.params;
            const account = await this.accountService.updateAccount(id, req.body);
            
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
            const { id } = req.params;
            const deleted = await this.accountService.deleteAccount(id);
            
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

    forceDeleteAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const deleted = await this.accountService.forceDeleteAccount(id);
            
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
                .setMessage('Corrupted account deleted successfully')
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