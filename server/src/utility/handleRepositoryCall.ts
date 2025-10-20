import ApiError from '@helpers/ApiError';

export async function handleRepositoryCall<T>(
    operation: Promise<T>,
    errorCode: number = 404,
    errorMessage: string = 'Failed to perform operation'
): Promise<T> {
    const result = await operation;
    if (!result) {
        throw new ApiError(errorCode, errorMessage);
    }
    return result;
}
