import nodemailer from "nodemailer";
import type { MailOptions } from "../types/mail.types.js";

/**
 * Mail service for sending emails
 */
class MailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize the nodemailer transporter
   */
  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASSWORD,
      },
      logger: process.env.NODE_ENV !== "production",
      debug: process.env.NODE_ENV !== "production",
    });
  }

  async sendMail({ to, subject, text, html }: MailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to,
      subject,
      text,
      html,
    };
    console.log("Sending email to ", to);
    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully to ", to);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to send email: ${error.message}`);
        return;
      }
      console.error("Failed to send email");
      return;
    }
  }

  private getBaseTemplate(content: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>Swift Network Online</title>
      <style>
        /* Base styles */
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Container */
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        /* Header */
        .header {
          background-color: #164aa3;
          padding: 24px 0;
          text-align: center;
        }
        
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .logo {
          max-height: 50px;
          margin-bottom: 12px;
        }
        
        /* Content */
        .content {
          padding: 32px 24px;
          background-color: #ffffff;
        }
        
        /* Button */
        .button {
          display: inline-block;
          background-color: #16a34a;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 24px 0;
          text-align: center;
          transition: background-color 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .button:hover {
          background-color: #15803d;
        }
        
        /* Info box */
        .info-box {
          background-color: #f0fdf4;
          border-left: 4px solid #16a34a;
          padding: 16px;
          margin: 24px 0;
          border-radius: 4px;
        }
        
        /* Alert box */
        .alert-box {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 16px;
          margin: 24px 0;
          border-radius: 4px;
        }
        
        /* Status indicators */
        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-approved {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .status-pending {
          background-color: #fef9c3;
          color: #854d0e;
        }
        
        .status-rejected, .status-failed, .status-cancelled {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .status-completed {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        /* Amount */
        .amount {
          font-size: 32px;
          font-weight: 700;
          text-align: center;
          margin: 24px 0;
          color: #334155;
        }
        
        /* Plan */
        .plan {
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 16px;
        }
        
        /* Footer */
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        
        .social-links {
          margin: 16px 0;
        }
        
        .social-link {
          display: inline-block;
          margin: 0 8px;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            border-radius: 0;
          }
          
          .content {
            padding: 24px 16px;
          }
          
          .amount {
            font-size: 28px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://swiftnetworkonline.org/1116302.jpg " alt="Swift Network Online" class="logo" onerror="this.style.display='none'">
          <h1>Swift Network Online</h1>
        </div>
        
        ${content}
        
        <div class="footer">
          <div class="social-links">
            <a href="https://twitter.com/swiftnetworkonline" class="social-link">Twitter</a>
            <a href="https://facebook.com/swiftnetworkonline" class="social-link">Facebook</a>
            <a href="https://instagram.com/swiftnetworkonline" class="social-link">Instagram</a>
          </div>
          <p>&copy; ${new Date().getFullYear()} Swift Network Online. All rights reserved.</p>
          <p>Swift Network Online</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  async sendWelcomeEmail(
    email: string,
    firstName: string,
    accountNumber: string
  ): Promise<void> {
    const subject = `Welcome to Swift Network Online, ${firstName}!`;
    const { text, html } = this.getWelcomeEmailTemplate(
      firstName,
      accountNumber
    );

    await this.sendMail({
      to: email,
      subject,
      text,
      html,
    });
  }

  private getWelcomeEmailTemplate(
    firstName: string,
    accountNumber: string
  ): {
    text: string;
    html: string;
  } {
    const text = `
    Welcome to Swift Network Online, ${firstName}!
    Your account number is ${accountNumber}.
    `;
    const content = `
    <div class="content">
    <h3>Welcome to Swift Network Online, ${firstName}!</h2>
    <h4>Your account number is <b>${accountNumber}</b>.</h4>
    <p>Thank you for signing up for Swift Network Online. We are excited to have you on board.</p>
    <p>Please use the following link to login to your account: <a href="https://swiftnetworkonline.org/login">https://swiftnetworkonline.org/login</a></p>
    <p>If you have any questions, please contact us at <a href="mailto:support@swiftnetworkonline.org">support@swiftnetworkonline.org</a></p>
    <p>Thank you for choosing Swift Network Online.</p>
    <p>Best regards,</p>
    <p>Swift Network Online Team</p>
    `;
    const html = this.getBaseTemplate(content);
    return { text, html };
  }
}

export const mailService = new MailService();
