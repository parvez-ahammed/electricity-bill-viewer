import { jwtDecode } from "jwt-decode";

export const useGetUserInfo = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return {
        userId: user.id,
        name: user.name,
        username: user.username,
        isAdmin: user.role === 1,
        joinDate: user.joinDate,
    };
};
interface DecodedToken {
    exp: number;
    iat: number;
    name: string;
    role: number;
    type: string;
    username: string;
}
export const useValidToken = () => {
    const token = localStorage.getItem("token");
    try {
        if (!token) {
            return false;
        }

        const decodedToken: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
            return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return false;
    }
    return true;
};
