import type { ReactNode } from "react";
import { ProgressBar } from "../ui/ProgressBar";

interface OnboardingShellProps {
  step: number;
  totalSteps: number;
  stepLabel: string;
  left?: ReactNode;
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
  children,
}: OnboardingShellProps) {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="grid min-h-screen grid-cols-2 bg-background">
      <section className="flex flex-col px-16 py-14">
        <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground">
          STEP {step} OF {totalSteps} — {stepLabel.toUpperCase()}
        </div>
        <ProgressBar value={progress} className="max-w-xs" />
        <div className="mt-16 flex flex-1 items-start justify-center">
          {left}
        </div>
      </section>
      <section className="flex flex-col items-start px-16 py-14">
        {children}
      </section>
    </div>
  );
}
