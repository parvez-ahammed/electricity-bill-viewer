import { AccountRecord, AccountResponse } from '@interfaces/Account';
import { AuthenticatedRequest } from '@interfaces/Auth';
import { Response } from 'express';
import { AccountService } from '../../services/implementations/AccountService';
import { BaseController } from '../BaseController';

export class AccountController extends BaseController {
    private accountService: AccountService;

    constructor() {
        super();
        this.accountService = new AccountService();
    }

    private mapToResponse(account: AccountRecord): AccountResponse {
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
        const userId = this.getValidatedUserId(req);
        const account = await this.accountService.createAccount(req.body, userId);
        const response = this.mapToResponse(account);
        this.created(res, response, 'Account created successfully');
    };

    getAccountById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const { id } = req.params;
        const account = await this.accountService.getAccountById(id, userId);

        if (!account) {
            this.notFound(res, 'Account not found');
            return;
        }

        const response = this.mapToResponse(account);
        this.ok(res, response, 'Account retrieved successfully');
    };

    getAllAccounts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const accounts = await this.accountService.getAllAccounts(userId);
        const response = accounts.map(account => this.mapToResponse(account));
        this.ok(res, response, 'Accounts retrieved successfully');
    };

    updateAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const { id } = req.params;
        const account = await this.accountService.updateAccount(id, userId, req.body);

        if (!account) {
            this.notFound(res, 'Account not found');
            return;
        }

        const response = this.mapToResponse(account);
        this.ok(res, response, 'Account updated successfully');
    };

    deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const { id } = req.params;
        const deleted = await this.accountService.deleteAccount(id, userId);

        if (!deleted) {
            this.notFound(res, 'Account not found');
            return;
        }

        this.ok(res, {}, 'Account deleted successfully');
    };

    forceDeleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const { id } = req.params;
        const deleted = await this.accountService.forceDeleteAccount(id, userId);

        if (!deleted) {
            this.notFound(res, 'Account not found');
            return;
        }

        this.ok(res, {}, 'Corrupted account deleted successfully');
    };

    getAccountsByProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const { provider } = req.params;
        const accounts = await this.accountService.getAccountsByProvider(provider, userId);
        const response = accounts.map(account => this.mapToResponse(account));

        this.ok(res, response, `${provider} accounts retrieved successfully`);
    };

    // Nickname management endpoints
    setAccountNickname = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const { id: accountId } = req.params;
        const { nickname } = req.body;

        await this.accountService.setAccountNickname(accountId, userId, nickname);
        this.ok(res, { accountId, nickname: nickname }, 'Nickname set successfully');
    };

    getAccountNickname = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const { id: accountId } = req.params;
        const nickname = await this.accountService.getAccountNickname(accountId, userId);

        this.ok(res, { accountId, nickname }, 'Nickname retrieved successfully');
    };

    deleteAccountNickname = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const { id: accountId } = req.params;
        
        await this.accountService.deleteAccountNickname(accountId, userId);
        this.ok(res, { accountId }, 'Nickname deleted successfully');
    };
}
