"use client";

import { useEffect, useState } from "react";

/**
 * Whisper-thin gilded reading progress hairline pinned to the top viewport
 * edge on long-form posts. Uses a GPU-composited scaleX transform and hides
 * cleanly in print.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const computeProgress = () => {
      frameId = 0;
      const target = document.querySelector<HTMLElement>(
        `#${CSS.escape(targetId)}`
      );
      if (!target) {
        setProgress(0);
        return;
      }

      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollableDistance = rect.height - viewportHeight * 0.65;

      if (scrollableDistance <= 0) {
        setProgress(rect.top <= viewportHeight * 0.35 ? 1 : 0);
        return;
      }

      const scrolled = Math.max(0, -rect.top + viewportHeight * 0.15);
      const next = Math.min(1, Math.max(0, scrolled / scrollableDistance));
      setProgress(next);
    };

    const scheduleUpdate = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(computeProgress);
      }
    };

    computeProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="reading-progress-track print:hidden">
      <div
        className="reading-progress-bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
