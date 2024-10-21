import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

export default {
    providers: [
        Credentials({
            name: "Credentials",
            id: "credentials",
            type: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "Email",
                },
                password: {
                    label: "Password",
                    type: "password",
                }
            },
            async authorize(credentials) {
                const payload = {
                    email: credentials?.email,
                    password: credentials?.password
                };

                const validatedFields = LoginSchema.safeParse(payload);

                if (validatedFields.success) {
                    const { email, password } = validatedFields.data;

                    const user = await getUserByEmail(email);

                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                return null;
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
} satisfies NextAuthConfig;