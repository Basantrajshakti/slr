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
      const {
        user: { email },
      } = ctx.session; // Assuming protectedProcedure provides user from session

      const user = await ctx.db.user.findUnique({
        where: { email: email ?? "" },
        select: { id: true },
      });

      // console.log(input);
      const task = await ctx.db.task.create({
        data: {
          title: input.title ?? "Task",
          description: input.description,
          deadline: input.deadline,
          priority: input.priority,
          status: input.status,
          tags: input.tags ?? [],
          assignees: input.assignees ?? [],
          createdById: user?.id ?? "",
        },
      });

      return task;
    }),
  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.string().min(3, "Task ID is required"), // Added ID field
        title: z.string().min(3, "Title is required"),
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
      const existingTask = await ctx.db.task.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          createdById: true,
        },
      });

      if (!existingTask) {
        throw new Error("Task not found");
      }

      // Update the task with the new input data
      const updatedTask = await ctx.db.task.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          deadline: input.deadline,
          priority: input.priority,
          status: input.status,
          tags: input.tags ?? [],
          assignees: input.assignees ?? [],
          updatedAt: new Date(),
        },
      });

      return updatedTask;
    }),
  deleteTask: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Task ID is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingTask = await ctx.db.task.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          createdById: true,
        },
      });

      if (!existingTask) {
        throw new Error("Task not found");
      }

      // Delete the task
      const deletedTask = await ctx.db.task.delete({
        where: { id: input.id },
      });

      return {
        id: deletedTask.id,
        message: "Task deleted successfully",
      };
    }),
});
