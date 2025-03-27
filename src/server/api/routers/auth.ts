import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  isFound: publicProcedure
    .input(z.object({ email: z.string().email("Invalid email address") }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });

      return {
        exists: !!user,
      };
    }),
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string().min(3, "Name is required"),
        email: z.string().email("Invalid email address"),
        passwordHash: z.string().min(6, "Password is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }),
});
