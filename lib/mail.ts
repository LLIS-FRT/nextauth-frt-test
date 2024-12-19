import { Shift } from '@prisma/client';
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

/**
 * @description Send a 2FA token email
 */
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

/**
 * @description Send a password reset email
 */
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

/**
 * @description Send an email when a user registers for the first time or changes their email to verify their email
 */
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

/**
 * @description Send an email when a users password was changed
 */
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

interface ShiftProps {
  users: Promise<{ name: string; position: string; id: string }>[];
  teamName: string;
  startDate: Date;
  endDate: Date;
}

const formatPositionName = (position: string): string => {
  let formattedPosition = position;

  // The position is camelCase
  // we get this: "chefAgres" -> "Chef Agres"
  formattedPosition = formattedPosition
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());


  // If ends in bin, add a "." to the end
  if (formattedPosition.toLocaleLowerCase().endsWith("bin")) formattedPosition += ".";

  return formattedPosition;
}

// Function to create .ics file content
const createIcsFile = (shift: ShiftProps, currentUserPosition: string) => {
  const { endDate, startDate, teamName } = shift;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${teamName} - Shift
DTSTART:${formatDateForIcs(startDate)}
DTEND:${formatDateForIcs(endDate)}
DESCRIPTION:You have been assigned to a shift as a ${currentUserPosition}
END:VEVENT
END:VCALENDAR`;
  return icsContent;
};

// Format date to ICS format (YYYYMMDDTHHMMSSZ)
const formatDateForIcs = (date: Date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}T${String(d.getUTCHours()).padStart(2, '0')}${String(d.getUTCMinutes()).padStart(2, '0')}${String(d.getUTCSeconds()).padStart(2, '0')}Z`;
};

/**
 * @description Send an email when a user has been added to a shift
 */
export const sendShiftAddedEmail = async (
  currentUser: { name: string; email: Mail.Address | string; id: string },
  shift: ShiftProps
) => {
  const websiteLink = `${websiteDomain}/calendar`; // The users can see all their shifts here

  const { endDate, startDate, users, teamName } = shift;
  const { name, email, id } = currentUser;

  const usersAwaited = await Promise.all(users);

  // Find the current user's position in the users array
  const currentUserInfo = usersAwaited.find(user => user.id === id);
  const userPosition = currentUserInfo ? currentUserInfo.position : "Unknown Position";

  // Filter out the current user from the assigned users list
  const assignedUsers = usersAwaited.filter(user => user.id !== id);

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h2 style="color: #007BFF;">Shift Added Notification</h2>
      <p>Dear ${name},</p>
      <p>You have been successfully added to a new shift as <strong>${formatPositionName(userPosition)}</strong>.</p>
      <h3>Shift Details:</h3>
      <ul>
        <li><strong>Team Name:</strong> ${teamName}</li>
        <li><strong>Start Date:</strong> ${new Date(startDate).toLocaleString()}</li>
        <li><strong>End Date:</strong> ${new Date(endDate).toLocaleString()}</li>
      </ul>
      <h3>Assigned Users:</h3>
      
      ${assignedUsers.length > 0 ?
      `<table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #007BFF; color: white;">
            <th style="padding: 8px; text-align: left;">Name</th>
            <th style="padding: 8px; text-align: left;">Position</th>
          </tr>
        </thead>
        <tbody>
          ${assignedUsers.map(({ name, position }) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${formatPositionName(position)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`
      : `<p>No users have been assigned to this shift.</p>`
    }
      <p>You can view all your shifts by clicking the link below:</p>
      <p><a href="${websiteLink}" style="color: #007BFF;">View Shifts</a></p>
      <p>Best regards,</p>
      <p>The FRT Team</p>
    </div>
  `;

  const userAddress = process.env.USER;
  if (!userAddress) throw new Error('USER environment variable is not set');

  // Create .ics file content
  const icsContent = createIcsFile(shift, formatPositionName(userPosition));
  const icsFileName = 'shift_notification.ics';

  // Convert the ICS content to a Buffer
  const icsBuffer = Buffer.from(icsContent, 'utf-8');

  if (email === "sebastianmostert663@gmail.com") {
    await transporter.sendMail({
      from: {
        name, // Replace with your company name or dynamic value
        address: userAddress,
      },
      to: ["mosseb2007@gmail.com"],
      subject: 'Shift Added',
      html,
      attachments: [
        {
          filename: icsFileName,
          content: icsBuffer,
          contentType: 'text/calendar',
        },
      ],
    });
  }
};