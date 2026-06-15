"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/app/admin/actions";

export function useLoginRedirect(state: ActionState) {
  const router = useRouter();

  useEffect(() => {
    if (!state.redirectTo) {
      return;
    }

    router.push(state.redirectTo);
    router.refresh();
  }, [state.redirectTo, router]);
}
