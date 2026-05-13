import type { ReactNode } from "react";
import { ProgressBar } from "../ui/ProgressBar";

interface OnboardingShellProps {
  step: number;
  totalSteps: number;
  stepLabel: string;
  left?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * Two-pane onboarding layout: visual preview on the left, form on the right,
 * with a progress bar and step label at the top of the left pane.
 */
export function OnboardingShell({
  step,
  totalSteps,
  stepLabel,
  left,
  contentClassName = "max-w-md",
  children,
}: OnboardingShellProps) {
  const progress = (step / totalSteps) * 100;

  if (!left) {
    return (
      <div className="flex min-h-screen flex-col bg-background px-6 py-10 md:px-16 md:py-14">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            STEP {step} OF {totalSteps} / {stepLabel.toUpperCase()}
          </div>
          <ProgressBar value={progress} />
        </div>
        <section className="flex flex-1 justify-center pt-10 md:pt-16">
          <div className={`w-full ${contentClassName}`}>{children}</div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:grid md:grid-cols-2">
      <section className="flex flex-col px-6 py-10 md:px-16 md:py-14">
        <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground">
          STEP {step} OF {totalSteps} / {stepLabel.toUpperCase()}
        </div>
        <ProgressBar value={progress} className="max-w-xs" />
        <div className="mt-10 flex flex-1 items-start justify-center md:mt-16">
          {left}
        </div>
      </section>
      <section className="flex flex-col items-start px-6 py-10 md:px-16 md:py-14">
        {children}
      </section>
    </div>
  );
}
