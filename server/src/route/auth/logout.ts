// routes/auth/logout.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Token } from '../../models/Token';

interface LogoutRequest extends FastifyRequest {
  cookies: {
    accessToken?: string;
    refreshToken?: string;
  };
}

export async function logoutRoute(fastify: FastifyInstance) {
  fastify.post('/auth/logout', async (request: LogoutRequest, reply: FastifyReply) => {
    try {
      const { accessToken, refreshToken } = request.cookies;

      if (!accessToken && !refreshToken) {
        return reply.status(400).send({ message: 'No tokens found to logout' });
      }

      // Remove tokens from DB
      if (accessToken) {
        await Token.deleteOne({ token: accessToken, type: 'access' });
      }
      if (refreshToken) {
        await Token.deleteOne({ token: refreshToken, type: 'refresh' });
      }

      // Clear cookies
      reply
        .clearCookie('accessToken', { path: '/' })
        .clearCookie('refreshToken', { path: '/' })
        .send({ message: 'Logged out successfully' });

    } catch (err) {
      console.error('Logout error:', err);
      reply.status(500).send({ message: 'Internal server error' });
    }
  });
}