import fastify from 'fastify';
import { PORT } from '../config/config';
import dbConnect from './plugins/dbConnect';
import cookie from '@fastify/cookie';

// ✅ Import route handlers
import { signupRoute } from './route/auth/signup';
import { loginRoute } from './route/auth/login';
import { logoutRoute } from './route/auth/logout';
import { verifyEmailRoute } from './route/auth/verifyEmail';
import { refreshTokenRoute } from './route/auth/refresh-token';
import { forgotPasswordRoute } from './route/auth/forgotPassword';
import { resetPasswordRoute } from './route/auth/resetPassword';
import { changePasswordRoute } from './route/auth/changePassword';
import { profileRoute } from './route/profile';

import { userRoutes } from './controllers/private/user';

const app = fastify({ logger: true });

// ✅ Register Cookie Plugin BEFORE routes that use cookies
app.register(cookie, {
  secret: 'supersecret',
  parseOptions: {}
});

// ✅ Register DB connection
app.register(dbConnect);

// ✅ Hello World
app.get('/', async (request, reply) => {
  reply.status(200).send({ message: `Hello World` });
});

// ✅ Register Routes
app.register(signupRoute);
app.register(loginRoute);
app.register(logoutRoute);
app.register(verifyEmailRoute);
app.register(refreshTokenRoute);
app.register(forgotPasswordRoute);
app.register(resetPasswordRoute);
app.register(changePasswordRoute);
app.register(profileRoute);
app.register(userRoutes);

// ✅ Start Server
const startApp = async () => {
  try {
    await app.listen({ port: PORT, host: 'localhost' });
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

startApp();