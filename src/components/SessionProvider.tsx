"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SessionUser = { id: string; name: string; role: "USER" | "AGENT" | "ADMIN" };

type Ctx = {
  user: SessionUser | null;
  loaded: boolean;
  favoriteIds: Set<string>;
  toggleFavorite: (propertyId: string) => Promise<"added" | "removed" | "login">;
};

const SessionContext = createContext<Ctx | null>(null);

/**
 * Session state is loaded client-side so that public pages stay cacheable/static
 * while still showing the signed-in menu and saved-property hearts.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    fetch("/api/me/", { credentials: "same-origin", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null, favoriteIds: [] }))
      .then((d: { user: SessionUser | null; favoriteIds: string[] }) => {
        if (!alive) return;
        setUser(d.user);
        setFavoriteIds(new Set(d.favoriteIds));
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!user) return "login" as const;
      const has = favoriteIds.has(propertyId);
      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (has) next.delete(propertyId);
        else next.add(propertyId);
        return next;
      });
      const res = await fetch("/api/favorites/", {
        method: has ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      if (res.status === 401) {
        setUser(null);
        return "login" as const;
      }
      if (!res.ok) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (has) next.add(propertyId);
          else next.delete(propertyId);
          return next;
        });
      }
      return has ? ("removed" as const) : ("added" as const);
    },
    [user, favoriteIds],
  );

  const value = useMemo(() => ({ user, loaded, favoriteIds, toggleFavorite }), [user, loaded, favoriteIds, toggleFavorite]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Ctx {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
