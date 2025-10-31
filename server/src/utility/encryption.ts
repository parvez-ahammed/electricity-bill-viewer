import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import CryptoJS from 'crypto-js';

/**
 * Encryption utility for sensitive data like passwords
 */
export class EncryptionService {
    private static readonly ALGORITHM = 'AES';
    private static secretKey: string;

    static {
        // Use environment variable or fallback to a default key (not recommended for production)
        this.secretKey = appConfig.encryptionKey || 'default-encryption-key-change-in-production';
        
        if (this.secretKey === 'default-encryption-key-change-in-production') {
            logger.warn('Using default encryption key. Please set ENCRYPTION_KEY environment variable for production.');
        }
    }

    /**
     * Encrypt a plain text string
     * @param plainText - The text to encrypt
     * @returns Encrypted string
     */
    static encrypt(plainText: string): string {
        try {
            const encrypted = CryptoJS.AES.encrypt(plainText, this.secretKey).toString();
            return encrypted;
        } catch (error) {
            logger.error('Failed to encrypt data:');
            throw new Error('Encryption failed');
        }
    }

    /**
     * Decrypt an encrypted string
     * @param encryptedText - The encrypted text to decrypt
     * @returns Decrypted plain text string
     */
    static decrypt(encryptedText: string): string {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);
            
            if (!plainText) {
                throw new Error('Failed to decrypt - invalid encrypted data or wrong key');
            }
            
            return plainText;
        } catch (error) {
            logger.error('Failed to decrypt data:');
            throw new Error('Decryption failed');
        }
    }

    /**
     * Encrypt credentials object
     * @param credentials - Credentials object with sensitive data
     * @returns Credentials object with encrypted sensitive fields
     */
    static encryptCredentials(credentials: any): any {
        const encrypted = { ...credentials };
        
        // Encrypt password if it exists
        if (credentials.password) {
            encrypted.password = this.encrypt(credentials.password);
        }
        
        // Encrypt client secret if it exists
        if (credentials.clientSecret) {
            encrypted.clientSecret = this.encrypt(credentials.clientSecret);
        }
        
        return encrypted;
    }

    /**
     * Decrypt credentials object
     * @param encryptedCredentials - Credentials object with encrypted sensitive data
     * @returns Credentials object with decrypted sensitive fields
     */
    static decryptCredentials(encryptedCredentials: any): any {
        const decrypted = { ...encryptedCredentials };
        
        // Decrypt password if it exists
        if (encryptedCredentials.password) {
            decrypted.password = this.decrypt(encryptedCredentials.password);
        }
        
        // Decrypt client secret if it exists
        if (encryptedCredentials.clientSecret) {
            decrypted.clientSecret = this.decrypt(encryptedCredentials.clientSecret);
        }
        
        return decrypted;
    }
}