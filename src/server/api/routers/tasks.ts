import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const taskRouter = createTRPCRouter({
  // Procedure to get all users
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      select: {
        name: true,
      },
    });

    return users.map((user) => user.name);
  }),
  // Procedure to get all tasks
  getAllTasks: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.task.findMany({
      include: {
        createdBy: {
          select: {
            name: true, // Include the name of the user who created the task
          },
        },
      },
    });

    return tasks;
  }),
  // Procedure to create a task
  createTask: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        deadline: z.date().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
        status: z.enum(["TODO", "DONE", "PENDING", "ONGOING"]).default("TODO"),
        tags: z
          .array(
            z.enum([
              "DEVELOPMENT",
              "DESIGN",
              "TESTING",
              "REVIEW",
              "BUG",
              "FEATURE",
            ]),
          )
          .optional(),
        assignees: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session; // Assuming protectedProcedure provides user from session

      const task = await ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          deadline: input.deadline,
          priority: input.priority,
          status: input.status,
          tags: input.tags ?? [],
          assignees: input.assignees ?? [],
          createdById: user.id, // Link task to the authenticated user
        },
      });

      return task;
    }),
});
