import { EMPTY_STRING } from "@/common/constants/app.constant";
import { useLocales } from "@/config/i18n";
import { usePreferences } from "@/context/PreferenceContext";
import { Languages } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export const UnauthorizedButtons = ({ isMobile = false }) => {
    const { handleLanguageChange } = usePreferences();
    const { locale } = useLocales();
    return (
        <div
            className={`flex items-center ${isMobile ? "w-full flex-col gap-2" : "gap-3"}`}
        >
            <Button
                className="bg-black pb-2 text-white hover:bg-gray-900"
                onClick={handleLanguageChange}
            >
                <Languages className="h-5 w-5 text-white" />
            </Button>
            <Link
                to="/auth/login"
                className={`text-sm font-medium text-gray-700 hover:text-black ${isMobile ? "w-full py-2 text-center" : EMPTY_STRING}`}
            >
                {locale.navbar.cta.login}
            </Link>
            <Link
                to="/auth/signup"
                className={`rounded-md border border-black bg-white px-4 py-2 text-sm font-medium text-black hover:bg-blue-50 ${isMobile ? "w-full text-center" : EMPTY_STRING}`}
            >
                {locale.navbar.cta.createAccount}
            </Link>
        </div>
    );
};
