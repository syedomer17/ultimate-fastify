import nodemailer from 'nodemailer';
import { email,password,from } from '../../config/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: password,
  },
});

export async function sendOtpEmail(email: string, otp: string) {
  const mailOptions = {
    from: `Your App <${from}>`,
    to: email,
    subject: 'Email Verification OTP',
    html: `<p>Your OTP for email verification is: <b>${otp}</b></p>
           <p>This code is valid for 10 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (err) {
    console.error('❌ Error sending OTP email:', err);
    throw new Error('Failed to send OTP email');
  }
}

export async function sendResetEmail(email: string, token: string) {
  const mailOptions = {
    from: `Your App <${from}>`,
    to: email,
    subject: 'Password Reset Token',
    html: `<p>You requested to reset your password.</p>
           <p>Your token: <b>${token}</b></p>
           <p>This token will expire in 10 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${email}`);
  } catch (err) {
    console.error('❌ Error sending reset email:', err);
    throw new Error('Failed to send reset email');
  }
}