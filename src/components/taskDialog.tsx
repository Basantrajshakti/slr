import {
  TaskFormData,
  taskSchema,
  type Action,
  type TaskWithCreator,
} from "~/pages/tasks";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "react-toastify";
import { api } from "~/utils/api";
import { toastOptions } from "~/constants/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { inter } from "~/pages/_app";
import CrossIcon from "./icons/crossIcon";

interface TaskDialogProps {
  action: Action;
  userNames: string[];
  taskToView: TaskWithCreator;
  setTasksList: React.Dispatch<React.SetStateAction<TaskWithCreator[]>>;
  clearAction: () => void;
}

const TaskDialog = ({
  action,
  userNames,
  taskToView,
  setTasksList,
  clearAction,
}: TaskDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>();
  const session = useSession();
  const utils = api.useUtils();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: "onChange",
    defaultValues: {
      description: "",
      deadline: "",
      priority: "MEDIUM",
      status: "TODO",
      tags: [],
      assignees: "",
    },
  });

  useEffect(() => {
    if (taskToView.id && (action.mode === "edit" || action.mode === "view")) {
      const deadline = new Date(taskToView.deadline || Date.now())
        .toISOString()
        .split("T")[0];

      form.setValue("title", taskToView.title);
      form.setValue("description", taskToView.description || "");
      form.setValue("priority", taskToView.priority);
      form.setValue("status", taskToView.status);
      form.setValue("tags", taskToView.tags);
      form.setValue("assignees", taskToView.assignees.join(","));
      form.setValue("deadline", deadline);
      form.clearErrors("title");
    }

    if (!action.mode) {
      form.setValue("title", "");
      form.setValue("description", "");
      form.setValue("priority", "MEDIUM");
      form.setValue("status", "TODO");
      form.setValue("tags", []);
      form.setValue("assignees", "");
      form.setValue("deadline", "");
      form.clearErrors("title");
    }
  }, [taskToView, action]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        assignees: data.assignees
          ? data.assignees.split(",").map((m) => m.trim())
          : [],
      };

      let result: TaskWithCreator = {} as TaskWithCreator;
      const { mode } = action;

      if (mode === "create") {
        result = (await utils.client.tasks.createTask.mutate(
          taskData,
        )) as TaskWithCreator;
      } else {
        result = (await utils.client.tasks.updateTask.mutate({
          id: taskToView.id,
          ...taskData,
        })) as TaskWithCreator;
      }

      if (!result.id) {
        throw new Error("");
      }

      result.createdBy = {
        name: session?.data?.user?.name || "",
      };

      if (mode === "create") {
        setTasksList((prevTask) => [...prevTask, result]);
        toast.success("Task created successfully!", toastOptions);
      } else {
        setTasksList((prevTask) =>
          prevTask.map((task) => {
            if (task.id !== result.id) return task;
            else return result;
          }),
        );
        toast.success("Task updated successfully!", toastOptions);
      }

      form.reset();
      clearAction();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      // console.error("Error creating task:", errorMessage);
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
    if (!deleteTaskId) return;

    const deleteTask = async () => {
      try {
        const result = await utils.client.tasks.deleteTask.mutate({
          id: deleteTaskId,
        });

        if (!result.id) {
          throw new Error("");
        }

        setTasksList((prevList) =>
          prevList.filter((task) => task.id !== deleteTaskId),
        );
        clearAction();
        setDeleteTaskId("");
        toast.success("Task deleted successfully!", toastOptions);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        // console.error("Error creating task:", errorMessage);
        toast.error(
          errorMessage || "Failed to create task. Please try again.",
          toastOptions,
        );
      }
    };

    deleteTask();
  }, [deleteTaskId, clearAction]);

  let submitBtnMessage = "";

  if (action.mode === "view") {
    submitBtnMessage = "Can't update";
  } else if (action.mode === "edit") {
    submitBtnMessage = "Update details";
  } else if (form.formState.isSubmitting) {
    submitBtnMessage = "Submitting...";
  } else {
    submitBtnMessage = "Create";
  }

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
      <Dialog
        open={isDialogOpen}
        onOpenChange={(val) => {
          setIsDialogOpen(val);
          clearAction();
        }}
      >
        <DialogContent
          aria-describedby={undefined}
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
                      <Input type="date" {...field} />
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
                        {(field.value || "")?.split(",").map(
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
                                  <CrossIcon />
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
                                <CrossIcon />
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
                disabled={form.formState.isSubmitting || action.mode === "view"}
              >
                {submitBtnMessage}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskDialog;
