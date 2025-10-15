"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setShowResendOption(false);

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success("Login successful", {
            description: "Redirecting to dashboard...",
          });
          router.push("/dashboard");
        },
        onError: (error) => {
          // Handle email verification required error
          const errorMessage = error.error.message.toLowerCase();
          if (
            errorMessage.includes("email verification") ||
            errorMessage.includes("verify") ||
            errorMessage.includes("email not verified") ||
            errorMessage.includes("not verified")
          ) {
            setUserEmail(data.email);
            setShowResendOption(true);
            toast.error("Email verification required", {
              description:
                "A new verification email has been sent. Please check your inbox or resend the verification email and verify your account.",
            });
          } else {
            toast.error("Login failed", {
              description: error.error.message,
            });
          }
        },
      }
    );

    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    if (!userEmail) return;

    setIsLoading(true);
    try {
      await authClient.sendVerificationEmail({
        email: userEmail,
        callbackURL: "/login",
      });
      toast.success("Verification email sent", {
        description: "Please check your inbox for the verification link.",
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      toast.error("Failed to send verification email", {
        description: "Please try again later.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-xl border-0 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Welcome back
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-balance">
                  Access your secure banking portal
                </p>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm">
                  <p className="text-green-800 dark:text-green-200">
                    💡 Need to verify your email? Check your inbox for the
                    verification link.
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              {showResendOption && (
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    <div className="flex flex-col gap-3">
                      <p className="font-medium">
                        📧 Email verification required
                      </p>
                      <p>
                        A verification email has been sent to{" "}
                        <strong>{userEmail}</strong>. Please check your inbox
                        and click the verification link.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                        className="w-fit border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/20"
                      >
                        {isLoading ? "Sending..." : "Resend verification email"}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Register
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/1116302.jpg"
              alt="Image"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
