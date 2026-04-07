"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useCurrentUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) {
          if (active) setUser(null);
          if (res.status === 401) {
            router.push("/login");
          }
        } else {
          const data = await res.json();
          if (active) setUser(data.user || null);
          if (data.user?.passwordResetRequired) {
            router.push("/reset-password");
          }
        }
      } catch (error) {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUser();

    return () => {
      active = false;
    };
  }, [router]);

  return { user, setUser, loading };
}
