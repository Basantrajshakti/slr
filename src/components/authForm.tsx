"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button, buttonVariants } from "~/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { toast } from "react-toastify";

// Define Zod schemas
const signInSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Infer types from schemas
type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

interface AuthFormProps {
  login?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ login }) => {
  const schema = login ? signInSchema : signUpSchema;

  // Initialize the form with React Hook Form
  const form = useForm<SignInFormData | SignUpFormData>({
    resolver: zodResolver(schema),
    mode: "onChange", // Real-time validation
    defaultValues: login
      ? { email: "", password: "" }
      : { name: "", email: "", password: "" },
  });

  // Submit handler
  const onSubmit = async (data: SignInFormData | SignUpFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log("Form submitted:", data);

    // Show success toast with react-toastify
    toast.success(<div>{`${login ? "Sign In" : "Sign Up"} Successful!`}</div>, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-center text-2xl font-extrabold tracking-tight  sm:text-3xl">
              {login ? "Sign In" : "Sign Up"}
            </h1>
          </CardTitle>
          <CardDescription className="text-center">
            {login
              ? "Enter your credentials to sign in"
              : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-4">
              {!login && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          aria-invalid={
                            "name" in form.formState.errors &&
                            form.formState.errors.name
                              ? "true"
                              : "false"
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        aria-invalid={
                          form.formState.errors.email ? "true" : "false"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••"
                        {...field}
                        aria-invalid={
                          form.formState.errors.password ? "true" : "false"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Submitting..."
                  : login
                    ? "Sign In"
                    : "Sign Up"}
              </Button>
              <div className="text-center text-sm">
                {login ? (
                  <p>
                    Don’t have an account?{" "}
                    <Link
                      href="/signup"
                      className={buttonVariants({ variant: "link" })}
                    >
                      Sign Up
                    </Link>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <Link
                      href="/signin"
                      className={buttonVariants({ variant: "link" })}
                    >
                      Sign In
                    </Link>
                  </p>
                )}
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default AuthForm;
