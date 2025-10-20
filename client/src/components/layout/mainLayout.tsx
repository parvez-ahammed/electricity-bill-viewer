import { Outlet } from "react-router-dom";

import { Navbar } from "../partials/navbar";

export const MainLayout = () => {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <Navbar />
            <div className="flex flex-1 flex-col items-center px-2">
                <Outlet />
            </div>
        </div>
    );
};
