import mongoose, { Schema, model, Document } from "mongoose";

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;          // The actual reset token string
  expiresAt: Date;        // Expiration date/time
  createdAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const PasswordResetToken = model<IPasswordResetToken>(
  "PasswordResetToken",
  passwordResetTokenSchema
);