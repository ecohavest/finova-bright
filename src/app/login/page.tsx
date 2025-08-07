import { LoginForm } from "@/components/login-form";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await serverAuth();
  if (user && user.role === "admin") {
    return redirect("/admin");
  }
  if (user) {
    return redirect("/dashboard");
  }
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent tracking-tight mb-2">
            Finova Bright Bank
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base font-medium">
            Secure • Trusted • Excellence in Banking
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
