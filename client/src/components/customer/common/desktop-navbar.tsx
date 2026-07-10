import { Link } from "react-router-dom";

export function CustomerNavbar() {
  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-semibold">
          E-Shopify
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/sign-in">Sign in</Link>
        </div>
      </nav>
    </header>
  );
}
