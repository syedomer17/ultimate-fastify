import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import { User } from "../../models/User";
import { Token } from "../../models/Token";
import jwt from "jsonwebtoken";
import { JWT_SECRETS } from "../../../config/config";
import {NODE_ENV} from "../../../config/config";

const JWT_SECRET = JWT_SECRETS || "";

export async function loginRoute(fastify: FastifyInstance) {
  fastify.post(
    "/auth/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: { email: string; password: string } }>,
      reply: FastifyReply
    ) => {
      try {
        // making a request to taking email and password from request.body
        const { email, password } = request.body;

        // checking that the user email exists in the db or not
        const user = await User.findOne({ email });

        // if the user don't exists then
        if (!user) {
          reply.status(400).send({ message: "User not found" });
        }

        // checking that the user have Verified the email
        if (!user?.isEmailVerified) {
          return reply
            .status(403)
            .send({ message: "Please verify your email first" });
        }

        // checkign the password is valid or not
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // if not then
        if (!isPasswordValid) {
          return reply.status(401).send({ message: "Invalid credentials" });
        }

        //playload
        const playload = {
          userId: user._id as string,
          email: user.email,
        };

        const now = new Date();

        // Generate tokens with expiry
        const accessToken = jwt.sign(playload, JWT_SECRET, { expiresIn: "7d" }); // expiresIn 7 days
        const refreshToken = jwt.sign(playload, JWT_SECRET, {
          expiresIn: "30d",
        }); // expiresIn 30 days

        const accessExpiresAt = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        const refreshExpiresAt = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        // Upsert token document for the user
        await Token.updateOne(
          { userId: user._id },
          {
            userId: user._id,
            accessToken,
            accessExpiresAt,
            refreshToken,
            refreshExpiresAt,
            updatedAt: now,
          },
          { upsert: true }
        );

        // Set cookies & send response
        reply
          .setCookie("accessToken", accessToken, {
            httpOnly: true,
            path: "/",
            expires: accessExpiresAt,
            sameSite: "strict",
            secure: NODE_ENV === "production",
          })
          .setCookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/",
            expires: refreshExpiresAt,
            sameSite: "strict",
            secure: NODE_ENV === 'production',
          })
          .send({
            message: "Login successful",
            user: {
              userId: user._id,
              name: user.userName,
              email: user.email,
            },
            token: {
              accessToken,
              refreshToken,
            },
          });
      } catch (error) {
        console.error("[LOGIN ERROR]:", error);
        reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
}
