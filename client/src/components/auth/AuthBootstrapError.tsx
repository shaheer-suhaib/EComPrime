type AuthBootstrapErrorProps = {
  message?: string | null;
};

export function AuthBootstrapError({
  message,
}: AuthBootstrapErrorProps) {
  function retry() {
    window.location.reload();
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">
          We could not load your account
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {message || "Please check your connection and try again."}
        </p>

        <button
          type="button"
          onClick={retry}
          className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}