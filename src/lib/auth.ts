import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import db from "@/db";
import { mailService } from "@/mail";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const subject = "Verify your email address - Swift Network Online";
      const html = `
        <div class="content">
          <h3>Email Verification Required</h3>
          <p>Hello ${user.name},</p>
          <p>Thank you for signing up with Swift Network Online. To complete your registration and access your account, please verify your email address by clicking the button below:</p>
          <a href="${url}" class="button">Verify Email Address</a>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p><a href="${url}">${url}</a></p>
          <p>This verification link will expire in 24 hours for security reasons.</p>
          <p>If you didn't create an account with Swift Network Online, please ignore this email.</p>
          <p>Best regards,<br>Swift Network Online Team</p>
        </div>
      `;
      const text = `
        Email Verification Required
        
        Hello ${user.name},
        
        Thank you for signing up with Swift Network Online. To complete your registration and access your account, please verify your email address by visiting this link:
        
        ${url}
        
        This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with Swift Network Online, please ignore this email.
        
        Best regards,
        Swift Network Online Team
      `;

      await mailService.sendMail({
        to: user.email,
        subject,
        html,
        text,
      });
    },
    sendOnSignUp: true,
  },
  plugins: [admin()],
});
