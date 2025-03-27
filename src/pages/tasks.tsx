import React, { useEffect, useState } from "react";
import * as z from "zod";
import { Button } from "~/components/ui/button";

import { inter } from "./_app";
import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import { type Session } from "next-auth";
import TaskTable from "~/components/taskTable";

import TaskDialog from "~/components/taskDialog";

// Task schema for validation
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  deadline: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
    required_error: "Priority is required",
  }),
  status: z.enum(["TODO", "DONE", "PENDING", "ONGOING"], {
    required_error: "Status is required",
  }),
  tags: z
    .array(
      z.enum(["DEVELOPMENT", "DESIGN", "TESTING", "REVIEW", "BUG", "FEATURE"]),
    )
    .optional(),
  assignees: z.string().optional(), // Will split into array on submit
});

// Represents the shape of a single task returned by getAllTasks
export interface TaskWithCreator {
  id: string; // From Task model: String @id @default(cuid())
  title: string; // From Task model: String
  description: string | null; // From Task model: String? (optional)
  deadline: Date | undefined; // From Task model: DateTime? (optional)
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; // From TaskPriority enum
  status: "TODO" | "DONE" | "PENDING" | "ONGOING"; // From TaskStatus enum
  tags: ("DEVELOPMENT" | "DESIGN" | "TESTING" | "REVIEW" | "BUG" | "FEATURE")[]; // From TaskTag enum array
  assignees: string[]; // From Task model: String[]
  createdAt: Date; // From Task model: DateTime @default(now())
  updatedAt: Date; // From Task model: DateTime @updatedAt
  createdById: string; // From Task model: String (foreign key to User.id)
  createdBy: {
    name: string; // Selected from User model via include
  };
}

export type TaskFormData = z.infer<typeof taskSchema>;

interface TasksProps {
  session: Session;
  tasks: string; // Extending Task with createdBy
  userNames: string[];
}

export interface Action {
  mode: null | "create" | "edit" | "view" | "delete";
  id: string | null;
}

const DEFAULT_ACTIONS = {
  mode: null,
  id: null,
};

const Tasks = (props: TasksProps) => {
  const { tasks: strTasks, userNames } = props;
  const tasks: TaskWithCreator[] = JSON.parse(strTasks || "[]");
  const [taskToView, setTaskToView] = useState<TaskWithCreator>(
    {} as TaskWithCreator,
  );

  const [tasksList, setTasksList] = useState<TaskWithCreator[]>(tasks || []);

  const [action, setAction] = useState<Action>(DEFAULT_ACTIONS);

  const clearAction = () => {
    setAction(DEFAULT_ACTIONS);
  };

  useEffect(() => {
    if (action.mode === "view" || action.mode === "edit") {
      setTaskToView(tasksList.find((task) => task.id === action.id)!);
    }
  }, [action, tasksList]);

  return (
    <div className={`font-sans ${inter.variable}`}>
      <div className="flex items-center justify-between border-b p-2">
        <Button
          onClick={() =>
            setAction({
              id: null,
              mode: "create",
            })
          }
        >
          New Task
        </Button>
      </div>

      <div className="p-2">
        {!tasksList.length ? (
          <p className="mt-20 text-center">Oops! No tasks to show</p>
        ) : (
          <TaskTable tasks={tasksList} setAction={setAction} />
        )}
      </div>

      <TaskDialog
        action={action}
        userNames={userNames}
        taskToView={taskToView}
        setTasksList={setTasksList}
        clearAction={clearAction}
      />
    </div>
  );
};

export default Tasks;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  const prisma = new PrismaClient();
  const tasks = await prisma.task.findMany({
    include: {
      createdBy: {
        select: {
          name: true, // Include the name of the user who created the task
        },
      },
    },
  });

  const users = await prisma.user.findMany({
    select: {
      name: true,
    },
  });

  return {
    props: {
      session,
      tasks: JSON.stringify(tasks),
      userNames: users.map((user) => user.name),
    },
  };
}
