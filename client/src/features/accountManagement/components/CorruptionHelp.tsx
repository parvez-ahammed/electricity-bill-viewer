import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";

export const CorruptionHelp = () => {
    return (
        <div className="space-y-4">
            {/* Error Alert */}
            <Card className="border-red-200 bg-red-50">
                <CardContent className="flex items-start gap-3 p-4">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-red-800">
                            Corrupted Account Data Detected
                        </h4>
                        <p className="text-sm text-red-700">
                            Some accounts show as "CORRUPTED DATA" because they cannot be decrypted. 
                            This typically happens when the encryption key changes.
                        </p>
                    </div>
                </CardContent>
            </Card>
            
            {/* Info Alert */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="flex items-start gap-3 p-4">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-blue-800">
                            What to do:
                        </h4>
                        <div className="text-sm text-blue-700 space-y-1">
                            <div>1. <strong>Delete corrupted accounts:</strong> Use the delete button to remove corrupted entries</div>
                            <div>2. <strong>Re-add accounts:</strong> Create new accounts with the correct credentials</div>
                            <div>3. <strong>Prevent future issues:</strong> Avoid changing the ENCRYPTION_KEY environment variable</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};