import { Schema, model, Document, Types } from 'mongoose';

export interface IOtp extends Document {
  userId: Types.ObjectId;
  otp: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export const OtpVerification = model<IOtp>('OtpVerification', otpSchema);