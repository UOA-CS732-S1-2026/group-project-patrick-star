"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { useAuth, getFriendlyAuthError } from "@/components/auth/AuthProvider";
import { AuthField } from "@/components/ui/AuthField";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((value) => value.includes("@"), "Email must contain @"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full p-1 text-[#8c8c8c] transition hover:bg-neutral-100 hover:text-[#5a5a5a]"
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M3 3l18 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10.6 10.7a2.5 2.5 0 103.5 3.53"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M6.7 6.8A10.4 10.4 0 0012 18.2c4.5 0 8.2-3 10.3-6.2a18.9 18.9 0 00-3.6-4.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="2.6"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, session } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [router, session]);

  async function onSubmit(values: LoginValues) {
    try {
      await login(values);
      router.replace("/");
    } catch (error) {
      setError("root", {
        type: "server",
        message: getFriendlyAuthError(error, "login"),
      });
    }
  }

  const rootError = errors.root?.message;

  return (
    <AuthSplitLayout
      leftPanel={<div className="h-full" />}
      rightPanel={
        <div className="mx-auto flex w-full max-w-[400px] flex-col justify-start px-2 pt-20">
          <h1 className="text-center text-[30px] font-bold leading-tight text-[#222]">
            Sign In
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-10 flex flex-col gap-6"
          >
            {rootError ? (
              <p className="rounded-xl border border-[#ffb5af] bg-[#fff5f4] px-3 py-2 text-sm text-[#d64b40]">
                {rootError}
              </p>
            ) : null}

            <AuthField
              id="login-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              errorText={errors.email?.message}
              {...register("email")}
            />

            <AuthField
              id="login-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              errorText={errors.password?.message}
              trailing={
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                />
              }
              {...register("password")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 h-11 rounded-[12px] bg-[#73cf1f] px-5 text-[14px] font-semibold text-white shadow-[0_4px_10px_rgba(115,207,31,0.28)] transition hover:bg-[#67c018] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Log in"}
            </button>

            <p className="text-center text-[13px] font-semibold text-[#1f1f1f]">
              Are you a new user?{" "}
              <Link href="/signup" className="text-[#73cf1f]">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      }
    />
  );
}
