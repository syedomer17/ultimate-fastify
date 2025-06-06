import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../controllers/middleware/auth';
import { JwtPayload } from 'jsonwebtoken';

interface AuthenticatedRequest extends FastifyRequest {
  user?: string | JwtPayload;
}

export async function profileRoute(fastify: FastifyInstance) {
  fastify.get(
    '/profile',
    { preHandler: authMiddleware },
    async (req: AuthenticatedRequest, res) => {
      const user = req.user;
      return res.send({ message: '🔐 Secure content', user });
    }
  );
}