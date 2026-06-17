"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 60 * 1000;

export function MatchAutoRefresher({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }

    const interval = window.setInterval(refreshWhenVisible, REFRESH_INTERVAL_MS);
    return () => {
      window.clearInterval(interval);
    };
  }, [enabled, router]);

  return null;
}
