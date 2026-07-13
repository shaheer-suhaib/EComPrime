import { useAuth } from "@clerk/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/feature/auth/store";
import { Commonloader } from "../common/Loader";
import { AuthBootstrapError } from "./AuthBootstrapError";

export function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isBootstrapped, status, user, error } = useAuthStore();
  const location = useLocation();

  if (!isLoaded) {
    return <Commonloader text="Checking authentication..." />;
  }

  if (!isSignedIn) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  if (!isBootstrapped || status === "loading") {
    return <Commonloader text="Loading your account..." />;
  }

  if (status === "error") {
    return <AuthBootstrapError message={error} />;
  }

  if (!user) {
    return (
      <AuthBootstrapError message="Your authenticated account could not be loaded." />
    );
  }

  return <Outlet />;
}