import { useAuth } from "@clerk/react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/feature/auth/store";
import { Commonloader } from "../common/Loader";

export function PublicOnlyLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isBootstrapped, status, user } = useAuthStore();

  if (!isLoaded) {
    return <Commonloader text="Checking authentication..." />;
  }

  if (
    isSignedIn &&
    (!isBootstrapped || status === "loading")
  ) {
    return <Commonloader text="Loading your account..." />;
  }

  if (isSignedIn) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
}
