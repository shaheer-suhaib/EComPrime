import { SignIn } from "@clerk/react";

export function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold">Sign In</h1>
      <div className="w-full max-w-md">
        <SignIn />
      </div>
     
    </div>
  );
}