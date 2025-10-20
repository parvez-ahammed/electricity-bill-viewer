import { z } from "zod";

export const editProfileFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().optional(),
    bio: z.string().optional(),
});

export type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

export const updatePasswordFormSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, { message: "Current password is required" }),
        newPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" })
            .regex(/[A-Z]/, {
                message: "Password must contain at least one uppercase letter",
            })
            .regex(/[a-z]/, {
                message: "Password must contain at least one lowercase letter",
            })
            .regex(/[0-9]/, {
                message: "Password must contain at least one number",
            }),
        confirmPassword: z
            .string()
            .min(1, { message: "Please confirm your password" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordFormSchema>;
