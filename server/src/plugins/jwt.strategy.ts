import { FastifyInstance } from 'fastify';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import {JWT_SECRETS} from '../../config/config';

export default async function passportJwtPlugin(fastify: FastifyInstance) {
  const secret = JWT_SECRETS;

  const strategy = new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    },
    async (payload, done) => {
      try {
        // Custom user validation logic
        const user = { userId: payload.userId, email: payload.email };
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  );

  passport.use(strategy);
  fastify.decorate('passport', passport);
}