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

## API Endpoints

The app uses tRPC for API communication. Key procedures are defined in `src/server/api/routers/tasks.ts`:

- **Create Task**: `createTask` - Creates a new task.
- **Update Task**: `updateTask` - Updates an existing task by ID.
- **Delete Task**: `deleteTask` - Deletes a task by ID.
- **Get All Tasks**: `getAllTasks` - Fetches all tasks.

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
