import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { hashPassword, verifyPassword } from "~/utils/auth";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      name: string;
      email: string;
      // ...other properties
      // role: UserRole;
    };
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user?.id,
      },
    }),
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "name" },
        password: { label: "Password", type: "password" },
        isLogginIn: { label: "IsLogginIn", type: "boolean" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        const prisma = new PrismaClient();

        const isLogginIn = credentials.isLogginIn === "true";
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (isLogginIn && !user) {
          throw new Error("User not found! Please signup");
        }

        if (!isLogginIn && user) {
          throw new Error("User already exists! Please signin");
        }

        if (!isLogginIn) {
          // Sign-up case
          const hashedPass = await hashPassword(credentials.password);
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name,
              passwordHash: hashedPass,
            },
          });

          if (!newUser.id) {
            throw new Error(
              "Error occurred while signup! \nPlease try after sometime",
            );
          }

          return { id: newUser.id, name: newUser.name, email: newUser.email };
        }

        // Sign-in case
        if (user) {
          const isValid = await verifyPassword(
            credentials.password,
            user.passwordHash,
          );
          if (!isValid) {
            throw new Error("Invalid credentials!");
          }
          return { id: user.id, name: user.name, email: user.email };
        }

        throw new Error("Something went wrong! \nPlease try after sometime");
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
