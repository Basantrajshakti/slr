import { type Action, type TaskWithCreator } from "~/pages/tasks";
import { Button } from "./ui/button";

const TaskTable = ({
  tasks,
  setAction,
}: {
  tasks: TaskWithCreator[];
  setAction: React.Dispatch<React.SetStateAction<Action>>;
}) => {
  return (
    <div className="h-[calc(99vh-62px)] overflow-x-auto overflow-y-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="!w-[100px] px-4 py-2">Title</th>
            <th className="px-4 py-2">Description</th>
            <th className="min-w-[150px] px-4 py-2">Deadline</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Tags</th>
            <th className="px-4 py-2">Assignees</th>
            <th className="whitespace-nowrap px-4 py-2">Created By</th>
            <th className="min-w-[150px] whitespace-nowrap px-4 py-2">
              Created At
            </th>
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
                {task.deadline ? new Date(task.deadline).toDateString() : "N/A"}
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
                <div className="flex -space-x-2.5">
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
                {new Date(task.createdAt).toDateString()}
              </td>

              {/* Created At */}
              <td className="px-4 py-2">
                <div className="flex gap-2">
                  {/* View button */}
                  <Button
                    onClick={() => {
                      setAction({
                        mode: "view",
                        id: task.id,
                      });
                    }}
                    className="h-8 rounded-full bg-slate-200 p-2 hover:bg-slate-300"
                  >
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
                  <Button
                    onClick={() => {
                      setAction({
                        mode: "edit",
                        id: task.id,
                      });
                    }}
                    className="h-8 rounded-full bg-slate-200 p-2 hover:bg-slate-300"
                  >
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
                  <Button
                    onClick={() => {
                      setAction({
                        mode: "delete",
                        id: task.id,
                      });
                    }}
                    className="h-8 rounded-full bg-slate-200 p-2 hover:bg-slate-300"
                  >
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

export default TaskTable;
