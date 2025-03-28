# Task Management App

This is a task management application built with the [T3 Stack](https://create.t3.gg/), a modern full-stack TypeScript framework. It leverages Next.js, tRPC, Prisma, NextAuth.js, and Tailwind CSS to provide a robust and scalable solution for managing tasks.

**[Live Demo](https://d2m2bjlc4yel68.cloudfront.net/)**

## Features

- Create, edit, view, and delete tasks with a user-friendly interface.
- Authentication with NextAuth.js.
- Real-time API with tRPC for seamless client-server communication.
- Task management with priorities, statuses, tags, and assignees.
- Responsive design powered by Tailwind CSS.
- Database persistence with Prisma and PostgreSQL.

## Tech Stack

- **[Next.js](https://nextjs.org)**: React framework for server-side rendering and static site generation.
- **[NextAuth.js](https://next-auth.js.org)**: Authentication for Next.js applications.
- **[Prisma](https://prisma.io)**: ORM for database interactions with PostgreSQL.
- **[tRPC](https://trpc.io)**: End-to-end typesafe APIs.
- **[Tailwind CSS](https://tailwindcss.com)**: Utility-first CSS framework.
- **[React Hook Form](https://react-hook-form.com)**: Form handling with validation.
- **[Zod](https://zod.dev)**: TypeScript-first schema validation.
- **[Zustand](https://github.com/pmndrs/zustand)**: Lightweight state management.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org) (v18 or later)
- [npm](https://www.npmjs.com) (v9 or later)
- [PostgreSQL](https://www.postgresql.org) (v14 or later)
- [Git](https://git-scm.com)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` file to `.env` and fill in the required values:

```env
# Database connection (update with your PostgreSQL credentials)
DATABASE_URL="postgresql://postgres:password@localhost:5432/your-db-name"

# NextAuth configuration
NEXTAUTH_SECRET="your-secret-key" # Generate with `openssl rand -base64 32`
NEXTAUTH_URL="http://localhost:3000" # Update to your production URL in deployment

# AWS credentials (for deployment, if applicable)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
```

### 4. Set Up the Database

Push the Prisma schema to your database:

```bash
npm run db:push
```

Optionally, use Prisma Studio to inspect your database:

```bash
npm run db:studio
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check code quality.
- `npm run db:push`: Syncs the Prisma schema with the database.
- `npm run db:studio`: Opens Prisma Studio.
- `npm run test`: Runs Jest tests (see [Testing](#testing)).

## Project Structure

```
├── .env.example           # Example environment variables
├── .github/workflows/     # GitHub Actions workflows
│   └── deploy.yml         # Deployment configuration
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma
├── public/                # Static assets
│   ├── 404.gif
│   └── favicon.ico
├── src/
│   ├── components/        # Reusable React components
│   │   ├── taskDialog.tsx # Task creation/edit/view dialog
│   │   ├── taskTable.tsx  # Task list table
│   │   └── ui/            # ShadCN UI components
│   ├── constants/         # App constants (e.g., toast options)
│   ├── pages/             # Next.js pages
│   │   ├── api/           # API routes (tRPC and NextAuth)
│   │   ├── index.tsx      # Home page
│   │   └── tasks.tsx      # Tasks page
│   ├── server/            # Server-side logic
│   │   ├── api/           # tRPC API routers
│   │   │   ├── routers/
│   │   │   │   ├── auth.ts
│   │   │   │   └── tasks.ts
│   │   └── db.ts          # Database configuration
│   ├── stores/            # Zustand stores
│   ├── styles/            # Global CSS (Tailwind)
│   └── utils/             # Utility functions (e.g., API helpers)
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## API Documentation

The application uses [tRPC](https://trpc.io) for type-safe API communication between the client and server. The API is defined in `src/server/api/routers/tasks.ts` and is protected by authentication via NextAuth.js (using `protectedProcedure`). Below are the available endpoints and how to use them.

### Task Router (`taskRouter`)

The `taskRouter` provides the following procedures for managing tasks and users:

#### 1. `getAllUsers`

- **Type**: Query
- **Description**: Retrieves a list of all user names in the system. Useful for populating assignee dropdowns.
- **Input**: None
- **Output**: `string[]` - An array of user names.
- **Example Usage** (Client-side):

  ```typescript
  import { api } from "~/utils/api";

  const { data: userNames, isLoading } = api.tasks.getAllUsers.useQuery();
  console.log(userNames); // ["User One", "User Two", ...]
  ```

#### 2. `getAllTasks`

- **Type**: Query
- **Description**: Fetches all tasks with their creator's name. Returns a list of tasks including details like title, description, priority, etc.
- **Input**: None
- **Output**: `TaskWithCreator[]` - An array of task objects with the following shape:
  ```typescript
  interface TaskWithCreator {
    id: string;
    title: string;
    description: string | null;
    deadline: Date | null;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status: "TODO" | "DONE" | "PENDING" | "ONGOING";
    tags: (
      | "DEVELOPMENT"
      | "DESIGN"
      | "TESTING"
      | "REVIEW"
      | "BUG"
      | "FEATURE"
    )[];
    assignees: string[];
    createdAt: Date;
    updatedAt: Date;
    createdById: string;
    createdBy: { name: string };
  }
  ```
- **Example Usage** (Client-side):

  ```typescript
  import { api } from "~/utils/api";

  const { data: tasks, isLoading } = api.tasks.getAllTasks.useQuery();
  console.log(tasks); // [{ id: "1", title: "Test Task", createdBy: { name: "User One" }, ... }, ...]
  ```

#### 3. `createTask`

- **Type**: Mutation
- **Description**: Creates a new task. The task is associated with the authenticated user (via `createdById`).
- **Input**:
  ```typescript
  {
    title: string; // Required, min length 1
    description?: string; // Optional
    deadline?: Date; // Optional
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; // Defaults to "MEDIUM"
    status?: "TODO" | "DONE" | "PENDING" | "ONGOING"; // Defaults to "TODO"
    tags?: ("DEVELOPMENT" | "DESIGN" | "TESTING" | "REVIEW" | "BUG" | "FEATURE")[]; // Optional
    assignees?: string[]; // Optional, array of user emails or names
  }
  ```
- **Output**: The created `Task` object (matches `TaskWithCreator` but without `createdBy` relation).
- **Example Usage** (Client-side):

  ```typescript
  import { api } from "~/utils/api";

  const mutation = api.tasks.createTask.useMutation({
    onSuccess: (newTask) => {
      console.log("Task created:", newTask);
    },
  });

  mutation.mutate({
    title: "New Task",
    description: "Task description",
    deadline: new Date("2025-04-01"),
    priority: "HIGH",
    status: "TODO",
    tags: ["DEVELOPMENT"],
    assignees: ["user1@example.com"],
  });
  ```

#### 4. `updateTask`

- **Type**: Mutation
- **Description**: Updates an existing task by its ID. Only the task's creator can update it (implicitly enforced by session).
- **Input**:
  ```typescript
  {
    id: string; // Required, task ID to update
    title: string; // Required, min length 3
    description?: string; // Optional
    deadline?: Date; // Optional
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; // Defaults to "MEDIUM"
    status?: "TODO" | "DONE" | "PENDING" | "ONGOING"; // Defaults to "TODO"
    tags?: ("DEVELOPMENT" | "DESIGN" | "TESTING" | "REVIEW" | "BUG" | "FEATURE")[]; // Optional
    assignees?: string[]; // Optional
  }
  ```
- **Output**: The updated `Task` object.
- **Example Usage** (Client-side):

  ```typescript
  import { api } from "~/utils/api";

  const mutation = api.tasks.updateTask.useMutation({
    onSuccess: (updatedTask) => {
      console.log("Task updated:", updatedTask);
    },
  });

  mutation.mutate({
    id: "task-id-123",
    title: "Updated Task",
    priority: "URGENT",
    status: "ONGOING",
  });
  ```

#### 5. `deleteTask`

- **Type**: Mutation
- **Description**: Deletes a task by its ID. Only the task's creator can delete it (implicitly enforced by session).
- **Input**:
  ```typescript
  {
    id: string; // Required, task ID to delete
  }
  ```
- **Output**:
  ```typescript
  {
    id: string; // Deleted task ID
    message: string; // Success message
  }
  ```
- **Example Usage** (Client-side):

  ```typescript
  import { api } from "~/utils/api";

  const mutation = api.tasks.deleteTask.useMutation({
    onSuccess: (result) => {
      console.log(result.message); // "Task deleted successfully"
    },
  });

  mutation.mutate({ id: "task-id-123" });
  ```

### Authentication

All procedures are protected (`protectedProcedure`), meaning they require an authenticated user session via NextAuth.js. The session is available in the `ctx.session` object, which provides the user's `email` to link tasks to their creator.

### Client-Side Integration

The tRPC client is set up in `src/utils/api.ts`. Import and use it as shown in the examples above. The `useQuery` hook is used for queries (`getAllUsers`, `getAllTasks`), and `useMutation` is used for mutations (`createTask`, `updateTask`, `deleteTask`).

#### Example Component

```typescript
import { api } from "~/utils/api";

export const TaskList = () => {
  const { data: tasks, isLoading } = api.tasks.getAllTasks.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (!tasks) return <div>No tasks found</div>;

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title} - {task.createdBy.name}</li>
      ))}
    </ul>
  );
};
```

---

## API Documentation - Summaries

The application uses [tRPC](https://trpc.io) for type-safe API communication. The API is defined in `src/server/api/routers/tasks.ts` and requires authentication via NextAuth.js.

### Available Endpoints

#### `getAllUsers`

- **Type**: Query
- **Description**: Fetches all user names.
- **Returns**: `string[]`
- **Usage**: `api.tasks.getAllUsers.useQuery()`

#### `getAllTasks`

- **Type**: Query
- **Description**: Fetches all tasks with creator details.
- **Returns**: `TaskWithCreator[]`
- **Usage**: `api.tasks.getAllTasks.useQuery()`

#### `createTask`

- **Type**: Mutation
- **Description**: Creates a new task.
- **Input**: `{ title: string, description?: string, deadline?: Date, priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT", status?: "TODO" | "DONE" | "PENDING" | "ONGOING", tags?: string[], assignees?: string[] }`
- **Returns**: Created task object
- **Usage**: `api.tasks.createTask.useMutation()`

#### `updateTask`

- **Type**: Mutation
- **Description**: Updates an existing task.
- **Input**: `{ id: string, title: string, description?: string, deadline?: Date, priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT", status?: "TODO" | "DONE" | "PENDING" | "ONGOING", tags?: string[], assignees?: string[] }`
- **Returns**: Updated task object
- **Usage**: `api.tasks.updateTask.useMutation()`

#### `deleteTask`

- **Type**: Mutation
- **Description**: Deletes a task by ID.
- **Input**: `{ id: string }`
- **Returns**: `{ id: string, message: string }`
- **Usage**: `api.tasks.deleteTask.useMutation()`

### Client-Side Usage

## Import the tRPC client from `~/utils/api` and use hooks like `useQuery` for queries and `useMutation` for mutations. See the [tRPC documentation](https://trpc.io/docs) for more details.

### Notes

- **Type Safety**: The examples leverage tRPC's type inference, so the client automatically knows the input/output shapes.
- **Error Handling**: Add `onError` callbacks to mutations for better UX (e.g., showing toast notifications).
- **Adjustments**: If your `TaskWithCreator` type differs slightly, update the documentation accordingly.

This should give developers a clear understanding of how to interact with your API! Let me know if you need more details or examples.

Authentication is handled via NextAuth at `/api/auth`.

## Deployment

The app is deployed on AWS CloudFront: [Live Link](https://d2m2bjlc4yel68.cloudfront.net/).

### Deploying with SST

1. Update `.env` with production values:

   ```env
   NEXTAUTH_URL="https://d2m2bjlc4yel68.cloudfront.net"
   DATABASE_URL="postgresql://[production-db-credentials]"
   ```

2. Configure `sst.config.ts` with AWS credentials.

3. Deploy:
   ```bash
   npx sst deploy
   ```

### Alternative Deployments

- **[Vercel](https://create.t3.gg/en/deployment/vercel)**: Simple deployment with Next.js support.
- **[Docker](https://create.t3.gg/en/deployment/docker)**: Containerized deployment.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## Learn More

- [T3 Stack Documentation](https://create.t3.gg/)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- Join the [T3 Discord](https://t3.gg/discord) for help.

## License

This project is licensed under the MIT License.
