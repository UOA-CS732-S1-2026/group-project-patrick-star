import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export default function SignUpPage() {
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
          <p className="mt-3 text-center text-[14px] text-[#666]">
            Continue with Auth0 Universal Login.
          </p>
          <div className="mt-10 flex flex-col gap-4">
            <a
              href="/auth/login"
              className="flex h-11 items-center justify-center rounded-[12px] bg-[#73cf1f] px-5 text-[14px] font-semibold text-white shadow-[0_4px_10px_rgba(115,207,31,0.28)] transition hover:bg-[#67c018]"
            >
              Continue to sign up
            </a>
            <p className="text-center text-[13px] font-semibold text-[#1f1f1f]">
              Already a User?{" "}
              <a href="/login" className="text-[#73cf1f]">
                Login
              </a>
            </p>
          </div>
        </div>
      }
    />
  );
}
