import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";

export const PasswordInputTest = () => {
    const [password, setPassword] = useState("");

    return (
        <div className="p-4 space-y-4 max-w-md">
            <div className="space-y-2">
                <Label htmlFor="test-password">Test Password Input</Label>
                <PasswordInput
                    id="test-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <p className="text-sm text-muted-foreground">
                Current value: {password}
            </p>
        </div>
    );
};