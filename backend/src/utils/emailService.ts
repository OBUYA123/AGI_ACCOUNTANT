import nodemailer from "nodemailer";
import config from "../config";
import logger from "./logger";

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

/**
 * Send email
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"AGI Accountant" <${config.email.user}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent successfully to ${to}`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to send email to ${to}:`, error);
    return false;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  const subject = "Welcome to Smart AGI Accountant Platform";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9, #a855f7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to AGI Accountant! 🎓</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Thank you for joining Smart AGI Accountant Platform. We're excited to help you on your CPA journey!</p>
          
          <h3>What's Next?</h3>
          <ul>
            <li>📚 Explore our comprehensive CPA course</li>
            <li>🤖 Chat with our AI Finance Assistant</li>
            <li>🧮 Use professional accounting tools</li>
            <li>📊 Track your progress</li>
          </ul>
          
          <a href="${config.frontend.url}/dashboard" class="button">Go to Dashboard</a>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br>The AGI Accountant Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Smart AGI Accountant Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmation = async (
  email: string,
  firstName: string,
  amount: number,
  currency: string,
  transactionId: string
): Promise<boolean> => {
  const subject = "Payment Confirmation - Course Access Granted";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .receipt { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Payment Successful</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Your payment has been processed successfully. You now have full access to the CPA course!</p>
          
          <div class="receipt">
            <h3>Payment Receipt</h3>
            <div class="receipt-row">
              <span>Amount:</span>
              <strong>${currency} ${amount.toFixed(2)}</strong>
            </div>
            <div class="receipt-row">
              <span>Transaction ID:</span>
              <strong>${transactionId}</strong>
            </div>
            <div class="receipt-row">
              <span>Date:</span>
              <strong>${new Date().toLocaleDateString()}</strong>
            </div>
          </div>
          
          <a href="${
            config.frontend.url
          }/courses" class="button">Start Learning Now</a>
          
          <p>Keep this email for your records. If you have any questions, please contact support.</p>
          
          <p>Best regards,<br>The AGI Accountant Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Smart AGI Accountant Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};

/**
 * Send course completion certificate email
 */
export const sendCertificateEmail = async (
  email: string,
  firstName: string,
  courseTitle: string,
  certificateId: string
): Promise<boolean> => {
  const subject = "🎓 Congratulations! Course Certificate";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #10b981); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
        .certificate-box { background: white; padding: 30px; border-radius: 10px; margin: 20px 0; border: 3px solid #f59e0b; }
        .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Congratulations!</h1>
          <p style="font-size: 18px;">You've completed the course</p>
        </div>
        <div class="content">
          <h2>Well Done, ${firstName}!</h2>
          <p>You have successfully completed:</p>
          
          <div class="certificate-box">
            <h3 style="color: #f59e0b; margin: 0;">${courseTitle}</h3>
            <p style="color: #666; margin: 10px 0;">Certificate ID: ${certificateId}</p>
          </div>
          
          <p>Your certificate is now available for download.</p>
          
          <a href="${config.frontend.url}/certificates/${certificateId}" class="button">Download Certificate</a>
          
          <p>Keep learning and advancing your career!</p>
          
          <p>Best regards,<br>The AGI Accountant Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Smart AGI Accountant Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPaymentConfirmation,
  sendCertificateEmail,
};
