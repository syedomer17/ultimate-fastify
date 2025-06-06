import { FastifyInstance } from 'fastify';
import { User } from '../../models/User';
import { OtpVerification } from '../../models/OtpVerification';

export async function verifyEmailRoute(fastify: FastifyInstance) {
  fastify.post('/auth/verify-email', async (request, reply) => {
    try {
      const { email, otp } = request.body as { email: string; otp: string };

      const user = await User.findOne({ email });
      if (!user) return reply.status(404).send({ message: 'User not found' });

      const record = await OtpVerification.findOne({ userId: user._id, otp });
      if (!record) return reply.status(400).send({ message: 'Invalid OTP' });

      if (record.expiresAt < new Date()) {
        return reply.status(400).send({ message: 'OTP expired' });
      }

      user.isEmailVerified = true;
      await user.save();

      await OtpVerification.deleteMany({ userId: user._id }); // clean up

      return reply.send({ message: 'Email verified successfully' });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });
}