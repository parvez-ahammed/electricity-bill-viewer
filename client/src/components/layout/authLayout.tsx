import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
    return (
        <main className="flex items-center justify-center">
            <Outlet />
        </main>
    );
};
