import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

import { db } from '@/lib/db';
import { getVerificationTokenByEmail } from '@/data/verificationToken';
import { getPasswordResetTokenByEmail } from '@/data/passwordResetToken';
import { getTwoFactorTokenByEmail } from '@/data/twoFactorToken';

export const generateTwoFactorToken = async (email: string) => {
    const token = crypto.randomInt(100_000, 1_000_000).toString();
    const expires = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes from now

    const existingToken = await getTwoFactorTokenByEmail(email);

    if (existingToken) {
        await db.twoFactorToken.delete({ where: { id: existingToken.id } });
    }

    const twoFactorToken = await db.twoFactorToken.create({
        data: {
            email,
            token,
            expires
        }
    });

    return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour from now

    const existingToken = await getPasswordResetTokenByEmail(email);

    if (existingToken) {
        await db.passwordResetToken.delete({ where: { id: existingToken.id } });
    }

    const passwordResetToken = await db.passwordResetToken.create({
        data: {
            email,
            token,
            expires
        }
    });

    return passwordResetToken;
};

export const generateVerificationToken = async (email: string) => {
    const token = generateVerificationCode(8);
    const expires = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour from now

    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
        await db.verificationToken.delete({ where: { id: existingToken.id } });
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            email,
            token,
            expires
        }
    });

    return verificationToken;
};

const generateVerificationCode = (length: number = 6): string => {
    let baseCode = crypto.randomBytes(length)
        .toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')  // Remove any non-alphanumeric characters
        .substring(0, length);

    return baseCode;
};