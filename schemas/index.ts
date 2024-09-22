import { UserRole } from "@prisma/client";
import * as z from "zod";

export const SettingsSchema = z.object({
    firstName: z.optional(z.string()),
    lastName: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    // An array of the UserRole enum
    roles: z.array(z.nativeEnum(UserRole)),
    email: z.optional(z.string()),
    password: z.optional(z.string()),
    newPassword: z.optional(z.string()),
    IAM: z.string().regex(/^[a-zA-Z]{5}[0-9]{3}$/),
    studentClass: z.optional(z.string()),
})
    .refine((data) => {
        if (data.password && !data.newPassword) {
            return false
        }

        return true
    }, {
        message: "New password is required!",
        path: ["newPassword"],
    })
    .refine((data) => {
        if (data.newPassword && !data.password) {
            return false
        }

        return true
    }, {
        message: "Password is required!",
        path: ["password"],
    })
    .refine((data) => {
        const newPwdLength = data.newPassword?.length || 0
        // If the password is less than 6 characters but not empty return false
        if (newPwdLength < 6 && data.newPassword) {
            return false
        }

        return true
    }, {
        message: "Minimum 6 characters required!",
        path: ["newPassword"],
    })
    .refine((data) => {
        const newPwdLength = data.password?.length || 0
        // If the password is less than 6 characters but not empty return false
        if (newPwdLength < 6 && data.password) {
            return false
        }

        return true
    }, {
        message: "Minimum 6 characters required!",
        path: ["password"],
    })
    .refine((data) => {
        // Check if the password and new password are the same
        if (data.password && data.newPassword && data.password === data.newPassword) {
            return false
        }

        return true
    }, {
        message: "New password cannot be the same as the old one!",
        path: ["newPassword"],
    })
    // Password regex validation
    // Check if the password has at least one lowercase letter
    .refine((data) => {
        if (data.newPassword && !data.newPassword.match(/[a-z]/g)) {
            return false
        }

        return true
    }, {
        message: "New password must have at least one lowercase letter!",
        path: ["newPassword"],
    })
    // Check if the password has at least one uppercase letter
    .refine((data) => {
        if (data.newPassword && !data.newPassword.match(/[A-Z]/g)) {
            return false
        }

        return true;
    }, {
        message: "New password must have at least one uppercase letter!",
        path: ["newPassword"],
    })
    // Check if the password has at least one number
    .refine((data) => {
        if (data.newPassword && !data.newPassword.match(/[0-9]/g)) {
            return false
        }

        return true;
    }, {
        message: "New password must have at least one number!",
        path: ["newPassword"],
    })
    // Check if the password has at least one special character
    .refine((data) => {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if (data.newPassword && !data.newPassword.match(specialChars)) {
            return false
        }

        return true;
    }, {
        message: "New password must have at least one special character!",
        path: ["newPassword"],
    })

export const EmailSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
});

export const LoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string(),
    code: z.optional(z.string())
});

export const RegisterSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(6, { message: "Minimum 6 characters required" }),
    // IAM has to have 5 letters followed by 3 numbers
    IAM: z.string().min(1, { message: "IAM is required" }),
})
    // Password regex validation
    // Check if the password has at least one lowercase letter
    .refine((data) => {
        if (data.password && !data.password.match(/[a-z]/g)) {
            return false
        }

        return true
    }, {
        message: "Password must have at least one lowercase letter!",
        path: ["password"],
    })
    // Check if the password has at least one uppercase letter
    .refine((data) => {
        if (data.password && !data.password.match(/[A-Z]/g)) {
            return false
        }

        return true;
    }, {
        message: "Password must have at least one uppercase letter!",
        path: ["password"],
    })
    // Check if the password has at least one number
    .refine((data) => {
        if (data.password && !data.password.match(/[0-9]/g)) {
            return false
        }

        return true;
    }, {
        message: "Password must have at least one number!",
        path: ["password"],
    })
    // Check if the password has at least one special character
    .refine((data) => {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if (data.password && !data.password.match(specialChars)) {
            return false
        }

        return true;
    }, {
        message: "Password must have at least one special character!",
        path: ["password"],
    })

export const OnboardingSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    isTwoFactorEnabled: z.boolean(),
    studentClass: z.string().min(1, "Student class is required"),
});

export const ResetSchema = z.object({
    email: z.string().email({ message: "Email is required" })
});

export const NewPasswordSchema = z.object({
    password: z.string().min(6, { message: "Minimum 6 characters required" }),
});