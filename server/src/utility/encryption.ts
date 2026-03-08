import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import { ProviderCredentials } from '@interfaces/Account';
import CryptoJS from 'crypto-js';

/**
 * Encryption utility for sensitive data like passwords
 */
export class EncryptionService {
    private static readonly ALGORITHM = 'AES';
    private static secretKey: string;

    static {
        this.secretKey = appConfig.encryptionKey || 'default-encryption-key-change-in-production';

        if (!appConfig.encryptionKey) {
            if (appConfig.nodeEnv === 'production') {
                throw new Error('ENCRYPTION_KEY must be set in production. Refusing to start with default key.');
            }
            logger.warn('Using default encryption key. Set ENCRYPTION_KEY for production.');
        }
    }

    static encrypt(plainText: string): string {
        try {
            return CryptoJS.AES.encrypt(plainText, this.secretKey).toString();
        } catch (error) {
            logger.error('Failed to encrypt data');
            throw new Error('Encryption failed');
        }
    }

    static decrypt(encryptedText: string): string {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);

            if (!plainText) {
                throw new Error('Failed to decrypt - invalid encrypted data or wrong key');
            }

            return plainText;
        } catch (error) {
            logger.error('Failed to decrypt data');
            throw new Error('Decryption failed');
        }
    }

    static encryptCredentials(credentials: ProviderCredentials): ProviderCredentials {
        const encrypted = { ...credentials };

        if ('password' in encrypted && encrypted.password) {
            encrypted.password = this.encrypt(encrypted.password);
        }

        if ('clientSecret' in encrypted && encrypted.clientSecret) {
            encrypted.clientSecret = this.encrypt(encrypted.clientSecret);
        }

        return encrypted;
    }

    static decryptCredentials(credentials: ProviderCredentials): ProviderCredentials {
        const decrypted = { ...credentials };

        if ('password' in decrypted && decrypted.password) {
            decrypted.password = this.decrypt(decrypted.password);
        }

        if ('clientSecret' in decrypted && decrypted.clientSecret) {
            decrypted.clientSecret = this.decrypt(decrypted.clientSecret);
        }

        return decrypted;
    }
}
