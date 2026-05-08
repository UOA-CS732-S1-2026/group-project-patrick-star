"use client";

import type { ReactNode } from "react";
import { cn } from "../ui/cn";

interface AuthSplitLayoutProps {
  leftPanel?: ReactNode;
  rightPanel: ReactNode;
  leftPanelClassName?: string;
  rightPanelClassName?: string;
}

export function AuthSplitLayout({
  leftPanel,
  rightPanel,
  leftPanelClassName,
  rightPanelClassName,
}: AuthSplitLayoutProps) {
  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        <section
          className={cn(
            "relative hidden min-h-screen overflow-hidden bg-[#edf9ec] md:block",
            leftPanelClassName
          )}
        >
          {leftPanel}
        </section>
        <section
          className={cn(
            "relative min-h-screen border-l-0 border-[#3697ff] bg-white px-6 py-10 sm:px-10 md:border-l-2 md:px-12",
            rightPanelClassName
          )}
        >
          {rightPanel}
        </section>
      </div>
    </main>
  );
}
