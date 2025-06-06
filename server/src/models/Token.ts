import mongoose, { Schema, model, Document } from "mongoose";

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken: string;
  refreshExpiresAt: Date;
  updatedAt: Date;
  type: string;  
}

const tokenSchema = new Schema<IToken>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  accessToken: { type: String, required: true },
  accessExpiresAt: { type: Date, required: true },
  refreshToken: { type: String, required: true },
  refreshExpiresAt: { type: Date, required: true },
  updatedAt: { type: Date, default: Date.now },
  type: { type: String, required: true },  
});

// Adjust unique index to include `type` if you want to allow multiple tokens per user of different types
tokenSchema.index({ userId: 1, type: 1 }, { unique: true });

export const Token = model<IToken>("Token", tokenSchema);