import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

// Assume transporter is already configured
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD, // Using APP_PASSWORD as requested
  },
});

const name = 'FRT';
const websiteDomain = process.env.NEXTAUTH_URL;

export const sendTwoFactorTokenEmail = async (
  email: Mail.Address | string,
  token: string
) => {
  const margin = 1;

  // Token is a 6-digit number

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
  <h2 style="text-align: center; color: #0066cc;">Verify it's you</h2>
  <p style="font-size: 16px; color: #555; text-align: center;">Please confirm your identity by entering the verification code.</p>
  <div style="text-align: center; margin: 20px 0;">
    ${token
      .split('')
      .map((char, index) => {
        if (index === 3) {
          return `<span style="
              margin: 0 4px;
              font-weight: bold;
              font-size: 24px;
              color: #0066cc;
              user-select: none;
            "></span><div style="
              display: inline-block;
              margin: 0 ${margin}px;
              width: 40px;
              height: 50px;
              text-align: center;
              border: 2px solid #0066cc;
              border-radius: 5px;
              line-height: 50px;
              font-size: 24px;
              font-weight: bold;
              color: #333;
              user-select: none;
            ">${char}</div>`;
        }
        return `<div style="
            display: inline-block;
            margin: 0 ${margin}px;
            width: 40px;
            height: 50px;
            text-align: center;
            border: 2px solid #0066cc;
            border-radius: 5px;
            line-height: 50px;
            font-size: 24px;
            font-weight: bold;
            color: #333;
            user-select: none;
          ">${char}</div>`;
      })
      .join('')}
  </div>
    </div>
    <p style="font-size: 16px; color: #555; text-align: center;">This code will expire in 5 minutes.</p>
  <p style="font-size: 14px; color: #777; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
</div>
    `;

  const userAddress = process.env.USER;

  if (!userAddress) {
    throw new Error('USER environment variable is not set');
  }

  await transporter.sendMail({
    from: {
      name,
      address: userAddress,
    },
    to: [email],
    subject: 'Verify your email',
    html,
  });
};
export const sendPasswordResetEmail = async (
  email: Mail.Address | string,
  token: string,
) => {
  const resetLink = `${websiteDomain}/auth/new-password?token=${token}`;

  const margin = 1;

  const html = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
  <h2 style="text-align: center; color: #0066cc;">Reset Your Password</h2>
  <p style="font-size: 16px; color: #555; text-align: center;">You are receiving this email because we received a password reset request for your account.</p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${resetLink}" style="background-color: #0066cc; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
  </div>
  <p style="font-size: 16px; color: #555; text-align: center;">This link will expire in 1 hour.</p>
  <p style="font-size: 16px; color: #555; text-align: center;">If you did not make this request, you can safely ignore this email.</p>
  </div>
  `;

  const userAddress = process.env.USER;

  if (!userAddress) {
    throw new Error('USER environment variable is not set');
  }

  await transporter.sendMail({
    from: {
      name,
      address: userAddress,
    },
    to: [email],
    subject: 'Reset Your Password',
    html,
  });
}
export const sendVerificationEmail = async (
  email: Mail.Address | string,
  token: string
) => {
  const websiteLink = `${websiteDomain}/auth/new-verification`;
  const confirmLink = `${websiteLink}?token=${token}`;

  const margin = 1;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
  <h2 style="text-align: center; color: #0066cc;">Verify Your Email Address</h2>
  <p style="font-size: 16px; color: #555; text-align: center;">Thank you for signing up! Please confirm your email address by clicking the button below or by entering the verification code on our website.</p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${confirmLink}" style="background-color: #0066cc; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirm Your Email</a>
  </div>
  <p style="font-size: 16px; color: #555; text-align: center;">Or, enter the following code on <a href="${websiteLink}"> our website:</a></p>
  <div style="text-align: center; margin: 20px 0;">
    ${token
      .split('')
      .map((char, index) => {
        if (index === 4) {
          return `<span style="
              margin: 0 4px;
              font-weight: bold;
              font-size: 24px;
              color: #0066cc;
              user-select: none;
            "></span><div style="
              display: inline-block;
              margin: 0 ${margin}px;
              width: 40px;
              height: 50px;
              text-align: center;
              border: 2px solid #0066cc;
              border-radius: 5px;
              line-height: 50px;
              font-size: 24px;
              font-weight: bold;
              color: #333;
              user-select: none;
            ">${char}</div>`;
        }
        return `<div style="
            display: inline-block;
            margin: 0 ${margin}px;
            width: 40px;
            height: 50px;
            text-align: center;
            border: 2px solid #0066cc;
            border-radius: 5px;
            line-height: 50px;
            font-size: 24px;
            font-weight: bold;
            color: #333;
            user-select: none;
          ">${char}</div>`;
      })
      .join('')}
  </div>
    </div>
    <p style="font-size: 16px; color: #555; text-align: center;">This link will expire in 1 hour.</p>
  <p style="font-size: 14px; color: #777; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
</div>
    `;

  const userAddress = process.env.USER;
  if (!userAddress) throw new Error('USER environment variable is not set');

  await transporter.sendMail({
    from: {
      name,
      address: userAddress,
    },
    to: [email],
    subject: 'Verify your email',
    html,
  });
};

// Security information emails
export const sendPwdChangedEmail = async (email: Mail.Address | string) => {
  // This email is sent when a user has changed their password
  const resetPwdLink = `${websiteDomain}/auth/reset`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="text-align: center; color: #0066cc;">Your Password Has Been Changed</h2>
      <p style="font-size: 16px; color: #555; text-align: center;">We wanted to let you know that your password has been successfully changed.</p>
      <p style="font-size: 16px; color: #555; text-align: center;">If you did not make this change, please reset your password immediately by clicking the button below.</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetPwdLink}" style="background-color: #cc0000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Your Password</a>
      </div>
      <p style="font-size: 16px; color: #555; text-align: center;">Or, use the following link to reset your password: <a href="${resetPwdLink}">Reset Password!</a></p>
      <p style="font-size: 14px; color: #777; text-align: center;">If you did not request this change, please contact our support team immediately.</p>
    </div>
  `;

  const userAddress = process.env.USER;
  if (!userAddress) throw new Error('USER environment variable is not set');

  await transporter.sendMail({
    from: {
      name,
      address: userAddress,
    },
    to: [email],
    subject: 'Security Information - Password Changed',
    html,
  });
};
