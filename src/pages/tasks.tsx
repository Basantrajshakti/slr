"use client";

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
import { useZustandStore } from "~/stores/useLoadingStore";
import { toastOptions } from "~/constants/helpers";

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
interface TaskWithCreator {
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

const Tasks = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setUserNames, userNames: allAssignees } = useZustandStore();
  const utils = api.useUtils();
  const [tasksList, setTasksList] = useState<TaskWithCreator[]>([]);

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
      const result = await utils.client.tasks.createTask.mutate(taskData);

      if (!result.id) {
        throw new Error("");
      }

      setTasksList((prevTask) => [...prevTask, result as TaskWithCreator]);
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
    async function getAllUsers() {
      try {
        const tasks = await utils.client.tasks.getAllTasks.query();
        if (tasks.length) {
          console.log(tasks);
          setTasksList(tasks);
        }

        const userNames = await utils.client.tasks.getAllUsers.query();
        if (userNames?.length) {
          // console.log(userNames);
          setUserNames(userNames);
        }
      } catch (error) {
        console.log("Error accessing resource:", error);
      }
    }

    getAllUsers();
  }, []);

  return (
    <div className={`font-sans ${inter.variable}`}>
      <div className="flex items-center justify-between border-b p-2">
        <Button onClick={() => setIsDialogOpen(true)}>New Task</Button>
      </div>

      <div className="p-2">
        {!tasksList.length ? (
          <p className="mt-20 text-center">Oops! No tasks to show</p>
        ) : (
          <TaskTable tasks={tasksList} />
        )}
      </div>

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
                          {allAssignees
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
    </div>
  );
};

export default Tasks;

const TaskTable = ({ tasks }: { tasks: TaskWithCreator[] }) => {
  return (
    <div className="h-[calc(99vh-62px)] overflow-x-auto overflow-y-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="!w-[100px] px-4 py-2">Title</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Deadline</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Tags</th>
            <th className="px-4 py-2">Assignees</th>
            <th className="whitespace-nowrap px-4 py-2">Created By</th>
            <th className="whitespace-nowrap px-4 py-2">Created At</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b text-sm hover:bg-gray-50">
              {/* Title with hover buttons */}
              <td className="!w-[100px] px-4 py-2">
                <div className="block max-w-[200px] truncate ">
                  {task.title}
                </div>
              </td>

              {/* Description */}
              <td className=" max-w-[200px] truncate px-4 py-2">
                {task.description}
              </td>

              {/* Deadline */}
              <td className="px-4 py-2">
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "N/A"}
              </td>

              {/* Priority */}
              <td className="px-4 py-2">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    task.priority === "URGENT"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "HIGH"
                        ? "bg-orange-100 text-orange-800"
                        : task.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.priority}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-2">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    task.status === "DONE"
                      ? "bg-green-100 text-green-800"
                      : task.status === "ONGOING"
                        ? "bg-blue-100 text-blue-800"
                        : task.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status}
                </span>
              </td>

              {/* Tags */}
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>

              {/* Assignees */}
              <td className="px-4 py-2">
                <div className="flex -space-x-2">
                  {task.assignees.map((assignee, index) => {
                    const initials = assignee
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <div
                        key={index}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white"
                        title={assignee}
                      >
                        {initials}
                      </div>
                    );
                  })}
                </div>
              </td>

              {/* Created By */}
              <td className="px-4 py-2">{task.createdBy.name}</td>

              {/* Created At */}
              <td className="px-4 py-2">
                {new Date(task.createdAt).toLocaleDateString()}
              </td>

              {/* Created At */}
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  {/* View button */}
                  <Button className="h-8 rounded-full bg-slate-200 p-2 hover:bg-slate-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g fill="none" stroke="black" strokeWidth="1.5">
                        <path
                          strokeLinecap="round"
                          d="M9 4.46A9.8 9.8 0 0 1 12 4c4.182 0 7.028 2.5 8.725 4.704C21.575 9.81 22 10.361 22 12c0 1.64-.425 2.191-1.275 3.296C19.028 17.5 16.182 20 12 20s-7.028-2.5-8.725-4.704C2.425 14.192 2 13.639 2 12c0-1.64.425-2.191 1.275-3.296A14.5 14.5 0 0 1 5 6.821"
                        />
                        <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z" />
                      </g>
                    </svg>
                  </Button>
                  {/* Edit button */}
                  <Button className="h-8 rounded-full bg-slate-200 p-2 hover:bg-slate-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="green"
                        d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-1 2q-.425 0-.712-.288T3 20v-2.425q0-.4.15-.763t.425-.637L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.437.65T21 6.4q0 .4-.138.763t-.437.662l-12.6 12.6q-.275.275-.638.425t-.762.15zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z"
                      />
                    </svg>
                  </Button>
                  {/* Delete button */}
                  <Button className="h-8 rounded-full bg-slate-200 p-2 hover:bg-slate-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g fill="none">
                        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                        <path
                          fill="red"
                          d="M20 5a1 1 0 1 1 0 2h-1l-.003.071l-.933 13.071A2 2 0 0 1 16.069 22H7.93a2 2 0 0 1-1.995-1.858l-.933-13.07L5 7H4a1 1 0 0 1 0-2zm-3.003 2H7.003l.928 13h8.138zM14 2a1 1 0 1 1 0 2h-4a1 1 0 0 1 0-2z"
                        />
                      </g>
                    </svg>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
