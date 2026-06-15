"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const STORAGE_PREFIX = "prediction-scroll:";

function storageKey() {
  return `${STORAGE_PREFIX}${window.location.pathname}`;
}

export function PredictionScrollRestorer() {
  const [isRestoring, setIsRestoring] = useState(true);

  useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem(storageKey());
    if (!savedScroll) {
      queueMicrotask(() => {
        setIsRestoring(false);
      });
      return;
    }

    sessionStorage.removeItem(storageKey());
    const top = Number(savedScroll);

    if (!Number.isFinite(top)) {
      queueMicrotask(() => {
        setIsRestoring(false);
      });
      return;
    }

    window.scrollTo({ top, behavior: "smooth" });
    window.setTimeout(() => {
      setIsRestoring(false);
    }, 250);
  }, []);

  useEffect(() => {
    function handleSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.preserveScroll !== "true") return;

      sessionStorage.setItem(storageKey(), String(window.scrollY));
    }

    document.addEventListener("submit", handleSubmit, true);
    return () => {
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  if (!isRestoring) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#fffaf0]/70 text-[#151515] backdrop-blur-[2px]">
      <div className="grid justify-items-center text-center">
        <span className="worldcup-saving-spinner" aria-hidden="true" />
      </div>
    </div>
  );
}
