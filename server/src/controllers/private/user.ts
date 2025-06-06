import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { User, IUser } from "../../models/User";
import { authMiddleware } from "../middleware/auth";

interface ParamsWithId {
  id: string;
}

interface EditUserRequest {
  Params: ParamsWithId;
  Body: Partial<IUser>;
}

interface IdParamsRequest {
  Params: ParamsWithId;
}

export async function userRoutes(fastify: FastifyInstance) {
  // Get all users (auth protected)
  fastify.get("/getallusers", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const users = await User.find();
      return reply.status(200).send(users);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  });

  // Get user by ID (auth protected)
  fastify.get("/getuserbyid/:id", { preHandler: authMiddleware }, async (request: FastifyRequest<IdParamsRequest>, reply) => {
    try {
      const user = await User.findById(request.params.id);
      if (!user) {
        return reply.status(404).send({ message: "User not found." });
      }
      return reply.status(200).send(user);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  });

  // Delete all users (auth protected)
  fastify.delete("/deleteall", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      await User.deleteMany();
      return reply.status(200).send({ message: "All users deleted successfully" });
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  });

  // Delete user by ID (auth protected)
  fastify.delete("/deletebyid/:id", { preHandler: authMiddleware }, async (request: FastifyRequest<IdParamsRequest>, reply) => {
    try {
      const user = await User.findByIdAndDelete(request.params.id);
      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }
      return reply.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  });

  // Edit user by ID (auth protected)
  fastify.put("/editbyid/:id", { preHandler: authMiddleware }, async (request: FastifyRequest<EditUserRequest>, reply) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(request.params.id, request.body, { new: true });
      if (!updatedUser) {
        return reply.status(404).send({ message: "User not found" });
      }
      return reply.status(200).send(updatedUser);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  });
}