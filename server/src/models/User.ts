import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  userName: { type: String, required: true, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", userSchema);