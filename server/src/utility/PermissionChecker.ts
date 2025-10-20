import {
    adminPermissions,
    routePermission,
    userPermissions,
    UserRole,
} from '@configs/premissions';

export const checkPermission = (
    role: string,
    method: string,
    route: string
): boolean => {
    const permissions = getPermissions(role);

    const requiredPermissionsMap = routePermission[method];

    let matchedPermission: string | undefined;

    for (const pattern in requiredPermissionsMap) {
        const regex = new RegExp(
            '^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$'
        );
        if (regex.test(route)) {
            matchedPermission = requiredPermissionsMap[pattern];
            break;
        }
    }

    const hasPermission = matchedPermission
        ? permissions[method]?.includes(matchedPermission)
        : false;

    return hasPermission;
};

const getPermissions = (role: string) => {
    return role === UserRole.ADMIN ? adminPermissions : userPermissions;
};
