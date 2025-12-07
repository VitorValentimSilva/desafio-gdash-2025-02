import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Pokedex from "@/pages/Pokedex";
import Layout from "@/components/Layout";
import { getToken } from "@/lib/tokenStorage";
import AuthPage from "@/pages/AuthPage";
import User from "@/pages/User";
import { getUserRoleFromToken } from "@/lib/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const role = getUserRoleFromToken();
    if (role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage isSignup={false} />} />
        <Route path="/signup" element={<AuthPage isSignup={true} />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute requiredRole="admin">
              <Layout>
                <User />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/pokedex"
          element={
            <Layout>
              <Pokedex />
            </Layout>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
