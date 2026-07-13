import { createBrowserRouter } from "react-router-dom";
import { ProtectedLayout } from "./components/auth/ProtectedLayout";
import { PublicOnlyLayout } from "./components/auth/PublicOnlyLayout";
import { RoleGuardLayout } from "./components/auth/RoleGuardLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { CustomerLayout } from "./components/layout/CustomerLayout";
import { SignInPage } from "./pages/auth/SignIn";
import { SignUpPage } from "./pages/auth/SignUp";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { StoreHome } from "./pages/customer/Home";
import { CustomerProfile } from "./pages/customer/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <StoreHome />,
      },
      {
        element: <PublicOnlyLayout />,
        children: [
          {
            path: "sign-in/*",
            element: <SignInPage />,
          },
          {
            path: "sign-up/*",
            element: <SignUpPage />,
          },
        ],
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "profile",
            element: <CustomerProfile />,
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedLayout />,
    children: [
      {
        element: <RoleGuardLayout allow={["admin"]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <AdminDashboard />,
              },
            ],
          },
        ],
      },
    ],
  },
]);