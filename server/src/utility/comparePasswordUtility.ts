import bcrypt from 'bcryptjs';
export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    return isPasswordValid;
}
