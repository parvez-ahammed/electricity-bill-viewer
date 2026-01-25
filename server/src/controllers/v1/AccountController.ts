import { AccountResponse } from '@interfaces/Account';
import { AuthenticatedRequest } from '@interfaces/Auth';
import { Response } from 'express';
import { AccountService } from '../../services/implementations/AccountService';
import { cacheService } from '../../services/implementations/RedisCacheService';
import { BaseController } from '../BaseController';

export class AccountController extends BaseController {
    private accountService: AccountService;

    constructor() {
        super();
        this.accountService = new AccountService();
    }

    private mapToResponse(account: any): AccountResponse {
        return {
            id: account.id,
            userId: account.userId,
            provider: account.provider,
            credentials: account.credentials,
            createdAt: account.createdAt.toISOString(),
            updatedAt: account.updatedAt.toISOString(),
        };
    }

    createAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const account = await this.accountService.createAccount(req.body, userId);
            const response = this.mapToResponse(account);

            this.created(res, response, 'Account created successfully');
        });
    };

    getAccountById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const { id } = req.params;
            const account = await this.accountService.getAccountById(id, userId);

            if (!account) {
                this.notFound(res, 'Account not found');
                return;
            }

            const response = this.mapToResponse(account);
            this.ok(res, response, 'Account retrieved successfully');
        });
    };

    getAllAccounts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const accounts = await this.accountService.getAllAccounts(userId);
            const response = accounts.map(account => this.mapToResponse(account));

            this.ok(res, response, 'Accounts retrieved successfully');
        });
    };

    updateAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const { id } = req.params;
            const account = await this.accountService.updateAccount(id, userId, req.body);

            if (!account) {
                this.notFound(res, 'Account not found');
                return;
            }

            const response = this.mapToResponse(account);
            this.ok(res, response, 'Account updated successfully');
        });
    };

    deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const { id } = req.params;
            const deleted = await this.accountService.deleteAccount(id, userId);

            if (!deleted) {
                this.notFound(res, 'Account not found');
                return;
            }

            this.ok(res, {}, 'Account deleted successfully');
        });
    };

    forceDeleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const { id } = req.params;
            const deleted = await this.accountService.forceDeleteAccount(id, userId);

            if (!deleted) {
                this.notFound(res, 'Account not found');
                return;
            }

            this.ok(res, {}, 'Corrupted account deleted successfully');
        });
    };

    getAccountsByProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const { provider } = req.params;
            const accounts = await this.accountService.getAccountsByProvider(provider, userId);
            const response = accounts.map(account => this.mapToResponse(account));

            this.ok(res, response, `${provider} accounts retrieved successfully`);
        });
    };

    // Nickname management endpoints
    setAccountNickname = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const { accountId } = req.params;
            const { nickname } = req.body;

            // Verify account belongs to user before setting nickname
            const account = await this.accountService.getAccountById(accountId, userId);
            if (!account) {
                this.notFound(res, 'Account not found');
                return;
            }

            if (!nickname || typeof nickname !== 'string' || nickname.trim() === '') {
                this.clientError(res, 'Nickname is required and must be a non-empty string');
                return;
            }

            const success = await cacheService.setAccountNickname(accountId, nickname.trim());

            if (!success) {
                throw new Error('Failed to set nickname');
            }

            this.ok(res, { accountId, nickname: nickname.trim() }, 'Nickname set successfully');
        });
    };

    getAccountNickname = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const { accountId } = req.params;

            // Verify account belongs to user before getting nickname
            const account = await this.accountService.getAccountById(accountId, userId);
            if (!account) {
                this.notFound(res, 'Account not found');
                return;
            }

            const nickname = await cacheService.getAccountNickname(accountId);

            this.ok(res, { accountId, nickname }, 'Nickname retrieved successfully');
        });
    };

    deleteAccountNickname = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const userId = this.validateUser(req, res);
            if (!userId) return;

            const { accountId } = req.params;

            // Verify account belongs to user before deleting nickname
            const account = await this.accountService.getAccountById(accountId, userId);
            if (!account) {
                this.notFound(res, 'Account not found');
                return;
            }

            const success = await cacheService.deleteAccountNickname(accountId);

            if (!success) {
                throw new Error('Failed to delete nickname');
            }

            this.ok(res, { accountId }, 'Nickname deleted successfully');
        });
    };
}
