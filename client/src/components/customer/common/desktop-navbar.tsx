import { useAuth, useClerk } from "@clerk/react";
import { useAuthStore } from "@/feature/auth/store";
import { Link, useNavigate } from "react-router-dom";

export function CustomerNavbar() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    clearAuth();
    navigate("/", { replace: true });
  }

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-semibold">
          E-Shopify
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/">Home</Link>

          {isLoaded && isSignedIn ? (
            <>
              {user?.role === "admin" && <Link to="/admin">Admin</Link>}
              <Link to="/profile">Profile</Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            isLoaded && <Link to="/sign-in">Sign in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
