export const routePermission = {
    POST: {
        '/api/v1/users': 'create-user',
    },
    GET: {
        '/api/v1/users': 'view-users',
        '/api/v1/users/:id': 'view-user',
    },
    PATCH: {
        '/api/v1/users/:id': 'update-user',
    },
    DELETE: {
        '/api/v1/users/:id': 'delete-user',
    },
};

export const userPermissions = {
    POST: [],
    GET: ['view-user'],
    PATCH: ['update-user'],
    DELETE: [],
};

export const adminPermissions = {
    ...userPermissions,
    POST: [...userPermissions.POST, 'create-user'],
    GET: [...userPermissions.GET, 'view-users'],
    DELETE: [...userPermissions.DELETE, 'delete-user'],
};

export enum UserRole {
    ADMIN = '1',
    USER = '2',
}
