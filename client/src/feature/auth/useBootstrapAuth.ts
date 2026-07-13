import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { setApiTokenGetter } from "@/lib/api";
import { getMe, syncUser } from "./api";
import { useAuthStore } from "./store";

export function useBootstrapAuth() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { setLoading, setUser, clearAuth, setError } = useAuthStore();

  useEffect(() => {
    setApiTokenGetter(async () => {
      const token = await getToken();
      return token ?? null;
    });

    return () => {
      setApiTokenGetter(null);
    };
  }, [getToken]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        clearAuth();
        return;
      }

      try {
        setLoading();

        await syncUser();

        if (cancelled) {
          return;
        }

        const response = await getMe();

        if (cancelled) {
          return;
        }

        setUser(response.user);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to initialize authentication.";

        setError(message);
      }
    }

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    isSignedIn,
    clearAuth,
    setError,
    setLoading,
    setUser,
  ]);
}