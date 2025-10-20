export const useCheckAuthentication = () => {
    const token = localStorage.getItem("token");
    let authenticated = false;

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            authenticated = !isExpired;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            authenticated = false;
        }
    }
    const loading = false;
    return { authenticated, loading };
};
