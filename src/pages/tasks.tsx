import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "react-toastify";
import { api } from "~/utils/api";
import { inter } from "./_app";
import { toastOptions } from "~/constants/helpers";
import { type GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import { type Session } from "next-auth";
import TaskTable from "~/components/taskTable";

// New - to move
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { useZustandStore } from "~/stores/useLoadingStore";

// Task schema for validation
const taskSchema = z.object({
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
  deadline: Date | null; // From Task model: DateTime? (optional)
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

type TaskFormData = z.infer<typeof taskSchema>;

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

  const [tasksList, setTasksList] = useState<TaskWithCreator[]>(tasks || []);

  const [action, setAction] = useState<Action>(DEFAULT_ACTIONS);

  const clearAction = () => {
    setAction(DEFAULT_ACTIONS);
  };

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
        tasksList={tasksList}
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

interface TaskDialogProps {
  action: Action;
  userNames: string[];
  tasksList: TaskWithCreator[];
  setTasksList: React.Dispatch<React.SetStateAction<TaskWithCreator[]>>;
  clearAction: () => void;
}

const TaskDialog = ({
  action,
  userNames,
  tasksList,
  setTasksList,
  clearAction,
}: TaskDialogProps) => {
  const setLoading = useZustandStore((state) => state.setLoading);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>();
  const session = useSession();
  const utils = api.useUtils();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      deadline: "",
      priority: "MEDIUM",
      status: "TODO",
      tags: [],
      assignees: "",
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        assignees: data.assignees
          ? data.assignees.split(",").map((m) => m.trim())
          : [],
      };
      const result = (await utils.client.tasks.createTask.mutate(
        taskData,
      )) as TaskWithCreator;

      if (!result.id) {
        throw new Error("");
      }

      result.createdBy = {
        name: session?.data?.user?.name || "",
      };

      setTasksList((prevTask) => [...prevTask, result]);
      toast.success("Task created successfully!", toastOptions);
      form.reset();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error creating task:", errorMessage);
      toast.error(
        errorMessage || "Failed to create task. Please try again.",
        toastOptions,
      );
    }
  };

  useEffect(() => {
    const { mode } = action;
    if (mode === "create" || mode === "edit" || mode === "view")
      setIsDialogOpen(true);
  }, [action]);

  useEffect(() => {
    if (deleteTaskId) {
      setLoading(true);
      console.log({ deleteTaskId });

      setTasksList((prevList) =>
        prevList.filter((task) => task.id !== deleteTaskId),
      );
      setDeleteTaskId("");
      clearAction();
      setLoading(false);
    }
  }, [deleteTaskId, clearAction]);

  return (
    <>
      {/* Delete Alert */}
      <AlertDialog open={action.mode === "delete"} onOpenChange={clearAction}>
        <AlertDialogContent className={`font-sans ${inter.variable}`}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Proceed with caution.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={clearAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDeleteTaskId(action.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={`max-h-[90vh] overflow-y-auto font-sans sm:max-w-[625px] ${inter.variable}`}
        >
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4 sm:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="ONGOING">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Assignees */}
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="assignees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignees</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const currentAssignees = field.value
                            ? field.value.split(",").map((a) => a.trim())
                            : [];
                          if (!currentAssignees.includes(value)) {
                            field.onChange(
                              [...currentAssignees, value].join(","),
                            );
                          }
                        }}
                        value={undefined} // Multi-select hack
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignees" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userNames
                            .filter(
                              (assignee) => !field.value?.includes(assignee),
                            )
                            .map((assignee) => (
                              <SelectItem key={assignee} value={assignee}>
                                {assignee}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-2">
                        {field.value?.split(",").map(
                          (assignee) =>
                            assignee.trim() && (
                              <span
                                key={assignee}
                                className="mb-2 mr-2 inline-flex items-center rounded bg-gray-200 px-2 py-1 text-sm"
                              >
                                {assignee}
                                <button
                                  type="button"
                                  onClick={() =>
                                    field.onChange(
                                      field.value
                                        ?.split(",")
                                        .filter((a) => a.trim() !== assignee)
                                        .join(","),
                                    )
                                  }
                                  className="ml-1 text-red-600"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 15 15"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M3.64 2.27L7.5 6.13l3.84-3.84A.92.92 0 0 1 12 2a1 1 0 0 1 1 1a.9.9 0 0 1-.27.66L8.84 7.5l3.89 3.89A.9.9 0 0 1 13 12a1 1 0 0 1-1 1a.92.92 0 0 1-.69-.27L7.5 8.87l-3.85 3.85A.92.92 0 0 1 3 13a1 1 0 0 1-1-1a.9.9 0 0 1 .27-.66L6.16 7.5L2.27 3.61A.9.9 0 0 1 2 3a1 1 0 0 1 1-1c.24.003.47.1.64.27"
                                    />
                                  </svg>
                                </button>
                              </span>
                            ),
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Tags */}
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => {
                    const allTags = [
                      "DEVELOPMENT",
                      "DESIGN",
                      "TESTING",
                      "REVIEW",
                      "BUG",
                      "FEATURE",
                    ] as const; // Match TaskTag enum

                    return (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <Select
                          onValueChange={(value: any) => {
                            const currentTags = field.value || [];
                            if (!currentTags.includes(value)) {
                              field.onChange([...currentTags, value]);
                            }
                          }}
                          value={undefined} // Multi-select hack
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tags" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allTags
                              .filter((tag) => !field.value?.includes(tag))
                              .map((tag) => (
                                <SelectItem key={tag} value={tag}>
                                  {tag}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-2">
                          {field.value?.map((tag) => (
                            <span
                              key={tag}
                              className="mb-2 mr-2 inline-flex items-center rounded bg-gray-200 px-2 py-1 text-sm"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() =>
                                  field.onChange(
                                    field.value?.filter((t) => t !== tag),
                                  )
                                }
                                className="ml-1 text-red-600"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 15 15"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M3.64 2.27L7.5 6.13l3.84-3.84A.92.92 0 0 1 12 2a1 1 0 0 1 1 1a.9.9 0 0 1-.27.66L8.84 7.5l3.89 3.89A.9.9 0 0 1 13 12a1 1 0 0 1-1 1a.92.92 0 0 1-.69-.27L7.5 8.87l-3.85 3.85A.92.92 0 0 1 3 13a1 1 0 0 1-1-1a.9.9 0 0 1 .27-.66L6.16 7.5L2.27 3.61A.9.9 0 0 1 2 3a1 1 0 0 1 1-1c.24.003.47.1.64.27"
                                  />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              {/* Description */}
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Task details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full sm:col-span-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
