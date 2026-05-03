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

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .refine((value) => value.includes("@"), "Email must contain @"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .superRefine((values, context) => {
    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Password does not match",
      });
    }
  });

type SignUpValues = z.infer<typeof signUpSchema>;

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

export default function SignUpPage() {
  const router = useRouter();
  const { signup, session } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [router, session]);

  async function onSubmit(values: SignUpValues) {
    try {
      await signup({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      router.replace("/");
    } catch (error) {
      setError("root", {
        type: "server",
        message: getFriendlyAuthError(error, "signup"),
      });
    }
  }

  const rootError = errors.root?.message;

  return (
    <AuthSplitLayout
      leftPanel={
        <div className="relative flex h-full items-center justify-center">
          <div className="max-w-[270px] text-center text-[14px] font-semibold leading-7 text-[#232323]">
            <p>Here is just a place holder for images</p>
            <p className="mt-4">my idea is to have different photos or video</p>
            <p className="mt-4">and those photoes will auto-play</p>
          </div>

          <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-3 rounded-full bg-[#d8d8d8] px-5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <span className="h-3 w-3 rounded-full border border-white/90 bg-transparent" />
            <span className="h-3 w-3 rounded-full border border-white/90 bg-transparent" />
            <span className="h-3 w-3 rounded-full border border-white/90 bg-transparent" />
          </div>
        </div>
      }
      rightPanel={
        <div className="mx-auto flex w-full max-w-[400px] flex-col justify-start px-2 pt-16">
          <h1 className="text-center text-[30px] font-bold leading-tight text-[#222]">
            Create Account
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 flex flex-col gap-4"
          >
            {rootError ? (
              <p className="rounded-xl border border-[#ffb5af] bg-[#fff5f4] px-3 py-2 text-sm text-[#d64b40]">
                {rootError}
              </p>
            ) : null}

            <AuthField
              id="signup-name"
              label="Name"
              type="text"
              placeholder="Your name"
              errorText={errors.name?.message}
              {...register("name")}
            />

            <AuthField
              id="signup-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              errorText={errors.email?.message}
              {...register("email")}
            />

            <AuthField
              id="signup-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              errorText={errors.password?.message}
              trailing={
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                />
              }
              {...register("password")}
            />

            <AuthField
              id="signup-confirm-password"
              label="Re-enter Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              errorText={errors.confirmPassword?.message}
              trailing={
                <PasswordToggle
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((value) => !value)}
                />
              }
              {...register("confirmPassword")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 h-11 rounded-[12px] bg-[#73cf1f] px-5 text-[14px] font-semibold text-white shadow-[0_4px_10px_rgba(115,207,31,0.28)] transition hover:bg-[#67c018] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Sign up"}
            </button>

            <p className="text-center text-[13px] font-semibold text-[#1f1f1f]">
              Already a User?{" "}
              <Link href="/login" className="text-[#73cf1f]">
                Login
              </Link>
            </p>
          </form>
        </div>
      }
    />
  );
}
