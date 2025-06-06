import { FastifyInstance } from "fastify";
import { User } from "../../models/User";
import { sendResetEmail } from "../../utils/mailer";
import { generateResetToken } from "../../utils/generateTokens"; // import the new function

export async function forgotPasswordRoute(fastify: FastifyInstance) {
  fastify.post("/auth/forgot-password", async (request, reply) => {
    try {
      //// making a request to taking email  from request.body
      const { email } = request.body as { email: string };

      // checkign that the user email exists in the db or not
      const user = await User.findOne({ email });
      if (!user) return reply.status(404).send({ message: "User not found" });

      // this will generate a ResetToken and will send the ResetToken to the email
      const resetToken = await generateResetToken(user._id as string, user.email);

      // sending the ResetToken to the user's email
      await sendResetEmail(email, resetToken);

      reply.send({ message: "Password reset link sent to your email" });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ message: "Internal server error" });
    }
  });
}