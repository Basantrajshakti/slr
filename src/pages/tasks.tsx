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

type TaskFormData = z.infer<typeof taskSchema>;

const Tasks = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setUserNames, userNames: allAssignees } = useZustandStore();
  const utils = api.useUtils();

  console.log(allAssignees);

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
      // Simulate API call (replace with actual tRPC or API call)
      const taskData = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        assignees: data.assignees
          ? data.assignees.split(",").map((m) => m.trim())
          : [],
      };
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log("Task submitted:", taskData);

      toast.success("Task created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      form.reset();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error creating task:", errorMessage);
      toast.error(errorMessage || "Failed to create task. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    async function getAllUsers() {
      try {
        const userNames = await utils.client.tasks.getAllUsers.query();
        if (userNames?.length) {
          // console.log(userNames);
          setUserNames(userNames);
        }

        const test = await utils.client.tasks.getAllTasks.query();
        console.log(test, "test-task-get");
      } catch (error) {
        console.log("Error accessing resource:", error);
      }
    }

    getAllUsers();
  }, []);

  return (
    <div className={`p-4 font-sans ${inter.variable}`}>
      <header className="mb-6 flex items-center justify-between">
        <Button onClick={() => setIsDialogOpen(true)}>New Task</Button>
      </header>

      <div>Tasks</div>

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
