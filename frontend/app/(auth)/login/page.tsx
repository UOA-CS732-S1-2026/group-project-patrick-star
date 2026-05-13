import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { getAuthErrorMessage } from "@/lib/auth/messages";

type LoginPageProps = {
  searchParams?: Promise<{
    auth_error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const authErrorMessage = getAuthErrorMessage(resolvedSearchParams.auth_error);

  return (
    <AuthSplitLayout
      rightPanel={
        <div className="mx-auto flex w-full max-w-[400px] flex-col px-2">
          <h1 className="text-center text-[30px] font-bold leading-tight text-[#222]">
            Sign In
          </h1>
          <p className="mt-3 text-center text-[14px] text-[#666]">
            Continue with Auth0 Universal Login.
          </p>
          {authErrorMessage ? (
            <p className="mt-4 rounded-[10px] bg-[#fff2f2] px-4 py-3 text-center text-[13px] font-medium text-[#c24141]">
              {authErrorMessage}
            </p>
          ) : null}
          <div className="mt-10 flex flex-col gap-4">
            <a
              href="/auth/login"
              className="flex h-11 items-center justify-center rounded-[12px] bg-[#73cf1f] px-5 text-[14px] font-semibold text-white shadow-[0_4px_10px_rgba(115,207,31,0.28)] transition hover:bg-[#67c018]"
            >
              Continue to login
            </a>
            <p className="text-center text-[13px] font-semibold text-[#1f1f1f]">
              Need an account?{" "}
              <a href="/signup" className="text-[#73cf1f]">
                Sign up
              </a>
            </p>
          </div>
        </div>
      }
    />
  );
}
