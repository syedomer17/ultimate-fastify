import jwt from "jsonwebtoken";
import { Token } from "../models/Token";
import { JWT_SECRETS } from "../../config/config";

const JWT_SECRET = JWT_SECRETS || "";

export async function generateResetToken(userId: string, email: string) {
  // Generate JWT reset token with 10 mins expiry
  const resetToken = jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: "10m" }
  );

  // Calculate expiry date
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  // Create or update token document with type = 'reset'
  await Token.findOneAndUpdate(
    { userId, type: "reset" },
    {
      userId,
      accessToken: "",             // no access token for reset token
      accessExpiresAt: new Date(0),
      refreshToken: resetToken,
      refreshExpiresAt: expiresAt,
      type: "reset",
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return resetToken;
}