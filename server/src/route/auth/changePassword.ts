import { FastifyInstance, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { User } from '../../models/User';
import { authMiddleware } from '../../controllers/middleware/auth';
import { JwtPayload } from 'jsonwebtoken';

interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}

interface AuthenticatedRequest<T = any> extends FastifyRequest {
  user?: string | JwtPayload;
  body: T;
}

export async function changePasswordRoute(fastify: FastifyInstance) {
  fastify.put<{
    Body: ChangePasswordBody
  }>(
    '/auth/change-password',
    {
      preHandler: authMiddleware,
      schema: {
        body: {
          type: 'object',
          required: ['oldPassword', 'newPassword'],
          properties: {
            oldPassword: { type: 'string' },
            newPassword: { type: 'string' },
          },
        },
      },
    },
    async (request: AuthenticatedRequest<ChangePasswordBody>, reply) => {
      try {
        //  making a request to taking oldPassword and newPassword from request.body
        const { oldPassword, newPassword } = request.body;

        // checking userId
        const userId = (request.user as JwtPayload)?.userId;

        // If userId not found
        if (!userId) {
          return reply.status(401).send({ message: 'Unauthorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
          return reply.status(404).send({ message: 'User not found' });
        }

        // checking that the oldPassword is correct or not
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return reply.status(400).send({ message: 'Old password is incorrect' });
        }

        // hashing the newPassword
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        reply.send({ message: '🔐 Password changed successfully' });
      } catch (err) {
        console.error('[CHANGE PASSWORD ERROR]:', err);
        reply.status(500).send({ message: 'Internal server error' });
      }
    }
  );
}