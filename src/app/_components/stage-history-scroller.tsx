"use client";

import { useEffect } from "react";

const STORAGE_PREFIX = "prediction-scroll:";

function hasSavedPredictionScroll() {
  return (
    sessionStorage.getItem(`${STORAGE_PREFIX}${window.location.pathname}`) !== null ||
    document.documentElement.dataset.predictionScrollRestored === "true"
  );
}

export function StageHistoryScroller({ targetId }: { targetId?: string | null }) {
  useEffect(() => {
    if (!targetId || hasSavedPredictionScroll()) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [targetId]);

  return null;
}
