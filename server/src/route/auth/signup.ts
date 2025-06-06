import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { User } from "../../models/User";
import { OtpVerification } from "../../models/OtpVerification";
import { generateOtp } from "../../utils/generateOtp";
import { sendOtpEmail } from "../../utils/mailer";

export async function signupRoute(fastify: FastifyInstance) {
  fastify.post("/auth/signup", async (request, reply) => {
    try {
      const { userName, email, password } = request.body as {
        userName: string;
        email: string;
        password: string;
      };

      // checking if the email exists in the db
      const existingUser = await User.findOne({ email });

      // if exists then
      if (existingUser) {
        return reply.status(400).send({ message: "Email already exists" });
      }

      // checking if the userName exists in the db
      const existingUserName = await User.findOne({ userName });

      // if exists then
      if (existingUserName) {
        return reply
          .status(400)
          .send({
            message: "UserName already exists please try a different UserName.",
          });
      }

      // hasshing the user password
      const hashedPassword = await bcrypt.hash(password, 10);

      // creating a new user
      const user = await User.create({
        userName,
        email,
        password: hashedPassword,
        isEmailVerified: false,
      });

      // generating the otp from emailVerification
      const otp = generateOtp();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // expirys 10 minutes

      await OtpVerification.create({
        userId: user._id as string,
        otp,
        expiresAt: expiry,
      });

      // sending the otp to the email
      await sendOtpEmail(email, otp);

      // sending the user inforamtion after the successful signup
      return reply.send({
        message: "Signup successful. Please verify your email.",
        user: {
          userId: user._id as string,
          name: userName,
          email: email,
        },
      });
    } catch (error) {
      console.log(error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  });
}
