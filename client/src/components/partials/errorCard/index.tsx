import { UserNotFound } from "@/assets/images";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import React from "react";

import { Paragraph, Title } from "@/components/partials/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface ErrorCardProps {
    image?: React.ReactNode;
    statusCode?: number;
    title: string;
    description: string;
    showButtons?: boolean;
    className?: string;
}
export const ErrorCard = ({
    image,
    statusCode,
    title,
    description,
    showButtons = true,
    className,
}: ErrorCardProps) => {
    return (
        <div
            className={cn(
                "bg-background flex items-center justify-center p-4",
                className
            )}
        >
            <Card className="m-4 w-full max-w-md p-6 text-center shadow-lg">
                <CardContent className="text-center">
                    {image || <UserNotFound />}
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <span className="text-primary block text-7xl font-bold">
                            {statusCode}
                        </span>
                        <Title className="mt-2 text-2xl font-semibold tracking-tight">
                            {title}
                        </Title>
                    </motion.div>
                    <Paragraph className="text-muted-foreground">
                        {description}
                    </Paragraph>
                    <Separator className="my-2" />
                </CardContent>
                {showButtons && (
                    <CardFooter className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Button
                            onClick={() => window.history.back()}
                            className="text-black hover:bg-white/80"
                            variant="outline"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Go Back</span>
                        </Button>
                        <Button
                            onClick={() => (window.location.href = "/")}
                            className="bg-black text-white hover:bg-black/80"
                        >
                            <Home className="h-4 w-4" />
                            <span>Go Home</span>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};
