import { FastifyReply, FastifyRequest } from "fastify";
import jwt,{JwtPayload} from 'jsonwebtoken';
import {JWT_SECRETS} from '../../../config/config';

const JWT_SECRET: string = JWT_SECRETS;

interface AuthRequest extends FastifyRequest {
    user?: string | JwtPayload;
    cookies: {
        accessToken?: string
    }
}

export async function authMiddleware(
  request: AuthRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = request.cookies.accessToken;

    if (!token) {
      reply.status(401).send({ message: 'No access token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = decoded;
    
  } catch (error) {
    console.error('JWT Verification Error:', error);
    reply.status(401).send({ message: 'Invalid or expired access token' });
  }
}