import { FastifyInstance } from "fastify";
import { PasswordResetToken } from "../../models/PasswordResetToken";
import { User } from "../../models/User";
import bcrypt from "bcrypt";

export async function resetPasswordRoute(fastify: FastifyInstance) {
  fastify.post("/auth/reset-password", async (request, reply) => {
    try {
      const { resetToken, newPassword } = request.body as {
        resetToken: string;
        newPassword: string;
      };

      const tokenDoc = await PasswordResetToken.findOne({ token: resetToken });
      if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
        return reply.status(400).send({ message: "Invalid or expired reset token" });
      }

      const user = await User.findById(tokenDoc.userId);
      if (!user) return reply.status(404).send({ message: "User not found" });

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      await PasswordResetToken.deleteOne({ _id: tokenDoc._id }); // remove used token

      reply.send({ message: "Password reset successfully" });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ message: "Internal server error" });
    }
  });
}