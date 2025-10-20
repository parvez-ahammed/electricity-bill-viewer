import { z } from "zod";

export const signupFormSchema = z
    .object({
        email: z
            .string()
            .trim()
            .email({ message: "Please enter a valid email address" })
            .max(255, { message: "Email must be at most 255 characters" }),

        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" })
            .max(64, { message: "Password must be at most 64 characters" })
            .regex(/[A-Z]/, {
                message: "Password must contain at least one uppercase letter",
            })
            .regex(/[a-z]/, {
                message: "Password must contain at least one lowercase letter",
            })
            .regex(/[0-9]/, {
                message: "Password must contain at least one number",
            })
            .regex(/[^A-Za-z0-9]/, {
                message: "Password must contain at least one special character",
            }),

        confirmPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" }),

        name: z
            .string()
            .trim()
            .min(1, { message: "Name is required" })
            .max(100, { message: "Name must be at most 100 characters" })
            .regex(/^[A-Za-z\s]+$/, {
                message: "Name can only contain letters and spaces",
            }),

        username: z
            .string()
            .trim()
            .min(3, { message: "Username must be at least 3 characters" })
            .max(30, { message: "Username must be at most 30 characters" })
            .regex(/^[a-zA-Z0-9_]+$/, {
                message:
                    "Username can only contain letters, numbers, and underscores",
            }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export const loginFormSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
        .string()
        .min(2, { message: "Password must be at least 2 characters" }),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;
