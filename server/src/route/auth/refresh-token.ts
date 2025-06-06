import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { Token } from "../../models/Token";
import { User } from "../../models/User";
import { JWT_SECRETS } from "../../../config/config";
import {NODE_ENV} from '../../../config/config'

const JWT_SECRET = JWT_SECRETS || "";

export async function refreshTokenRoute(fastify: FastifyInstance) {
  fastify.post("/auth/refresh-token", async (request, reply) => {
    try {
      const { refreshToken } = request.cookies;

      if (!refreshToken) {
        return reply.status(401).send({ message: "Refresh token missing" });
      }

      // Verify refresh token
      let decoded: { userId: string; email: string };
      try {
        decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; email: string };
      } catch (error) {
        return reply.status(403).send({ message: "Invalid refresh token" });
      }

      // Find token record for user
      const tokenRecord = await Token.findOne({ userId: decoded.userId });

      if (
        !tokenRecord ||
        tokenRecord.refreshToken !== refreshToken ||
        tokenRecord.refreshExpiresAt < new Date()
      ) {
        return reply.status(403).send({ message: "Invalid or expired refresh token" });
      }

      // Verify user exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }

      const now = new Date();
      const payload = {
        userId: user._id as string,
        email: user.email,
      };

      // Generate new tokens
      const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
      const newRefreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

      // Calculate expiry dates
      const accessExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const refreshExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Update token document with new tokens and expiry
      await Token.findOneAndUpdate(
        { userId: user._id },
        {
          accessToken: newAccessToken,
          accessExpiresAt,
          refreshToken: newRefreshToken,
          refreshExpiresAt,
          updatedAt: now,
        },
        { upsert: true, new: true }
      );

      // Set cookies
      reply
        .setCookie("accessToken", newAccessToken, {
          httpOnly: true,
          path: "/",
          expires: accessExpiresAt,
          sameSite: "strict",
          secure: NODE_ENV === "production",
        })
        .setCookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          path: "/",
          expires: refreshExpiresAt,
          sameSite: "strict",
          secure: NODE_ENV === "production",
        })
        .send({
          message: "Token refreshed successfully",
          token: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        });
    } catch (err) {
      console.error("[REFRESH TOKEN ERROR]:", err);
      reply.status(500).send({ message: "Internal server error" });
    }
  });
}