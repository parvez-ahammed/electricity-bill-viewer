const defaultPath = "/auth";

export const authPaths = {
    default: defaultPath,
    login: `${defaultPath}/login`,
    signup: `${defaultPath}/signup`,
} as const;
