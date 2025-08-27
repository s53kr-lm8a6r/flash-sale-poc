"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Returns the stored buyer name, or null if not set (client-only). */
export function getBuyerName(): string | null {
  if (typeof window === "undefined") return null;
  const name = localStorage.getItem("buyerName");
  return name && name.length > 0 ? name : null;
}

/** Redirects to /login if not authenticated. Returns buyerName when available. */
export function useRequireAuth(): string | null {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const buyer = getBuyerName();
    if (!buyer) {
      router.replace("/login");
      return;
    }
    setName(buyer);
  }, [router]);

  return name;
}

/** Redirects to /sales if already authenticated (guest-only pages). */
export function useGuestRedirect(): void {
  const router = useRouter();
  useEffect(() => {
    const buyer = getBuyerName();
    if (buyer) router.replace("/sales");
  }, [router]);
}
